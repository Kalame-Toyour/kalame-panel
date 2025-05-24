# Set Node options to increase memory limit
$env:NODE_OPTIONS="--max-old-space-size=4096"

# Navigate to the project directory
Set-Location $PSScriptRoot\..

# Create logs directory if it doesn't exist
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
}

# Get current timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Run the content generation script
Write-Host "Starting content generation at $timestamp..."
npx ts-node scripts/generate-content.ts

# Log the execution
Add-Content -Path "logs\content-generation.log" -Value "[$timestamp] Content generation completed" 