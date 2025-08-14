# Simple MySQL Connection Test
# Run this after installing MySQL to verify it's working

Write-Host "=== Simple MySQL Connection Test ===" -ForegroundColor Green

# Check if mysql command is available
Write-Host "Checking if MySQL is available..." -ForegroundColor Yellow
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue

if (-not $mysqlPath) {
    Write-Host "❌ MySQL still not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible solutions:" -ForegroundColor Yellow
    Write-Host "1. Restart PowerShell/Command Prompt" -ForegroundColor White
    Write-Host "2. Restart your computer" -ForegroundColor White
    Write-Host "3. Check if MySQL was added to PATH correctly" -ForegroundColor White
    Write-Host "4. Run: .\install-mysql-guide.ps1 for detailed help" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ MySQL command found at: $($mysqlPath.Source)" -ForegroundColor Green

# Test MySQL version
Write-Host ""
Write-Host "Testing MySQL version..." -ForegroundColor Yellow
try {
    $version = & mysql --version 2>&1
    Write-Host "✅ MySQL Version: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Error getting MySQL version" -ForegroundColor Red
}

# Test connection (will prompt for password)
Write-Host ""
Write-Host "Testing MySQL connection..." -ForegroundColor Yellow
Write-Host "This will prompt for your MySQL root password" -ForegroundColor Cyan

$password = Read-Host "Enter MySQL root password" -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

try {
    $connectionTest = & mysql -u root -p$passwordText -e "SELECT 'Connection successful!' as result;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MySQL connection successful!" -ForegroundColor Green
        Write-Host $connectionTest -ForegroundColor White
        
        Write-Host ""
        Write-Host "🎯 Ready to proceed!" -ForegroundColor Green
        Write-Host "Now you can run:" -ForegroundColor Cyan
        Write-Host "1. .\setup-database.ps1  (to create database)" -ForegroundColor White
        Write-Host "2. .\test-database.ps1   (to test database)" -ForegroundColor White
        
    } else {
        Write-Host "❌ MySQL connection failed" -ForegroundColor Red
        Write-Host "Check your password and try again" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error testing connection: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Connection Test Complete ===" -ForegroundColor Green
