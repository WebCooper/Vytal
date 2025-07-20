# Simple Database Login Test
Write-Host "=== Testing Database Login Functionality ===" -ForegroundColor Green
Write-Host ""

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

Write-Host "1. Testing John Donor login..." -ForegroundColor Yellow
$result1 = & $mysqlPath -u root -p1010 vytal_db -e "SELECT id, name, email, role, category FROM users WHERE email = 'john.donor@vytal.com' AND password_hash = SHA2('donor123', 256);" 2>$null
if ($result1 -match "john.donor") {
    Write-Host "   SUCCESS: John Donor can login" -ForegroundColor Green
} else {
    Write-Host "   FAILED: John Donor cannot login" -ForegroundColor Red
}

Write-Host "2. Testing Jane Receiver login..." -ForegroundColor Yellow
$result2 = & $mysqlPath -u root -p1010 vytal_db -e "SELECT id, name, email, role, category FROM users WHERE email = 'jane.receiver@vytal.com' AND password_hash = SHA2('receiver123', 256);" 2>$null
if ($result2 -match "jane.receiver") {
    Write-Host "   SUCCESS: Jane Receiver can login" -ForegroundColor Green
} else {
    Write-Host "   FAILED: Jane Receiver cannot login" -ForegroundColor Red
}

Write-Host "3. Testing Dr. Smith login..." -ForegroundColor Yellow
$result3 = & $mysqlPath -u root -p1010 vytal_db -e "SELECT id, name, email, role, category FROM users WHERE email = 'dr.smith@vytal.com' AND password_hash = SHA2('doctor123', 256);" 2>$null
if ($result3 -match "dr.smith") {
    Write-Host "   SUCCESS: Dr. Smith can login" -ForegroundColor Green
} else {
    Write-Host "   FAILED: Dr. Smith cannot login" -ForegroundColor Red
}

Write-Host "4. Testing wrong password..." -ForegroundColor Yellow
$result4 = & $mysqlPath -u root -p1010 vytal_db -e "SELECT COUNT(*) as count FROM users WHERE email = 'john.donor@vytal.com' AND password_hash = SHA2('wrongpassword', 256);" 2>$null
if ($result4 -match "0") {
    Write-Host "   SUCCESS: Wrong password correctly rejected" -ForegroundColor Green
} else {
    Write-Host "   FAILED: Security issue with password validation" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Database Summary ===" -ForegroundColor Cyan
& $mysqlPath -u root -p1010 vytal_db -e "SELECT 'Total Users' as Metric, COUNT(*) as Count FROM users;" 2>$null

Write-Host ""
Write-Host "=== All Test Users ===" -ForegroundColor Cyan
& $mysqlPath -u root -p1010 vytal_db -e "SELECT id, name, email, role, category FROM users ORDER BY id;" 2>$null

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green
Write-Host "Database is ready for API testing!" -ForegroundColor Green
