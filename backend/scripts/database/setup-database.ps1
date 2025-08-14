# Vytal Database Setup Script for Windows
# Run this script with PowerShell as Administrator

Write-Host "=== Vytal Database Setup ===" -ForegroundColor Green

# Check if MySQL is installed
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlPath) {
    Write-Host "❌ MySQL not found in PATH. Please install MySQL Server first." -ForegroundColor Red
    Write-Host "Download from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MySQL found" -ForegroundColor Green

# Get MySQL credentials
$username = Read-Host "Enter MySQL username (default: root)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "root"
}

$password = Read-Host "Enter MySQL password" -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Test MySQL connection
Write-Host "Testing MySQL connection..." -ForegroundColor Yellow
$testQuery = "SELECT 1"
$testResult = & mysql -u $username -p$passwordText -e $testQuery 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to connect to MySQL. Please check your credentials." -ForegroundColor Red
    exit 1
}

Write-Host "✅ MySQL connection successful" -ForegroundColor Green

# Run database setup script
Write-Host "Creating database and tables..." -ForegroundColor Yellow
$scriptPath = Join-Path $PSScriptRoot "database_setup.sql"

if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ database_setup.sql not found in current directory" -ForegroundColor Red
    exit 1
}

& mysql -u $username -p$passwordText < $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database: vytal_db" -ForegroundColor Cyan
    Write-Host "Tables created:" -ForegroundColor Cyan
    Write-Host "  - users" -ForegroundColor White
    Write-Host "  - health_records" -ForegroundColor White
    Write-Host "  - appointments" -ForegroundColor White
    Write-Host ""
    Write-Host "Default users created:" -ForegroundColor Cyan
    Write-Host "  Admin: admin@vytal.com / admin123" -ForegroundColor White
    Write-Host "  Doctor: doctor@vytal.com / doctor123" -ForegroundColor White
    Write-Host "  Patient: patient@vytal.com / patient123" -ForegroundColor White
} else {
    Write-Host "❌ Database setup failed" -ForegroundColor Red
    exit 1
}

# Update Config.toml
Write-Host ""
Write-Host "Updating Config.toml..." -ForegroundColor Yellow
$configPath = Join-Path $PSScriptRoot "Config.toml"

$configContent = @"
[vytal_backend]
DB_HOST = "localhost"
DB_PORT = 3306
DB_NAME = "vytal_db"
DB_USER = "$username"
DB_PASSWORD = "$passwordText"
JWT_SECRET = "vytal-secret-key-development-$(Get-Random)"
"@

$configContent | Out-File -FilePath $configPath -Encoding UTF8
Write-Host "✅ Config.toml updated" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Setup complete! You can now run:" -ForegroundColor Green
Write-Host "   bal run" -ForegroundColor White
Write-Host ""
Write-Host "API will be available at: http://localhost:8080/api" -ForegroundColor Cyan
