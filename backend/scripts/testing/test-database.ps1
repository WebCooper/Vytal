# Database Testing Script for Vytal
# This script helps you verify if the database is working correctly

Write-Host "=== Vytal Database Testing ===" -ForegroundColor Green

# Check if MySQL is available
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlPath) {
    Write-Host "❌ MySQL not found in PATH" -ForegroundColor Red
    exit 1
}

# Get credentials
$username = Read-Host "Enter MySQL username (default: root)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "root"
}

$password = Read-Host "Enter MySQL password" -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "=== Testing Database Connection ===" -ForegroundColor Yellow

# Test 1: Check if database exists
Write-Host "1. Checking if vytal_db database exists..." -ForegroundColor Cyan
$dbCheck = & mysql -u $username -p$passwordText -e "SHOW DATABASES LIKE 'vytal_db';" 2>&1
if ($LASTEXITCODE -eq 0 -and $dbCheck -like "*vytal_db*") {
    Write-Host "   ✅ Database 'vytal_db' exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Database 'vytal_db' not found" -ForegroundColor Red
    Write-Host "   Run setup-database.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check if tables exist
Write-Host "2. Checking if tables exist..." -ForegroundColor Cyan
$tablesCheck = & mysql -u $username -p$passwordText vytal_db -e "SHOW TABLES;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Tables found:" -ForegroundColor Green
    Write-Host $tablesCheck -ForegroundColor White
} else {
    Write-Host "   ❌ Error checking tables" -ForegroundColor Red
    exit 1
}

# Test 3: Check users table structure
Write-Host "3. Checking users table structure..." -ForegroundColor Cyan
$structureCheck = & mysql -u $username -p$passwordText vytal_db -e "DESCRIBE users;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Users table structure:" -ForegroundColor Green
    Write-Host $structureCheck -ForegroundColor White
} else {
    Write-Host "   ❌ Error checking users table structure" -ForegroundColor Red
}

# Test 4: Count existing users
Write-Host "4. Checking existing users..." -ForegroundColor Cyan
$userCount = & mysql -u $username -p$passwordText vytal_db -e "SELECT COUNT(*) as total_users FROM users;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ User count query successful:" -ForegroundColor Green
    Write-Host $userCount -ForegroundColor White
} else {
    Write-Host "   ❌ Error counting users" -ForegroundColor Red
}

# Test 5: Show all users (without passwords)
Write-Host "5. Showing all users..." -ForegroundColor Cyan
$allUsers = & mysql -u $username -p$passwordText vytal_db -e "SELECT id, name, email, role, created_at FROM users ORDER BY id;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ All users:" -ForegroundColor Green
    Write-Host $allUsers -ForegroundColor White
} else {
    Write-Host "   ❌ Error fetching users" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Manual Testing Commands ===" -ForegroundColor Yellow
Write-Host "To manually check the database, use these commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Connect to MySQL:" -ForegroundColor White
Write-Host "   mysql -u $username -p" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Select database:" -ForegroundColor White
Write-Host "   USE vytal_db;" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Show all users:" -ForegroundColor White
Write-Host "   SELECT * FROM users;" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Check specific user:" -ForegroundColor White
Write-Host "   SELECT * FROM users WHERE email = 'admin@vytal.com';" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Insert test user:" -ForegroundColor White
Write-Host "   INSERT INTO users (name, email, password_hash, role) VALUES ('Test User', 'test@example.com', 'testpasshash', 'user');" -ForegroundColor Gray

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Green
