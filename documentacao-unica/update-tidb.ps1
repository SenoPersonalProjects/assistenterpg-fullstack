<#
.SYNOPSIS
  Atualiza o TiDB remoto sem apagar o banco.

.DESCRIPTION
  Fluxo nao destrutivo:
  1. Le credenciais e comando TiDB do PRIVATE-OPS.md local.
  2. Testa conexao remota.
  3. Opcionalmente cria backup remoto via mysqldump.
  4. Opcionalmente roda prisma migrate deploy no TiDB.
  5. Roda seeds explicitamente permitidos contra o TiDB.
  6. Valida tabelas, _prisma_migrations e, quando aplicavel, o seed do compendio.

  O script nao versiona nem imprime senhas. Senhas de mysql/mysqldump usam
  --defaults-extra-file temporario. Prisma recebe DATABASE_URL somente via
  variavel de ambiente do processo filho.
#>

[CmdletBinding()]
param(
  [string]$OpsFile = '',
  [string]$RemoteDatabase = 'test',
  [string]$BackDir = 'assistenterpg-back',
  [string[]]$Seeds = @('compendio'),
  [switch]$Migrate,
  [switch]$BackupBefore,
  [string]$BackupDir = 'D:\',
  [switch]$PreflightOnly,
  [switch]$ValidateOnly,
  [string]$ConfirmationText = '',
  [switch]$SkipConnectionTest,
  [switch]$AllowFullSeed
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host ''
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok {
  param([string]$Message)
  Write-Host "OK: $Message" -ForegroundColor Green
}

function Write-Warn {
  param([string]$Message)
  Write-Host "AVISO: $Message" -ForegroundColor Yellow
}

function Write-Fail {
  param([string]$Message)
  Write-Host "ERRO: $Message" -ForegroundColor Red
}

function Convert-MarkdownPath {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $Value
  }

  return $Value.Trim().Trim('"').Trim("'").Replace('\\', '\')
}

function Get-CodeBlockAfterHeading {
  param(
    [string[]]$Lines,
    [string]$HeadingRegex
  )

  $headingIndex = -1
  for ($i = 0; $i -lt $Lines.Count; $i++) {
    if ($Lines[$i] -match $HeadingRegex) {
      $headingIndex = $i
      break
    }
  }

  if ($headingIndex -lt 0) {
    throw "Secao nao encontrada no PRIVATE-OPS.md: $HeadingRegex"
  }

  $start = -1
  for ($i = $headingIndex + 1; $i -lt $Lines.Count; $i++) {
    if ($Lines[$i] -match '^\s*```') {
      $start = $i + 1
      break
    }
  }

  if ($start -lt 0) {
    throw "Bloco de codigo nao encontrado depois da secao: $HeadingRegex"
  }

  $block = New-Object System.Collections.Generic.List[string]
  for ($i = $start; $i -lt $Lines.Count; $i++) {
    if ($Lines[$i] -match '^\s*```') {
      break
    }

    $block.Add($Lines[$i])
  }

  return (($block | ForEach-Object { $_.Trim() } | Where-Object { $_ }) -join "`n").Trim()
}

function Get-OneLineCommandBlock {
  param(
    [string[]]$Lines,
    [string]$HeadingRegex
  )

  $block = Get-CodeBlockAfterHeading -Lines $Lines -HeadingRegex $HeadingRegex
  return (($block -split "`r?`n") | ForEach-Object { $_.Trim() } | Where-Object { $_ }) -join ' '
}

function Remove-OuterQuotes {
  param([string]$Value)
  if ($null -eq $Value) {
    return $null
  }

  $trimmed = $Value.Trim()
  if (
    ($trimmed.StartsWith('"') -and $trimmed.EndsWith('"')) -or
    ($trimmed.StartsWith("'") -and $trimmed.EndsWith("'"))
  ) {
    return $trimmed.Substring(1, $trimmed.Length - 2)
  }

  return $trimmed
}

function Get-CommandOption {
  param(
    [string]$Command,
    [string[]]$Names
  )

  foreach ($name in $Names) {
    $escaped = [regex]::Escape($name)
    $pattern = "(?:^|\s)$escaped(?:=|\s+)(`"[^`"]*`"|'[^']*'|[^\s]+)"
    $options = [System.Text.RegularExpressions.RegexOptions]::None

    if ($name.StartsWith('--')) {
      $options = [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    }

    $match = [regex]::Match($Command, $pattern, $options)
    if ($match.Success) {
      return Remove-OuterQuotes $match.Groups[1].Value
    }
  }

  return $null
}

function Escape-MySqlString {
  param([string]$Value)
  return $Value.Replace("'", "''")
}

function Format-OptionFileValue {
  param([string]$Value)
  $escaped = $Value.Replace('\', '/').Replace('"', '\"')
  return "`"$escaped`""
}

function New-MySqlDefaultsFile {
  param(
    [string]$Path,
    [string]$User,
    [string]$Password,
    [string]$HostName,
    [int]$Port,
    [string]$SslMode,
    [string]$SslCa
  )

  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add('[client]')
  $lines.Add("user=$(Format-OptionFileValue $User)")
  $lines.Add("password=$(Format-OptionFileValue $Password)")
  $lines.Add("host=$(Format-OptionFileValue $HostName)")
  $lines.Add("port=$Port")
  $lines.Add('default-character-set=utf8mb4')

  if ($SslMode) {
    $lines.Add("ssl-mode=$SslMode")
  }

  if ($SslCa) {
    $lines.Add("ssl-ca=$(Format-OptionFileValue $SslCa)")
  }

  $content = ($lines -join "`n") + "`n"
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $content, $utf8NoBom)
}

function Resolve-Tool {
  param([string]$Name)
  $tool = Get-Command $Name -ErrorAction SilentlyContinue

  if (-not $tool) {
    throw "Ferramenta obrigatoria nao encontrada no PATH: $Name"
  }

  return $tool.Source
}

function Quote-NativeArg {
  param([string]$Arg)
  if ($Arg -notmatch '[\s"]') {
    return $Arg
  }

  $escaped = $Arg -replace '(\\*)"', '$1$1\"'
  $escaped = $escaped -replace '(\\+)$', '$1$1'
  return '"' + $escaped + '"'
}

function Join-NativeArguments {
  param([string[]]$Arguments)
  return (($Arguments | ForEach-Object { Quote-NativeArg $_ }) -join ' ')
}

function Assert-FileExists {
  param(
    [string]$Path,
    [string]$Label
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "$Label nao encontrado: $Path"
  }
}

function Get-SafeTargetDescription {
  param(
    [pscustomobject]$Remote,
    [string]$Database
  )

  return "$($Remote.User)@$($Remote.Host):$($Remote.Port)/$Database"
}

function ConvertTo-DatabaseUrlComponent {
  param([string]$Value)
  return [System.Uri]::EscapeDataString($Value)
}

function New-PrismaMySqlUrl {
  param(
    [pscustomobject]$Remote,
    [string]$Password,
    [string]$Database
  )

  $user = ConvertTo-DatabaseUrlComponent $Remote.User
  $encodedPassword = ConvertTo-DatabaseUrlComponent $Password
  $encodedDatabase = ConvertTo-DatabaseUrlComponent $Database
  $sslCert = ConvertTo-DatabaseUrlComponent $Remote.SslCa.Replace('\', '/')

  return "mysql://$user`:$encodedPassword@$($Remote.Host):$($Remote.Port)/$encodedDatabase`?sslaccept=strict&sslcert=$sslCert"
}

function Invoke-NativeCommand {
  param(
    [string]$FilePath,
    [string[]]$Arguments,
    [string]$Label,
    [string]$WorkingDirectory = '',
    [hashtable]$Environment = @{}
  )

  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $FilePath
  $psi.Arguments = Join-NativeArguments $Arguments
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $true

  if (-not [string]::IsNullOrWhiteSpace($WorkingDirectory)) {
    $psi.WorkingDirectory = $WorkingDirectory
  }

  foreach ($key in $Environment.Keys) {
    $psi.Environment[$key] = [string]$Environment[$key]
  }

  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $psi

  $null = $process.Start()
  $stdoutTask = $process.StandardOutput.ReadToEndAsync()
  $stderrTask = $process.StandardError.ReadToEndAsync()
  $process.WaitForExit()

  $stdout = $stdoutTask.Result
  $stderr = $stderrTask.Result

  if ($stdout) {
    Write-Host $stdout.TrimEnd()
  }
  if ($stderr) {
    Write-Host $stderr.TrimEnd()
  }

  if ($process.ExitCode -ne 0) {
    throw "Comando falhou ($Label), exit code $($process.ExitCode)."
  }

  return [pscustomobject]@{
    ExitCode = $process.ExitCode
    StdOut = $stdout
    StdErr = $stderr
  }
}

function Normalize-Seeds {
  param([string[]]$Values)
  return @(
    $Values |
      ForEach-Object { $_ -split ',' } |
      ForEach-Object { $_.Trim().ToLowerInvariant() } |
      Where-Object { $_ }
  )
}

function Get-SeedCommand {
  param(
    [string]$Seed,
    [bool]$AllowFull
  )

  switch ($Seed) {
    'compendio' {
      return [pscustomobject]@{
        Name = 'compendio'
        Tool = 'npm'
        Arguments = @('run', 'seed:compendio')
        ValidatesCompendio = $true
        DestructiveRelations = $false
      }
    }
    'sobrevivendo' {
      return [pscustomobject]@{
        Name = 'sobrevivendo'
        Tool = 'npm'
        Arguments = @('run', 'seed:sobrevivendo')
        ValidatesCompendio = $false
        DestructiveRelations = $false
      }
    }
    'tecnicas-inatas' {
      return [pscustomobject]@{
        Name = 'tecnicas-inatas'
        Tool = 'npm'
        Arguments = @('run', 'seed:tecnicas:inatas')
        ValidatesCompendio = $false
        DestructiveRelations = $false
      }
    }
    'modificacoes-aplicaveis' {
      return [pscustomobject]@{
        Name = 'modificacoes-aplicaveis'
        Tool = 'npm'
        Arguments = @('run', 'seed:modificacoes-aplicaveis')
        ValidatesCompendio = $false
        DestructiveRelations = $true
      }
    }
    'full' {
      if (-not $AllowFull) {
        throw "Seed 'full' bloqueado. Use -AllowFullSeed e confirmacao 'ATUALIZAR <banco> FULL'."
      }

      return [pscustomobject]@{
        Name = 'full'
        Tool = 'npm'
        Arguments = @('run', 'seed')
        ValidatesCompendio = $true
        DestructiveRelations = $true
      }
    }
    default {
      throw "Seed nao permitido: $Seed. Permitidos: compendio, sobrevivendo, tecnicas-inatas, modificacoes-aplicaveis, full."
    }
  }
}

function Invoke-RemoteUpdateValidation {
  param(
    [string]$MysqlExe,
    [string]$RemoteDefaults,
    [string]$RemoteDatabase,
    [bool]$ValidatesCompendio
  )

  Write-Step 'Validando update remoto'
  $remoteDatabaseSql = Escape-MySqlString $RemoteDatabase

  $tablesResult = Invoke-NativeCommand `
    -FilePath $MysqlExe `
    -Arguments @(
      "--defaults-extra-file=$RemoteDefaults",
      '--comments',
      '--batch',
      '--skip-column-names',
      "--execute=SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$remoteDatabaseSql';"
    ) `
    -Label 'validar contagem de tabelas'

  $tableCount = [int]$tablesResult.StdOut.Trim()
  if ($tableCount -le 0) {
    throw 'Validacao retornou zero tabelas no banco remoto.'
  }

  $migrationsResult = Invoke-NativeCommand `
    -FilePath $MysqlExe `
    -Arguments @(
      "--defaults-extra-file=$RemoteDefaults",
      '--comments',
      "--database=$RemoteDatabase",
      '--batch',
      '--skip-column-names',
      '--execute=SELECT COUNT(*) FROM _prisma_migrations;'
    ) `
    -Label 'validar _prisma_migrations'
  $migrationCount = [int]$migrationsResult.StdOut.Trim()

  Write-Ok "Tabelas no remoto: $tableCount"
  Write-Ok "Migrations registradas: $migrationCount"

  if ($ValidatesCompendio) {
    $compendioResult = Invoke-NativeCommand `
      -FilePath $MysqlExe `
      -Arguments @(
        "--defaults-extra-file=$RemoteDefaults",
        '--comments',
        "--database=$RemoteDatabase",
        '--batch',
        '--skip-column-names',
        "--execute=SELECT COUNT(*) FROM compendio_artigos WHERE codigo = 'regras-opcionais' AND ativo = 1;"
      ) `
      -Label 'validar artigo regras-opcionais'
    $regrasOpcionaisCount = [int]$compendioResult.StdOut.Trim()

    if ($regrasOpcionaisCount -le 0) {
      throw "Artigo 'regras-opcionais' nao encontrado como ativo no TiDB."
    }

    Write-Ok "Artigo 'regras-opcionais' ativo encontrado"

    $sobrevivendoTrilhasResult = Invoke-NativeCommand `
      -FilePath $MysqlExe `
      -Arguments @(
        "--defaults-extra-file=$RemoteDefaults",
        '--comments',
        "--database=$RemoteDatabase",
        '--batch',
        '--skip-column-names',
        "--execute=SELECT COUNT(DISTINCT a.codigo) FROM compendio_artigos a JOIN compendio_subcategorias s ON s.id = a.subcategoria_id JOIN compendio_categorias c ON c.id = s.categoria_id JOIN compendio_livros l ON l.id = c.livro_id WHERE l.codigo = 'sobrevivendo-ao-jujutsu' AND a.ativo = 1 AND a.codigo IN ('corpo-amaldicoado-independente', 'receptaculo', 'amaldicoado');"
      ) `
      -Label 'validar trilhas novas do sobrevivendo'
    $sobrevivendoTrilhasCount = [int]$sobrevivendoTrilhasResult.StdOut.Trim()

    if ($sobrevivendoTrilhasCount -ne 3) {
      throw "Trilhas novas do Sobrevivendo ao Jujutsu incompletas no TiDB. Encontradas: $sobrevivendoTrilhasCount de 3."
    }

    $placeholderResult = Invoke-NativeCommand `
      -FilePath $MysqlExe `
      -Arguments @(
        "--defaults-extra-file=$RemoteDefaults",
        '--comments',
        "--database=$RemoteDatabase",
        '--batch',
        '--skip-column-names',
        "--execute=SELECT COUNT(*) FROM compendio_artigos a JOIN compendio_subcategorias s ON s.id = a.subcategoria_id JOIN compendio_categorias c ON c.id = s.categoria_id JOIN compendio_livros l ON l.id = c.livro_id WHERE l.codigo = 'sobrevivendo-ao-jujutsu' AND a.ativo = 1 AND a.conteudo LIKE '%O texto completo sera preenchido%';"
      ) `
      -Label 'validar placeholders do sobrevivendo'
    $placeholderCount = [int]$placeholderResult.StdOut.Trim()

    if ($placeholderCount -gt 0) {
      throw "Ainda existem placeholders ativos no compendio remoto do Sobrevivendo ao Jujutsu: $placeholderCount."
    }

    Write-Ok 'Trilhas novas do Sobrevivendo ao Jujutsu encontradas'
    Write-Ok 'Nenhum placeholder encontrado no compendio remoto do Sobrevivendo ao Jujutsu'
  }
}

$tempDir = $null

try {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $repoRoot = Split-Path -Parent $scriptDir

  if ([string]::IsNullOrWhiteSpace($OpsFile)) {
    $OpsFile = Join-Path $scriptDir 'PRIVATE-OPS.md'
  }

  $backPathCandidate = $BackDir
  if (-not (Test-Path -LiteralPath $backPathCandidate)) {
    $backPathCandidate = Join-Path $repoRoot $BackDir
  }

  Write-Step 'Validando arquivos e ferramentas'

  $opsPath = (Resolve-Path -LiteralPath $OpsFile).Path
  $backPath = (Resolve-Path -LiteralPath $backPathCandidate).Path
  Assert-FileExists -Path (Join-Path $backPath 'package.json') -Label 'package.json do backend'
  Assert-FileExists -Path (Join-Path $backPath 'prisma\schema.prisma') -Label 'schema.prisma'

  $mysqlExe = Resolve-Tool 'mysql'
  $mysqldumpExe = $null
  if ($BackupBefore) {
    $mysqldumpExe = Resolve-Tool 'mysqldump'
  }
  $npxExe = Resolve-Tool 'npx'
  $npmExe = Resolve-Tool 'npm'

  Write-Ok 'Arquivos e ferramentas encontrados'

  Write-Step 'Lendo configuracao privada'

  $opsLines = Get-Content -LiteralPath $opsPath -Encoding UTF8
  $tidbCommand = Get-OneLineCommandBlock -Lines $opsLines -HeadingRegex '(?i)^##\s+Acesso ao TiDB'
  $tidbPassword = Get-CodeBlockAfterHeading -Lines $opsLines -HeadingRegex '(?i)^##\s+tidbcloud password:'

  $remote = [pscustomobject]@{
    User = Get-CommandOption -Command $tidbCommand -Names @('-u', '--user')
    Host = Get-CommandOption -Command $tidbCommand -Names @('-h', '--host')
    Port = [int](Get-CommandOption -Command $tidbCommand -Names @('-P', '--port'))
    Database = Get-CommandOption -Command $tidbCommand -Names @('-D', '--database')
    SslMode = Get-CommandOption -Command $tidbCommand -Names @('--ssl-mode')
    SslCa = Convert-MarkdownPath (Get-CommandOption -Command $tidbCommand -Names @('--ssl-ca'))
  }

  if (-not $remote.User -or -not $remote.Host -or -not $remote.Port -or -not $remote.Database) {
    throw 'Nao foi possivel extrair usuario/host/porta/banco do comando TiDB.'
  }

  if ($remote.Database -ne $RemoteDatabase) {
    throw "PRIVATE-OPS.md aponta para banco remoto '$($remote.Database)', mas -RemoteDatabase esta como '$RemoteDatabase'."
  }

  if (-not $remote.SslMode) {
    $remote.SslMode = 'VERIFY_IDENTITY'
  }

  if (-not $remote.SslCa) {
    throw 'Nao foi possivel extrair --ssl-ca do comando TiDB.'
  }

  if (-not $tidbPassword) {
    throw 'Senha TiDB nao encontrada no PRIVATE-OPS.md.'
  }

  Assert-FileExists -Path $remote.SslCa -Label 'Certificado SSL TiDB'

  $normalizedSeeds = Normalize-Seeds $Seeds
  $seedCommands = @()
  $containsFull = $false
  $validatesCompendio = $false
  foreach ($seed in $normalizedSeeds) {
    $command = Get-SeedCommand -Seed $seed -AllowFull:$AllowFullSeed.IsPresent
    $seedCommands += $command
    if ($command.Name -eq 'full') {
      $containsFull = $true
    }
    if ($command.ValidatesCompendio) {
      $validatesCompendio = $true
    }
  }

  Write-Ok "Config lida. Alvo remoto: $(Get-SafeTargetDescription -Remote $remote -Database $RemoteDatabase)"
  Write-Ok "Seeds selecionados: $($normalizedSeeds -join ', ')"

  Write-Step 'Criando arquivo temporario de credenciais MySQL'

  $tempRoot = [System.IO.Path]::GetTempPath()
  $tempDir = Join-Path $tempRoot ("update-tidb-" + [System.Guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $tempDir | Out-Null
  $remoteDefaults = Join-Path $tempDir 'tidb.cnf'

  New-MySqlDefaultsFile `
    -Path $remoteDefaults `
    -User $remote.User `
    -Password $tidbPassword `
    -HostName $remote.Host `
    -Port $remote.Port `
    -SslMode $remote.SslMode `
    -SslCa $remote.SslCa

  Write-Ok 'Credenciais temporarias preparadas'

  if (-not $SkipConnectionTest) {
    Write-Step 'Testando conexao TiDB'
    Invoke-NativeCommand `
      -FilePath $mysqlExe `
      -Arguments @("--defaults-extra-file=$remoteDefaults", '--comments', "--database=$RemoteDatabase", '--batch', '--skip-column-names', '--execute=SELECT 1;') `
      -Label 'teste TiDB remoto' | Out-Null
    Write-Ok 'Conexao TiDB validada'
  } else {
    Write-Warn 'Teste de conexao ignorado por -SkipConnectionTest'
  }

  $databaseUrl = New-PrismaMySqlUrl -Remote $remote -Password $tidbPassword -Database $RemoteDatabase
  $prismaEnv = @{
    DATABASE_URL = $databaseUrl
    PRISMA_HIDE_UPDATE_MESSAGE = '1'
  }

  Write-Step 'Validando Prisma contra o alvo remoto'
  Invoke-NativeCommand `
    -FilePath $npxExe `
    -Arguments @('prisma', 'validate') `
    -Label 'prisma validate remoto' `
    -WorkingDirectory $backPath `
    -Environment $prismaEnv | Out-Null
  Write-Ok 'Prisma validado'

  if ($PreflightOnly) {
    Write-Ok 'Preflight concluido. Nenhuma migration, seed ou backup foi executado.'
    return
  }

  if ($ValidateOnly) {
    Invoke-RemoteUpdateValidation `
      -MysqlExe $mysqlExe `
      -RemoteDefaults $remoteDefaults `
      -RemoteDatabase $RemoteDatabase `
      -ValidatesCompendio $validatesCompendio
    Write-Ok 'Validacao remota concluida. Nenhuma migration, seed ou backup foi executado.'
    return
  }

  $expectedConfirmation = if ($containsFull) {
    "ATUALIZAR $RemoteDatabase FULL"
  } else {
    "ATUALIZAR $RemoteDatabase"
  }

  Write-Step 'Confirmacao de escrita'
  Write-Warn "Esta operacao vai alterar dados no banco remoto: $(Get-SafeTargetDescription -Remote $remote -Database $RemoteDatabase)"
  Write-Warn 'Nao sera executado DROP DATABASE.'
  if ([string]::IsNullOrWhiteSpace($ConfirmationText)) {
    $confirmation = Read-Host "Digite exatamente '$expectedConfirmation' para continuar"
  } else {
    $confirmation = $ConfirmationText
    Write-Warn 'Confirmacao recebida por parametro.'
  }

  if ($confirmation -cne $expectedConfirmation) {
    throw 'Operacao cancelada: confirmacao nao confere.'
  }

  if ($BackupBefore) {
    Write-Step 'Criando backup remoto antes do update'
    if (-not (Test-Path -LiteralPath $BackupDir)) {
      New-Item -ItemType Directory -Path $BackupDir | Out-Null
    }
    $backupRoot = (Resolve-Path -LiteralPath $BackupDir).Path
    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $backupPath = Join-Path $backupRoot ("tidb_$RemoteDatabase`_$timestamp.before-update.sql")

    Invoke-NativeCommand `
      -FilePath $mysqldumpExe `
      -Arguments @(
        "--defaults-extra-file=$remoteDefaults",
        '--skip-lock-tables',
        '--default-character-set=utf8mb4',
        '--set-gtid-purged=OFF',
        '--routines=0',
        '--triggers=0',
        '--events=0',
        "--result-file=$backupPath",
        $RemoteDatabase
      ) `
      -Label 'backup TiDB remoto' | Out-Null

    Assert-FileExists -Path $backupPath -Label 'Backup remoto'
    Write-Ok "Backup remoto criado: $backupPath"
  }

  if ($Migrate) {
    Write-Step 'Aplicando migrations Prisma no TiDB'
    Invoke-NativeCommand `
      -FilePath $npxExe `
      -Arguments @('prisma', 'migrate', 'deploy') `
      -Label 'prisma migrate deploy remoto' `
      -WorkingDirectory $backPath `
      -Environment $prismaEnv | Out-Null
    Write-Ok 'Migrations aplicadas'
  } else {
    Write-Warn 'Migrations nao executadas. Use -Migrate para aplicar migrations pendentes.'
  }

  foreach ($seedCommand in $seedCommands) {
    if ($seedCommand.DestructiveRelations) {
      Write-Warn "Seed '$($seedCommand.Name)' pode recriar relacoes/catalogos especificos. Use somente quando esperado."
    }

    $toolPath = if ($seedCommand.Tool -eq 'npm') { $npmExe } else { Resolve-Tool $seedCommand.Tool }
    Write-Step "Executando seed remoto: $($seedCommand.Name)"
    Invoke-NativeCommand `
      -FilePath $toolPath `
      -Arguments $seedCommand.Arguments `
      -Label "seed $($seedCommand.Name)" `
      -WorkingDirectory $backPath `
      -Environment $prismaEnv | Out-Null
    Write-Ok "Seed '$($seedCommand.Name)' concluido"
  }

  Invoke-RemoteUpdateValidation `
    -MysqlExe $mysqlExe `
    -RemoteDefaults $remoteDefaults `
    -RemoteDatabase $RemoteDatabase `
    -ValidatesCompendio $validatesCompendio

  Write-Step 'Resumo'
  Write-Host "Destino TiDB: $(Get-SafeTargetDescription -Remote $remote -Database $RemoteDatabase)"
  if ($Migrate) {
    Write-Host 'Migrations: aplicadas'
  } else {
    Write-Host 'Migrations: nao executadas'
  }
  Write-Host "Seeds: $($normalizedSeeds -join ', ')"
  Write-Ok 'Update TiDB concluido sem recriar o banco'
} catch {
  Write-Fail $_.Exception.Message
  exit 1
} finally {
  if ($tempDir) {
    $tempFull = [System.IO.Path]::GetFullPath($tempDir)
    $tempRootFull = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())

    if ($tempFull.StartsWith($tempRootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
      Remove-Item -LiteralPath $tempFull -Recurse -Force -ErrorAction SilentlyContinue
    } else {
      Write-Warn "Diretorio temporario fora de temp nao removido: $tempFull"
    }
  }
}
