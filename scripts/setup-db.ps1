# PowerShell script to set up PostgreSQL database

# Function to find PostgreSQL installation directory
function Find-PostgresPath {
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\*\bin",
        "C:\Program Files (x86)\PostgreSQL\*\bin"
    )
    
    foreach ($path in $possiblePaths) {
        $pgPath = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | 
                 Where-Object { $_.PSIsContainer } | 
                 Sort-Object Name -Descending | 
                 Select-Object -First 1
        
        if ($pgPath) {
            return $pgPath.FullName
        }
    }
    return $null
}

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

# Check if PostgreSQL is installed
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if (-not $pgService) {
    Write-Host "PostgreSQL is not installed. Please install PostgreSQL first."
    Write-Host "Download from: https://www.postgresql.org/download/windows/"
    exit 1
}

# Start PostgreSQL service if it's not running
if ($pgService.Status -ne "Running") {
    Write-Host "Starting PostgreSQL service..."
    Start-Service -Name $pgService.Name
}

# Find PostgreSQL installation path
$pgPath = Find-PostgresPath
if (-not $pgPath) {
    Write-Host "Could not find PostgreSQL installation directory."
    Write-Host "Please make sure PostgreSQL is installed correctly."
    exit 1
}

$psqlPath = Join-Path $pgPath "psql.exe"
if (-not (Test-Path $psqlPath)) {
    Write-Host "Could not find psql.exe at: $psqlPath"
    Write-Host "Please make sure PostgreSQL is installed correctly."
    exit 1
}

# Create database using psql
Write-Host "Creating database 'mydb'..."
& $psqlPath -U postgres -c "CREATE DATABASE mydb;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database 'mydb' created successfully!"
} else {
    Write-Host "Failed to create database. Please check your PostgreSQL installation and credentials."
    exit 1
}

Write-Host "Database setup complete!"
Write-Host "Please make sure your .env file has the correct DATABASE_URL:"
Write-Host "DATABASE_URL='postgresql://postgres:your_password_here@localhost:5432/mydb'" 