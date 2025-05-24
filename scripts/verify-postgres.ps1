# PowerShell script to verify PostgreSQL installation and connection

Write-Host "Checking PostgreSQL installation and connection..."

# Read password from .env file
$envContent = Get-Content .env -Raw
$passwordMatch = [regex]::Match($envContent, 'DATABASE_URL="postgresql://[^:]+:([^@]+)@')
if ($passwordMatch.Success) {
    $env:PGPASSWORD = $passwordMatch.Groups[1].Value
} else {
    Write-Host "❌ Could not find database password in .env file!"
    Write-Host "Please make sure your .env file has the correct DATABASE_URL format."
    exit 1
}

# Check if PostgreSQL service exists
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if (-not $pgService) {
    Write-Host "❌ PostgreSQL service not found!"
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/"
    exit 1
}

Write-Host "✅ PostgreSQL service found: $($pgService.Name)"

# Check if service is running
if ($pgService.Status -ne "Running") {
    Write-Host "❌ PostgreSQL service is not running!"
    Write-Host "Attempting to start the service..."
    Start-Service -Name $pgService.Name
    Start-Sleep -Seconds 2
    $pgService = Get-Service -Name $pgService.Name
    if ($pgService.Status -ne "Running") {
        Write-Host "❌ Failed to start PostgreSQL service!"
        Write-Host "Please start the service manually from Windows Services"
        exit 1
    }
}

Write-Host "✅ PostgreSQL service is running"

# Find PostgreSQL installation directory
$pgPath = Get-ChildItem -Path "C:\Program Files\PostgreSQL\*\bin" -ErrorAction SilentlyContinue | 
          Where-Object { $_.PSIsContainer } | 
          Sort-Object Name -Descending | 
          Select-Object -First 1

if (-not $pgPath) {
    Write-Host "❌ Could not find PostgreSQL installation directory!"
    Write-Host "Please make sure PostgreSQL is installed correctly."
    exit 1
}

Write-Host "✅ PostgreSQL installation found at: $($pgPath.FullName)"

# Check psql executable
$psqlPath = Join-Path $pgPath.FullName "psql.exe"
if (-not (Test-Path $psqlPath)) {
    Write-Host "❌ Could not find psql.exe!"
    Write-Host "Please make sure PostgreSQL is installed correctly."
    exit 1
}

Write-Host "✅ psql.exe found at: $psqlPath"

# Test connection
Write-Host "`nTesting database connection..."
$result = & $psqlPath -U postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully connected to PostgreSQL!"
    Write-Host "Version: $($result | Select-Object -First 1)"
} else {
    Write-Host "❌ Failed to connect to PostgreSQL!"
    Write-Host "Error: $result"
    Write-Host "`nPlease check:"
    Write-Host "1. PostgreSQL is installed correctly"
    Write-Host "2. The password in your .env file matches your PostgreSQL password"
    Write-Host "3. The port (5432) is not blocked by your firewall"
    exit 1
}

Write-Host "`n✅ All checks passed! Your PostgreSQL installation is working correctly."
Write-Host "You can now proceed with database migrations." 