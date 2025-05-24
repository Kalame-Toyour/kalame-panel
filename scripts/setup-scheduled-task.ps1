# Get the absolute path of the script
$scriptPath = Join-Path $PSScriptRoot "run-content-generation.ps1"

# Create the scheduled task
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Once -At "00:00" -RepetitionInterval (New-TimeSpan -Hours 6)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -RestartInterval (New-TimeSpan -Minutes 1) -RestartCount 3

# Register the task
Register-ScheduledTask -TaskName "MadreseLessonQuestionGeneration" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Generates questions for Madrese lessons that have lesson plans"

Write-Host "Scheduled task 'MadreseLessonQuestionGeneration' has been created successfully!"
Write-Host "The task will run every 6 hours starting from midnight."
Write-Host "You can check the logs in the 'logs' directory." 