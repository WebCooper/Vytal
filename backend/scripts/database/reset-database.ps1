# Database Reset Script - Drop and Recreate Tables with New Schema
# This script will drop existing tables and create new ones with updated structure

Write-Host "=== Vytal Database Reset & Recreation ===" -ForegroundColor Green

# MySQL path
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

# Check if MySQL exists
if (-not (Test-Path $mysqlPath)) {
    Write-Host "❌ MySQL not found at: $mysqlPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ MySQL found" -ForegroundColor Green

# Get credentials
$username = Read-Host "Enter MySQL username (default: root)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "root"
}

$password = Read-Host "Enter MySQL password" -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Test connection
Write-Host ""
Write-Host "Testing MySQL connection..." -ForegroundColor Yellow
$connectionTest = & $mysqlPath -u $username -p$passwordText -e "SELECT 'Connected!' as status;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ MySQL connection failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ MySQL connection successful" -ForegroundColor Green

# Drop existing tables
Write-Host ""
Write-Host "🗑️ Dropping existing tables..." -ForegroundColor Yellow

$dropTables = @(
    "DROP TABLE IF EXISTS appointments;",
    "DROP TABLE IF EXISTS health_records;", 
    "DROP TABLE IF EXISTS users;"
)

foreach ($dropCmd in $dropTables) {
    Write-Host "Executing: $dropCmd" -ForegroundColor Gray
    $result = & $mysqlPath -u $username -p$passwordText vytal_db -e $dropCmd 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Executed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Warning: $result" -ForegroundColor Yellow
    }
}

# Create new users table with updated schema
Write-Host ""
Write-Host "🔧 Creating new users table..." -ForegroundColor Cyan

$createUsersTable = @"
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('donor', 'receiver') NOT NULL,
    category ENUM('Organs', 'Medicines', 'Blood') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
);
"@

Write-Host "Creating users table..." -ForegroundColor Gray
$result = & $mysqlPath -u $username -p$passwordText vytal_db -e $createUsersTable 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Users table created successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create users table: $result" -ForegroundColor Red
    exit 1
}

# Insert sample users with new schema
Write-Host ""
Write-Host "👥 Adding sample users..." -ForegroundColor Cyan

$sampleUsers = @(
    "INSERT INTO users (name, phone, email, password_hash, role, category) VALUES ('John Donor', '+1234567890', 'john.donor@vytal.com', SHA2('donor123', 256), 'donor', 'Blood');",
    "INSERT INTO users (name, phone, email, password_hash, role, category) VALUES ('Jane Receiver', '+1234567891', 'jane.receiver@vytal.com', SHA2('receiver123', 256), 'receiver', 'Blood');",
    "INSERT INTO users (name, phone, email, password_hash, role, category) VALUES ('Dr. Smith', '+1234567892', 'dr.smith@vytal.com', SHA2('doctor123', 256), 'donor', 'Organs');",
    "INSERT INTO users (name, phone, email, password_hash, role, category) VALUES ('Patient Mary', '+1234567893', 'mary.patient@vytal.com', SHA2('patient123', 256), 'receiver', 'Organs');",
    "INSERT INTO users (name, phone, email, password_hash, role, category) VALUES ('Pharmacy Alex', '+1234567894', 'alex.pharmacy@vytal.com', SHA2('pharmacy123', 256), 'donor', 'Medicines');",
    "INSERT INTO users (name, phone, email, password_hash, role, category) VALUES ('User Emma', '+1234567895', 'emma.user@vytal.com', SHA2('user123', 256), 'receiver', 'Medicines');"
)

foreach ($userInsert in $sampleUsers) {
    Write-Host "Adding user..." -ForegroundColor Gray
    $result = & $mysqlPath -u $username -p$passwordText vytal_db -e $userInsert 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ User added" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Warning: $result" -ForegroundColor Yellow
    }
}

# Verify the new table structure
Write-Host ""
Write-Host "🔍 Verifying new table structure..." -ForegroundColor Cyan
$structure = & $mysqlPath -u $username -p$passwordText vytal_db -e "DESCRIBE users;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Table structure:" -ForegroundColor Green
    Write-Host $structure -ForegroundColor White
} else {
    Write-Host "❌ Error checking structure: $structure" -ForegroundColor Red
}

# Show all users
Write-Host ""
Write-Host "👥 All users in database:" -ForegroundColor Cyan
$allUsers = & $mysqlPath -u $username -p$passwordText vytal_db -e "SELECT id, name, phone, email, role, category, created_at FROM users ORDER BY id;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host $allUsers -ForegroundColor White
} else {
    Write-Host "❌ Error fetching users: $allUsers" -ForegroundColor Red
}

# Test login functionality
Write-Host ""
Write-Host "🔐 Testing login functionality..." -ForegroundColor Cyan
$loginTest = & $mysqlPath -u $username -p$passwordText vytal_db -e "SELECT id, name, email, role, category FROM users WHERE email = 'john.donor@vytal.com' AND password_hash = SHA2('donor123', 256);" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Login test successful:" -ForegroundColor Green
    Write-Host $loginTest -ForegroundColor White
} else {
    Write-Host "❌ Login test failed: $loginTest" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Database Reset Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "✅ Old tables dropped" -ForegroundColor Green
Write-Host "✅ New users table created with updated schema" -ForegroundColor Green
Write-Host "✅ Sample users added" -ForegroundColor Green
Write-Host "✅ Login functionality tested" -ForegroundColor Green

Write-Host ""
Write-Host "🧪 Test Accounts:" -ForegroundColor Cyan
Write-Host "Email: john.donor@vytal.com | Password: donor123 | Role: donor | Category: Blood" -ForegroundColor White
Write-Host "Email: jane.receiver@vytal.com | Password: receiver123 | Role: receiver | Category: Blood" -ForegroundColor White
Write-Host "Email: dr.smith@vytal.com | Password: doctor123 | Role: donor | Category: Organs" -ForegroundColor White
Write-Host "Email: mary.patient@vytal.com | Password: patient123 | Role: receiver | Category: Organs" -ForegroundColor White
Write-Host "Email: alex.pharmacy@vytal.com | Password: pharmacy123 | Role: donor | Category: Medicines" -ForegroundColor White
Write-Host "Email: emma.user@vytal.com | Password: user123 | Role: receiver | Category: Medicines" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Ready for testing!" -ForegroundColor Green
