# Quick Test Script for Vytal Backend API
# Run this after starting the backend

Write-Host "🚀 Testing Vytal Backend API" -ForegroundColor Green

# 1. Test Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:9090/api/v1/health" -Method GET
    Write-Host "✅ Health Check: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Test User Registration
Write-Host "`n2. Testing User Registration..." -ForegroundColor Yellow
$userData = @{
    name = "Test User"
    phone_number = "+1234567890"
    email = "test@example.com"
    password = "password123"
    role = "donor"
    categories = @("Organic", "Medicines")
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "http://localhost:9090/api/v1/register" -Method POST -Body $userData -ContentType "application/json"
    Write-Host "✅ Registration Success: User ID $($register.user.id)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Registration: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 3. Test User Login
Write-Host "`n3. Testing User Login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "http://localhost:9090/api/v1/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $login.data.token
    Write-Host "✅ Login Success: Token received" -ForegroundColor Green
    
    # 4. Test Get Profile
    Write-Host "`n4. Testing Get Profile..." -ForegroundColor Yellow
    $headers = @{ "Authorization" = "Bearer $token" }
    $profile = Invoke-RestMethod -Uri "http://localhost:9090/api/v1/profile" -Method GET -Headers $headers
    Write-Host "✅ Profile Retrieved: $($profile.data.name)" -ForegroundColor Green
    
    # 5. Test Logout
    Write-Host "`n5. Testing Logout..." -ForegroundColor Yellow
    $logout = Invoke-RestMethod -Uri "http://localhost:9090/api/v1/logout" -Method POST -Headers $headers
    Write-Host "✅ Logout Success" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Basic API tests completed!" -ForegroundColor Green
