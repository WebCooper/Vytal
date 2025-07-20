# API Testing Script for Vytal Backend
# This script tests if the backend API is working and creating accounts

Write-Host "=== Vytal API Testing ===" -ForegroundColor Green

# Check if curl is available
$curlPath = Get-Command curl -ErrorAction SilentlyContinue
if (-not $curlPath) {
    Write-Host "❌ curl not found. Using Invoke-RestMethod instead" -ForegroundColor Yellow
    $useCurl = $false
} else {
    Write-Host "✅ curl found" -ForegroundColor Green
    $useCurl = $true
}

$baseUrl = "http://localhost:8080/api"

Write-Host ""
Write-Host "=== Testing API Endpoints ===" -ForegroundColor Yellow

# Test 1: Health Check
Write-Host "1. Testing health check..." -ForegroundColor Cyan
try {
    if ($useCurl) {
        $healthResponse = & curl -s "$baseUrl/health" 2>&1
        Write-Host "   ✅ Health check response:" -ForegroundColor Green
        Write-Host "   $healthResponse" -ForegroundColor White
    } else {
        $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -ErrorAction Stop
        Write-Host "   ✅ Health check successful:" -ForegroundColor Green
        Write-Host "   Status: $($healthResponse.status)" -ForegroundColor White
        Write-Host "   Service: $($healthResponse.service)" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure the backend is running: bal run" -ForegroundColor Yellow
}

# Test 2: Database Health Check
Write-Host ""
Write-Host "2. Testing database health..." -ForegroundColor Cyan
try {
    if ($useCurl) {
        $dbHealthResponse = & curl -s "$baseUrl/db/health" 2>&1
        Write-Host "   ✅ Database health response:" -ForegroundColor Green
        Write-Host "   $dbHealthResponse" -ForegroundColor White
    } else {
        $dbHealthResponse = Invoke-RestMethod -Uri "$baseUrl/db/health" -Method GET -ErrorAction Stop
        Write-Host "   ✅ Database health check successful:" -ForegroundColor Green
        Write-Host "   Database: $($dbHealthResponse.database)" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Database health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get All Users
Write-Host ""
Write-Host "3. Testing get all users..." -ForegroundColor Cyan
try {
    if ($useCurl) {
        $usersResponse = & curl -s "$baseUrl/users" 2>&1
        Write-Host "   ✅ Users endpoint response:" -ForegroundColor Green
        Write-Host "   $usersResponse" -ForegroundColor White
    } else {
        $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET -ErrorAction Stop
        Write-Host "   ✅ Users retrieved successfully:" -ForegroundColor Green
        foreach ($user in $usersResponse) {
            Write-Host "   - ID: $($user.id), Name: $($user.name), Email: $($user.email), Role: $($user.role)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "   ❌ Get users failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Create New User
Write-Host ""
Write-Host "4. Testing user creation..." -ForegroundColor Cyan
$testUser = @{
    name = "Test User $(Get-Random)"
    email = "test$(Get-Random)@example.com"
    password = "testpassword123"
    phone = "+1234567890"
    role = "user"
} | ConvertTo-Json

try {
    if ($useCurl) {
        $createResponse = & curl -s -X POST "$baseUrl/users" -H "Content-Type: application/json" -d $testUser 2>&1
        Write-Host "   ✅ User creation response:" -ForegroundColor Green
        Write-Host "   $createResponse" -ForegroundColor White
    } else {
        $createResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method POST -ContentType "application/json" -Body $testUser -ErrorAction Stop
        Write-Host "   ✅ User created successfully:" -ForegroundColor Green
        Write-Host "   ID: $($createResponse.id)" -ForegroundColor White
        Write-Host "   Name: $($createResponse.name)" -ForegroundColor White
        Write-Host "   Email: $($createResponse.email)" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ User creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "   Error details: $errorContent" -ForegroundColor Red
    }
}

# Test 5: Login Test
Write-Host ""
Write-Host "5. Testing login with default admin account..." -ForegroundColor Cyan
$loginData = @{
    email = "admin@vytal.com"
    password = "admin123"
} | ConvertTo-Json

try {
    if ($useCurl) {
        $loginResponse = & curl -s -X POST "$baseUrl/auth/login" -H "Content-Type: application/json" -d $loginData 2>&1
        Write-Host "   ✅ Login response:" -ForegroundColor Green
        Write-Host "   $loginResponse" -ForegroundColor White
    } else {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginData -ErrorAction Stop
        Write-Host "   ✅ Login successful:" -ForegroundColor Green
        Write-Host "   Success: $($loginResponse.success)" -ForegroundColor White
        Write-Host "   Message: $($loginResponse.message)" -ForegroundColor White
        if ($loginResponse.token) {
            Write-Host "   Token received: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor White
        }
    }
} catch {
    Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Manual Testing Commands ===" -ForegroundColor Yellow
Write-Host "You can also test manually using these curl commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Health check:" -ForegroundColor White
Write-Host "   curl http://localhost:8080/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Get all users:" -ForegroundColor White
Write-Host "   curl http://localhost:8080/api/users" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Create user:" -ForegroundColor White
Write-Host '   curl -X POST http://localhost:8080/api/users -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"test123\"}"' -ForegroundColor Gray
Write-Host ""
Write-Host "4. Login:" -ForegroundColor White
Write-Host '   curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@vytal.com\",\"password\":\"admin123\"}"' -ForegroundColor Gray

Write-Host ""
Write-Host "=== API Testing Complete ===" -ForegroundColor Green
