<#
.SYNOPSIS
  Executa backup lógico recorrente do TiDB e mantém somente a cópia mais nova.

.DESCRIPTION
  Reutiliza o procedimento oficial update-tidb.ps1 sem migration ou seed. A
  remoção dos backups anteriores acontece somente depois de o novo dump existir
  e ter SHA-256 calculado. Se ASSISTENTERPG_BACKUP_STATUS_TOKEN estiver
  configurado, registra os metadados no painel administrativo sem enviar o dump.
#>
[CmdletBinding()]
param(
  [string]$OpsFile = '',
  [string]$RemoteDatabase = 'test',
  [string]$BackupDir = 'D:\AssistenteRPG\backups',
  [ValidateRange(1, 10)]
  [int]$Retencao = 1,
  [string]$ApiUrl = $env:ASSISTENTERPG_API_URL,
  [string]$StatusToken = $env:ASSISTENTERPG_BACKUP_STATUS_TOKEN
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$updateScript = Join-Path $PSScriptRoot 'update-tidb.ps1'
if (-not (Test-Path -LiteralPath $updateScript)) {
  throw "Procedimento oficial não encontrado: $updateScript"
}
if (-not (Test-Path -LiteralPath $BackupDir)) {
  New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

& $updateScript `
  -OpsFile $OpsFile `
  -RemoteDatabase $RemoteDatabase `
  -BackupBefore `
  -BackupDir $BackupDir `
  -Seeds @() `
  -ConfirmationText "ATUALIZAR $RemoteDatabase"
if ($LASTEXITCODE -ne 0) {
  throw "O procedimento oficial retornou código $LASTEXITCODE. Nenhum backup anterior foi removido."
}

$backups = @(Get-ChildItem -LiteralPath $BackupDir -File -Filter "tidb_$RemoteDatabase`_*.before-update.sql" |
  Sort-Object LastWriteTimeUtc -Descending)
if ($backups.Count -eq 0) {
  throw 'O backup não foi localizado após a execução. Nenhum arquivo anterior foi removido.'
}

$atual = $backups[0]
$hash = (Get-FileHash -LiteralPath $atual.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
if ($atual.Length -lt 1) {
  throw 'O backup gerado está vazio. Nenhum arquivo anterior foi removido.'
}

if ($ApiUrl -and $StatusToken) {
  $endpoint = "$($ApiUrl.TrimEnd('/'))/health/backups"
  $payload = @{
    banco = $RemoteDatabase
    arquivo = $atual.Name
    tamanhoBytes = [int64]$atual.Length
    sha256 = $hash
    retencao = $Retencao
    origem = 'AGENDADO'
  } | ConvertTo-Json -Compress
  Invoke-RestMethod -Method Post -Uri $endpoint -ContentType 'application/json' `
    -Headers @{ 'X-Backup-Status-Token' = $StatusToken } -Body $payload | Out-Null
} elseif ($ApiUrl -or $StatusToken) {
  Write-Warning 'Registro remoto de backup não executado: informe API e token juntos.'
}

# Retenção deliberadamente mínima: após validar a nova cópia, os anteriores são
# removidos. O dump atual nunca é alvo da limpeza.
$backups | Select-Object -Skip $Retencao | ForEach-Object {
  Remove-Item -LiteralPath $_.FullName -Force
  Write-Host "Backup anterior removido: $($_.Name)"
}

Write-Host "Backup concluído: $($atual.Name) | SHA-256: $hash | retenção: $Retencao"
