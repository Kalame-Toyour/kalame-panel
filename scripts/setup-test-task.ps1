# Get the absolute path of the script
$scriptPath = Join-Path $PSScriptRoot "run-content-generation.ps1"

# Create a trigger that starts 1 minute from now
$startTime = (Get-Date).AddMinutes(1)
$trigger = New-ScheduledTaskTrigger -Once -At $startTime

# Create the scheduled task
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`""
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -RestartInterval (New-TimeSpan -Minutes 1) -RestartCount 3

# Register the task
Register-ScheduledTask -TaskName "MadreseContentGenerationTest" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Test run for Madrese content generation"

Write-Host "Test task 'MadreseContentGenerationTest' has been created successfully!"
Write-Host "The task will run at: $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))"
Write-Host "You can check the logs in the 'logs' directory."
Write-Host "To view the task status, you can run: Get-ScheduledTask -TaskName 'MadreseContentGenerationTest'" 