# Simple Database Reset Script
# Drop and recreate the users table with new schema

Write-Host "=== Vytal Database Reset ===" -ForegroundColor Green

# MySQL connection details
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$username = "root"
$password = "your_password_here"  # Update this
$database = "vytal_db"

# Check MySQL
if (-not (Test-Path $mysqlPath)) {
    Write-Host "MySQL not found at: $mysqlPath" -ForegroundColor Red
    exit 1
}

Write-Host "MySQL found" -ForegroundColor Green

# Get password from user
$securePassword = Read-Host "Enter MySQL root password" -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

# Test connection
Write-Host "Testing connection..." -ForegroundColor Yellow
$testResult = & $mysqlPath -u $username -p$passwordText -e "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Connection failed: $testResult" -ForegroundColor Red
    exit 1
}
Write-Host "Connected successfully" -ForegroundColor Green

# Drop existing users table
Write-Host "Dropping existing users table..." -ForegroundColor Yellow
$dropResult = & $mysqlPath -u $username -p$passwordText $database -e "DROP TABLE IF EXISTS users;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Table dropped successfully" -ForegroundColor Green
} else {
    Write-Host "Warning: $dropResult" -ForegroundColor Yellow
}

# Create new users table
Write-Host "Creating new users table..." -ForegroundColor Cyan
$createTable = @"
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('donor', 'receiver') NOT NULL,
    category ENUM('Organs', 'Medicines', 'Blood') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_category (category)
);
"@

$createResult = & $mysqlPath -u $username -p$passwordText $database -e $createTable 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Users table created successfully" -ForegroundColor Green
} else {
    Write-Host "Error creating table: $createResult" -ForegroundColor Red
    exit 1
}

# Insert sample users
Write-Host "Adding sample users..." -ForegroundColor Cyan
$insertUsers = @"
INSERT INTO users (name, phone, email, password_hash, role, category) VALUES
('John Donor', '+1234567890', 'john.donor@vytal.com', SHA2('donor123', 256), 'donor', 'Blood'),
('Jane Receiver', '+1234567891', 'jane.receiver@vytal.com', SHA2('receiver123', 256), 'receiver', 'Blood'),
('Dr. Smith', '+1234567892', 'dr.smith@vytal.com', SHA2('doctor123', 256), 'donor', 'Organs'),
('Patient Mary', '+1234567893', 'mary.patient@vytal.com', SHA2('patient123', 256), 'receiver', 'Organs'),
('Pharmacy Alex', '+1234567894', 'alex.pharmacy@vytal.com', SHA2('pharmacy123', 256), 'donor', 'Medicines'),
('User Emma', '+1234567895', 'emma.user@vytal.com', SHA2('user123', 256), 'receiver', 'Medicines');
"@

$insertResult = & $mysqlPath -u $username -p$passwordText $database -e $insertUsers 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Sample users added successfully" -ForegroundColor Green
} else {
    Write-Host "Error adding users: $insertResult" -ForegroundColor Red
}

# Verify table structure
Write-Host "Verifying table structure..." -ForegroundColor Cyan
$structure = & $mysqlPath -u $username -p$passwordText $database -e "DESCRIBE users;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Table structure:" -ForegroundColor White
    Write-Host $structure
} else {
    Write-Host "Error: $structure" -ForegroundColor Red
}

# Show all users
Write-Host "All users in database:" -ForegroundColor Cyan
$allUsers = & $mysqlPath -u $username -p$passwordText $database -e "SELECT id, name, email, role, category FROM users;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host $allUsers
} else {
    Write-Host "Error: $allUsers" -ForegroundColor Red
}

# Test login
Write-Host "Testing login for john.donor@vytal.com..." -ForegroundColor Yellow
$loginTest = & $mysqlPath -u $username -p$passwordText $database -e "SELECT id, name, email, role FROM users WHERE email = 'john.donor@vytal.com' AND password_hash = SHA2('donor123', 256);" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Login test result:" -ForegroundColor Green
    Write-Host $loginTest
} else {
    Write-Host "Login test failed: $loginTest" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Database Reset Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Yellow
Write-Host "john.donor@vytal.com | Password: donor123" -ForegroundColor White
Write-Host "jane.receiver@vytal.com | Password: receiver123" -ForegroundColor White
Write-Host "dr.smith@vytal.com | Password: doctor123" -ForegroundColor White
Write-Host "mary.patient@vytal.com | Password: patient123" -ForegroundColor White
Write-Host "alex.pharmacy@vytal.com | Password: pharmacy123" -ForegroundColor White
Write-Host "emma.user@vytal.com | Password: user123" -ForegroundColor White
