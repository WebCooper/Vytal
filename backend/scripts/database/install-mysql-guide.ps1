# MySQL Installation and Setup Guide for Windows

Write-Host "=== MySQL Installation Guide for Windows ===" -ForegroundColor Green

Write-Host ""
Write-Host "❌ MySQL not found in PATH" -ForegroundColor Red
Write-Host "This means MySQL is either not installed or not properly configured." -ForegroundColor Yellow

Write-Host ""
Write-Host "=== Solution Options ===" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔧 OPTION 1: Install MySQL Server (Recommended)" -ForegroundColor Green
Write-Host "1. Download MySQL Installer from:" -ForegroundColor White
Write-Host "   https://dev.mysql.com/downloads/installer/" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Choose 'mysql-installer-community-x.x.xx.msi'" -ForegroundColor White
Write-Host ""
Write-Host "3. Run installer and select:" -ForegroundColor White
Write-Host "   - Server only (for minimal installation)" -ForegroundColor Gray
Write-Host "   - Or Developer Default (for full features)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. During setup:" -ForegroundColor White
Write-Host "   - Set root password (remember this!)" -ForegroundColor Gray
Write-Host "   - Choose 'Use Strong Password Encryption'" -ForegroundColor Gray
Write-Host "   - Start MySQL as Windows Service" -ForegroundColor Gray

Write-Host ""
Write-Host "🔧 OPTION 2: Use Chocolatey (Package Manager)" -ForegroundColor Green
Write-Host "1. Install Chocolatey first (if not installed):" -ForegroundColor White
Write-Host "   Run PowerShell as Administrator and paste:" -ForegroundColor Gray
Write-Host "   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Install MySQL:" -ForegroundColor White
Write-Host "   choco install mysql" -ForegroundColor Gray

Write-Host ""
Write-Host "🔧 OPTION 3: Use Docker (Alternative)" -ForegroundColor Green
Write-Host "1. Install Docker Desktop" -ForegroundColor White
Write-Host "2. Run MySQL in container:" -ForegroundColor White
Write-Host "   docker run --name vytal-mysql -e MYSQL_ROOT_PASSWORD=yourpassword -p 3306:3306 -d mysql:8.0" -ForegroundColor Gray

Write-Host ""
Write-Host "🔧 OPTION 4: Check if MySQL is already installed" -ForegroundColor Green
Write-Host "MySQL might be installed but not in PATH. Check these locations:" -ForegroundColor White
Write-Host ""

# Check common MySQL installation paths
$possiblePaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin",
    "C:\Program Files\MySQL\MySQL Server 5.7\bin",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin",
    "C:\Program Files (x86)\MySQL\MySQL Server 5.7\bin",
    "C:\ProgramData\MySQL\MySQL Server 8.0\bin",
    "C:\mysql\bin"
)

$mysqlFound = $false
foreach ($path in $possiblePaths) {
    if (Test-Path "$path\mysql.exe") {
        Write-Host "   ✅ Found MySQL at: $path" -ForegroundColor Green
        $mysqlFound = $true
        
        Write-Host ""
        Write-Host "🔧 To add to PATH:" -ForegroundColor Yellow
        Write-Host "1. Press Win + X, select 'System'" -ForegroundColor White
        Write-Host "2. Click 'Advanced system settings'" -ForegroundColor White
        Write-Host "3. Click 'Environment Variables'" -ForegroundColor White
        Write-Host "4. Under 'System variables', find and select 'Path'" -ForegroundColor White
        Write-Host "5. Click 'Edit' > 'New'" -ForegroundColor White
        Write-Host "6. Add: $path" -ForegroundColor Cyan
        Write-Host "7. Click OK and restart PowerShell" -ForegroundColor White
        break
    }
}

if (-not $mysqlFound) {
    Write-Host "   ❌ MySQL not found in common locations" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Quick Test After Installation ===" -ForegroundColor Yellow
Write-Host "After installing MySQL, test with:" -ForegroundColor White
Write-Host "1. Open new PowerShell window" -ForegroundColor Gray
Write-Host "2. Run: mysql --version" -ForegroundColor Gray
Write-Host "3. If working, run: .\test-database.ps1" -ForegroundColor Gray

Write-Host ""
Write-Host "=== Alternative: Use XAMPP ===" -ForegroundColor Green
Write-Host "If you prefer an all-in-one solution:" -ForegroundColor White
Write-Host "1. Download XAMPP: https://www.apachefriends.org/" -ForegroundColor Cyan
Write-Host "2. Install and start MySQL service" -ForegroundColor White
Write-Host "3. MySQL will be at: C:\xampp\mysql\bin" -ForegroundColor Gray
Write-Host "4. Add C:\xampp\mysql\bin to PATH" -ForegroundColor Gray

Write-Host ""
Write-Host "=== Need Help? ===" -ForegroundColor Cyan
Write-Host "If you're still having issues:" -ForegroundColor White
Write-Host "1. Check Windows Services for 'MySQL80' or similar" -ForegroundColor Gray
Write-Host "2. Verify MySQL is running: services.msc" -ForegroundColor Gray
Write-Host "3. Try connecting: mysql -u root -p" -ForegroundColor Gray

Write-Host ""
Write-Host "After MySQL is installed and working, you can:" -ForegroundColor Green
Write-Host "1. Run: .\setup-database.ps1" -ForegroundColor White
Write-Host "2. Then: .\test-database.ps1" -ForegroundColor White

Write-Host ""
Write-Host "=== Installation Guide Complete ===" -ForegroundColor Green
