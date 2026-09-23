<#
.SYNOPSIS
  Registra a rotina diária de backup do TiDB no Agendador de Tarefas do Windows.
#>
[CmdletBinding()]
param(
  [string]$Horario = '03:10',
  [string]$TaskName = 'AssistenteRPG - Backup TiDB',
  [string]$PowerShellExe = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

if ($Horario -notmatch '^([01]\d|2[0-3]):[0-5]\d$') {
  throw 'Horário inválido. Use HH:mm, por exemplo 03:10.'
}
$scriptPath = Join-Path $PSScriptRoot 'backup-tidb-agendado.ps1'
if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Script de backup não encontrado: $scriptPath"
}

$action = New-ScheduledTaskAction -Execute $PowerShellExe -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At $Horario
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 2)
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description 'Backup lógico TiDB com retenção de uma cópia.' -Force | Out-Null
Write-Host "Tarefa registrada: $TaskName às $Horario. Configure ASSISTENTERPG_API_URL e ASSISTENTERPG_BACKUP_STATUS_TOKEN no contexto da tarefa para registrar no painel."
