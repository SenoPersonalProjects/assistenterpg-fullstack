<#
.SYNOPSIS
  Sincroniza o banco MySQL local com o banco TiDB remoto.

.DESCRIPTION
  Fluxo destrutivo no TiDB:
  1. Le credenciais e comandos do PRIVATE-OPS.md local.
  2. Cria dump do banco local.
  3. Corrige o dump com corrigir_sql.py.
  4. Exige confirmação digitada.
  5. Recria o banco remoto.
  6. Importa o dump corrigido.

  O script não versiona nem imprime senhas. Senhas sao passadas ao mysql por
  arquivos temporários --defaults-extra-file e removidas no finally.
#>

[CmdletBinding()]
param(
  [string]$OpsFile = '',
  [string]$OutputDir = 'D:\',
  [string]$LocalDatabase = 'assistenterpg',
  [string]$RemoteDatabase = 'test',
  [string]$ConfirmationText = '',
  [switch]$KeepDump,
  [switch]$PreflightOnly,
  [switch]$SkipConnectionTest
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host ""
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
    throw "Seção não encontrada no PRIVATE-OPS.md: $HeadingRegex"
  }

  $start = -1
  for ($i = $headingIndex + 1; $i -lt $Lines.Count; $i++) {
    if ($Lines[$i] -match '^\s*```') {
      $start = $i + 1
      break
    }
  }

  if ($start -lt 0) {
    throw "Bloco de codigo não encontrado depois da seção: $HeadingRegex"
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

function Quote-MySqlIdentifier {
  param([string]$Identifier)
  if ($Identifier -notmatch '^[A-Za-z0-9_]+$') {
    throw "Identificador MySQL invalido: $Identifier"
  }

  return "``$Identifier``"
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

function Invoke-NativeCommand {
  param(
    [string]$FilePath,
    [string[]]$Arguments,
    [string]$Label,
    [string]$InputFile
  )

  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $FilePath
  $psi.Arguments = Join-NativeArguments $Arguments
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $true

  if ($InputFile) {
    $psi.RedirectStandardInput = $true
  }

  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $psi

  $null = $process.Start()
  $stdoutTask = $process.StandardOutput.ReadToEndAsync()
  $stderrTask = $process.StandardError.ReadToEndAsync()

  if ($InputFile) {
    $inputStream = $null
    try {
      $inputStream = [System.IO.File]::OpenRead($InputFile)
      $inputStream.CopyTo($process.StandardInput.BaseStream)
      $process.StandardInput.Close()
    } finally {
      if ($inputStream) {
        $inputStream.Dispose()
      }
    }
  }

  $process.WaitForExit()
  $stdout = $stdoutTask.Result
  $stderr = $stderrTask.Result

  if ($process.ExitCode -ne 0) {
    $message = "Comando falhou ($Label), exit code $($process.ExitCode)."
    if ($stderr) {
      $message += " STDERR: $stderr"
    }
    throw $message
  }

  return [pscustomobject]@{
    ExitCode = $process.ExitCode
    StdOut = $stdout
    StdErr = $stderr
  }
}

function Resolve-Tool {
  param([string]$Name)
  $tool = Get-Command $Name -ErrorAction SilentlyContinue

  if (-not $tool) {
    throw "Ferramenta obrigatória não encontrada no PATH: $Name"
  }

  return $tool.Source
}

function Assert-FileExists {
  param(
    [string]$Path,
    [string]$Label
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "$Label não encontrado: $Path"
  }
}

function Get-SafeTargetDescription {
  param(
    [pscustomobject]$Remote,
    [string]$Database
  )

  return "$($Remote.User)@$($Remote.Host):$($Remote.Port)/$Database"
}

$tempDir = $null
$dumpPath = $null
$fixedDumpPath = $null

try {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  if ([string]::IsNullOrWhiteSpace($OpsFile)) {
    $OpsFile = Join-Path $scriptDir 'PRIVATE-OPS.md'
  }

  Write-Step 'Validando arquivos e ferramentas'

  $opsPath = (Resolve-Path -LiteralPath $OpsFile).Path
  Assert-FileExists -Path $opsPath -Label 'PRIVATE-OPS.md'

  $corrigirSqlPath = Join-Path $scriptDir 'corrigir_sql.py'
  Assert-FileExists -Path $corrigirSqlPath -Label 'corrigir_sql.py'

  if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
  }

  $outputRoot = (Resolve-Path -LiteralPath $OutputDir).Path
  $mysqlExe = Resolve-Tool 'mysql'
  $mysqldumpExe = Resolve-Tool 'mysqldump'
  $pythonExe = Resolve-Tool 'python'

  Write-Ok 'Arquivos e ferramentas encontrados'

  Write-Step 'Lendo configuração privada'

  $opsLines = Get-Content -LiteralPath $opsPath -Encoding UTF8
  $tidbCommand = Get-OneLineCommandBlock -Lines $opsLines -HeadingRegex '(?i)^##\s+Acesso ao TiDB'
  $dumpCommand = Get-OneLineCommandBlock -Lines $opsLines -HeadingRegex '(?i)^##\s+Dump do banco local'
  $tidbPassword = Get-CodeBlockAfterHeading -Lines $opsLines -HeadingRegex '(?i)^##\s+tidbcloud password:'
  $localPassword = Get-CodeBlockAfterHeading -Lines $opsLines -HeadingRegex '(?i)^##\s+mysql password:'

  $remote = [pscustomobject]@{
    User = Get-CommandOption -Command $tidbCommand -Names @('-u', '--user')
    Host = Get-CommandOption -Command $tidbCommand -Names @('-h', '--host')
    Port = [int](Get-CommandOption -Command $tidbCommand -Names @('-P', '--port'))
    Database = Get-CommandOption -Command $tidbCommand -Names @('-D', '--database')
    SslMode = Get-CommandOption -Command $tidbCommand -Names @('--ssl-mode')
    SslCa = Convert-MarkdownPath (Get-CommandOption -Command $tidbCommand -Names @('--ssl-ca'))
  }

  $local = [pscustomobject]@{
    User = Get-CommandOption -Command $dumpCommand -Names @('-u', '--user')
    Host = Get-CommandOption -Command $dumpCommand -Names @('-h', '--host')
    Port = Get-CommandOption -Command $dumpCommand -Names @('-P', '--port')
  }

  if (-not $remote.User -or -not $remote.Host -or -not $remote.Port -or -not $remote.Database) {
    throw 'Não foi possível extrair usuário/host/porta/banco do comando TiDB.'
  }

  if ($remote.Database -ne $RemoteDatabase) {
    throw "PRIVATE-OPS.md aponta para banco remoto '$($remote.Database)', mas -RemoteDatabase está como '$RemoteDatabase'."
  }

  if (-not $remote.SslMode) {
    $remote.SslMode = 'VERIFY_IDENTITY'
  }

  if (-not $remote.SslCa) {
    throw 'Não foi possível extrair --ssl-ca do comando TiDB.'
  }

  Assert-FileExists -Path $remote.SslCa -Label 'Certificado SSL TiDB'

  if (-not $local.User) {
    $local.User = 'root'
  }
  if (-not $local.Host) {
    $local.Host = 'localhost'
  }
  if (-not $local.Port) {
    $local.Port = 3306
  } else {
    $local.Port = [int]$local.Port
  }

  if (-not $tidbPassword -or -not $localPassword) {
    throw 'Senhas não encontradas no PRIVATE-OPS.md.'
  }

  Write-Ok "Config lida. Alvo remoto: $(Get-SafeTargetDescription -Remote $remote -Database $RemoteDatabase)"

  Write-Step 'Criando arquivos temporários de credenciais'

  $tempRoot = [System.IO.Path]::GetTempPath()
  $tempDir = Join-Path $tempRoot ("sync-tidb-" + [System.Guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $tempDir | Out-Null

  $localDefaults = Join-Path $tempDir 'local.cnf'
  $remoteDefaults = Join-Path $tempDir 'tidb.cnf'

  New-MySqlDefaultsFile `
    -Path $localDefaults `
    -User $local.User `
    -Password $localPassword `
    -HostName $local.Host `
    -Port $local.Port `
    -SslMode $null `
    -SslCa $null

  New-MySqlDefaultsFile `
    -Path $remoteDefaults `
    -User $remote.User `
    -Password $tidbPassword `
    -HostName $remote.Host `
    -Port $remote.Port `
    -SslMode $remote.SslMode `
    -SslCa $remote.SslCa

  Write-Ok 'Credenciais temporárias preparadas'

  if (-not $SkipConnectionTest) {
    Write-Step 'Testando conexoes'

    Invoke-NativeCommand `
      -FilePath $mysqlExe `
      -Arguments @("--defaults-extra-file=$localDefaults", "--database=$LocalDatabase", '--batch', '--skip-column-names', '--execute=SELECT 1;') `
      -Label 'teste MySQL local' | Out-Null

    Invoke-NativeCommand `
      -FilePath $mysqlExe `
      -Arguments @("--defaults-extra-file=$remoteDefaults", '--comments', '--batch', '--skip-column-names', '--execute=SELECT 1;') `
      -Label 'teste TiDB remoto' | Out-Null

    Write-Ok 'Conexoes validadas'
  } else {
    Write-Warn 'Testes de conexão ignorados por -SkipConnectionTest'
  }

  if ($PreflightOnly) {
    Write-Ok 'Preflight concluido. Nenhum dump, reset ou import foi executado.'
    return
  }

  $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
  $dumpPath = Join-Path $outputRoot ("$LocalDatabase`_$timestamp.sql")
  $fixedDumpPath = Join-Path $outputRoot ("$LocalDatabase`_$timestamp.tidb.sql")

  Write-Step 'Criando dump local'
  Write-Host "Destino: $dumpPath"

  Invoke-NativeCommand `
    -FilePath $mysqldumpExe `
    -Arguments @(
      "--defaults-extra-file=$localDefaults",
      '--single-transaction',
      '--default-character-set=utf8mb4',
      '--set-gtid-purged=OFF',
      '--routines=0',
      '--triggers=0',
      '--events=0',
      "--result-file=$dumpPath",
      $LocalDatabase
    ) `
    -Label 'mysqldump local' | Out-Null

  Assert-FileExists -Path $dumpPath -Label 'Dump local'
  Write-Ok 'Dump local criado'

  Write-Step 'Corrigindo dump para TiDB'
  Invoke-NativeCommand `
    -FilePath $pythonExe `
    -Arguments @($corrigirSqlPath, $dumpPath, $fixedDumpPath) `
    -Label 'corrigir_sql.py' | Out-Null

  Assert-FileExists -Path $fixedDumpPath -Label 'Dump corrigido'
  Write-Ok "Dump corrigido criado: $fixedDumpPath"

  Write-Step 'Confirmação destrutiva'
  $target = Get-SafeTargetDescription -Remote $remote -Database $RemoteDatabase
  $expectedConfirmation = "APAGAR $RemoteDatabase"
  Write-Warn "Esta operação vai apagar e recriar o banco remoto: $target"
  Write-Warn "Arquivo que será importado: $fixedDumpPath"
  if ([string]::IsNullOrWhiteSpace($ConfirmationText)) {
    $confirmation = Read-Host "Digite exatamente '$expectedConfirmation' para continuar"
  } else {
    $confirmation = $ConfirmationText
    Write-Warn 'Confirmação recebida por parametro.'
  }

  if ($confirmation -cne $expectedConfirmation) {
    throw 'Operação cancelada: confirmação não confere.'
  }

  Write-Step 'Recriando banco remoto no TiDB'
  $remoteDatabaseIdentifier = Quote-MySqlIdentifier $RemoteDatabase
  $resetSql = "DROP DATABASE IF EXISTS $remoteDatabaseIdentifier; CREATE DATABASE $remoteDatabaseIdentifier CHARACTER SET utf8mb4 COLLATE utf8mb4_únicode_ci;"

  Invoke-NativeCommand `
    -FilePath $mysqlExe `
    -Arguments @("--defaults-extra-file=$remoteDefaults", '--comments', "--execute=$resetSql") `
    -Label 'reset banco TiDB' | Out-Null

  Write-Ok 'Banco remoto recriado'

  Write-Step 'Importando dump corrigido no TiDB'
  Invoke-NativeCommand `
    -FilePath $mysqlExe `
    -Arguments @("--defaults-extra-file=$remoteDefaults", '--comments', "--database=$RemoteDatabase") `
    -InputFile $fixedDumpPath `
    -Label 'import dump TiDB' | Out-Null

  Write-Ok 'Importação concluida'

  Write-Step 'Validando importação'
  $remoteDatabaseSql = Escape-MySqlString $RemoteDatabase

  $tablesResult = Invoke-NativeCommand `
    -FilePath $mysqlExe `
    -Arguments @(
      "--defaults-extra-file=$remoteDefaults",
      '--comments',
      '--batch',
      '--skip-column-names',
      "--execute=SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$remoteDatabaseSql';"
    ) `
    -Label 'validar contagem de tabelas'

  $tableCountText = $tablesResult.StdOut.Trim()
  $tableCount = [int]$tableCountText

  if ($tableCount -le 0) {
    throw 'Importação validada com zero tabelas. Verifique o dump/import.'
  }

  $prismaResult = Invoke-NativeCommand `
    -FilePath $mysqlExe `
    -Arguments @(
      "--defaults-extra-file=$remoteDefaults",
      '--comments',
      '--batch',
      '--skip-column-names',
      "--execute=SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$remoteDatabaseSql' AND table_name = '_prisma_migrations';"
    ) `
    -Label 'validar _prisma_migrations'

  $hasPrismaMigrations = ([int]$prismaResult.StdOut.Trim()) -gt 0

  Write-Ok "Tabelas importadas: $tableCount"
  if ($hasPrismaMigrations) {
    Write-Ok 'Tabela _prisma_migrations encontrada'
  } else {
    Write-Warn 'Tabela _prisma_migrations não encontrada'
  }

  Write-Step 'Resumo'
  Write-Host "Origem local: $($local.User)@$($local.Host):$($local.Port)/$LocalDatabase"
  Write-Host "Destino TiDB: $target"

  if ($KeepDump) {
    Write-Host "Dump local preservado: $dumpPath"
    Write-Host "Dump corrigido preservado: $fixedDumpPath"
  } else {
    Write-Host 'Dumps serao removidos no cleanup. Use -KeepDump para preservar.'
  }

  Write-Ok 'Sincronização concluida'
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
      Write-Warn "Diretório temporário fora de temp não removido: $tempFull"
    }
  }

  if (-not $KeepDump) {
    foreach ($path in @($dumpPath, $fixedDumpPath)) {
      if ($path -and (Test-Path -LiteralPath $path)) {
        Remove-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
      }
    }
  }
}
