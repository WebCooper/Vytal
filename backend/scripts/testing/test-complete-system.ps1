# Direct MySQL Testing (no PATH required)
# This script tests MySQL using the full path

Write-Host "=== MySQL System Testing ===" -ForegroundColor Green

# MySQL path
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$username = "root"
$password = "1010"
$database = "vytal_db"

# Check if MySQL exists
if (-not (Test-Path $mysqlPath)) {
    Write-Host "❌ MySQL not found at: $mysqlPath" -ForegroundColor Red
    Write-Host "Please check your MySQL installation path" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MySQL found at: $mysqlPath" -ForegroundColor Green

# Test MySQL version
Write-Host ""
Write-Host "Testing MySQL version..." -ForegroundColor Yellow
try {
    $version = & $mysqlPath --version 2>&1
    Write-Host "✅ MySQL Version: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Error getting MySQL version" -ForegroundColor Red
    exit 1
}

# Get MySQL credentials
Write-Host ""
Write-Host "Testing MySQL connection..." -ForegroundColor Yellow
$username = Read-Host "Enter MySQL username (default: root)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "root"
}

$password = Read-Host "Enter MySQL password" -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Test connection
Write-Host ""
Write-Host "Connecting to MySQL..." -ForegroundColor Cyan
try {
    $connectionTest = & $mysqlPath -u $username -p$passwordText -e "SELECT 'Connection successful!' as result;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MySQL connection successful!" -ForegroundColor Green
        Write-Host $connectionTest -ForegroundColor White
    } else {
        Write-Host "❌ MySQL connection failed" -ForegroundColor Red
        Write-Host "Error: $connectionTest" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error connecting to MySQL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if vytal_db exists
Write-Host ""
Write-Host "Checking if vytal_db database exists..." -ForegroundColor Cyan
$dbCheck = & $mysqlPath -u $username -p$passwordText -e "SHOW DATABASES LIKE 'vytal_db';" 2>&1
if ($LASTEXITCODE -eq 0 -and $dbCheck -like "*vytal_db*") {
    Write-Host "✅ Database 'vytal_db' exists" -ForegroundColor Green
    
    # Check users table
    Write-Host ""
    Write-Host "Checking users in database..." -ForegroundColor Cyan
    $userCheck = & $mysqlPath -u $username -p$passwordText vytal_db -e "SELECT COUNT(*) as user_count FROM users;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Users table accessible:" -ForegroundColor Green
        Write-Host $userCheck -ForegroundColor White
        
        # Show all users
        $allUsers = & $mysqlPath -u $username -p$passwordText vytal_db -e "SELECT id, name, email, role FROM users;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ All users in database:" -ForegroundColor Green
            Write-Host $allUsers -ForegroundColor White
        }
    } else {
        Write-Host "❌ Error accessing users table" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Database 'vytal_db' not found" -ForegroundColor Red
    Write-Host "You need to run database setup first" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "🔧 Setting up database now..." -ForegroundColor Cyan
    
    # Create database
    $createDB = & $mysqlPath -u $username -p$passwordText -e "CREATE DATABASE IF NOT EXISTS vytal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully" -ForegroundColor Green
        
        # Run SQL setup script
        $scriptPath = ".\database_setup.sql"
        if (Test-Path $scriptPath) {
            Write-Host "Running database setup script..." -ForegroundColor Cyan
            $setupResult = & $mysqlPath -u $username -p$passwordText vytal_db < $scriptPath 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
            } else {
                Write-Host "❌ Database setup failed: $setupResult" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ database_setup.sql not found" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to create database: $createDB" -ForegroundColor Red
    }
}

# Update Config.toml with credentials
Write-Host ""
Write-Host "Updating Config.toml..." -ForegroundColor Cyan
$configContent = @"
[vytal_backend]
DB_HOST = "localhost"
DB_PORT = 3306
DB_NAME = "vytal_db"
DB_USER = "$username"
DB_PASSWORD = "$passwordText"
JWT_SECRET = "vytal-secret-key-development-$(Get-Random)"
"@

$configContent | Out-File -FilePath "Config.toml" -Encoding UTF8
Write-Host "✅ Config.toml updated with your credentials" -ForegroundColor Green

Write-Host ""
Write-Host "=== System Status Summary ===" -ForegroundColor Yellow
Write-Host "✅ MySQL Server: Working" -ForegroundColor Green
Write-Host "✅ Database Connection: Working" -ForegroundColor Green
Write-Host "✅ Configuration: Updated" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Install Ballerina: https://ballerina.io/downloads/" -ForegroundColor White
Write-Host "2. Start backend: bal run" -ForegroundColor White
Write-Host "3. Start frontend: npm run dev (in frontend folder)" -ForegroundColor White
Write-Host "4. Visit: http://localhost:3000" -ForegroundColor White

Write-Host ""
Write-Host "🧪 Test Accounts:" -ForegroundColor Cyan
Write-Host "Email: admin@vytal.com | Password: admin123" -ForegroundColor White
Write-Host "Email: doctor@vytal.com | Password: doctor123" -ForegroundColor White
Write-Host "Email: patient@vytal.com | Password: patient123" -ForegroundColor White

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Green
