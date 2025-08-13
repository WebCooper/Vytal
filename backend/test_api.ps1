# Test script for Vytal API

# Test health endpoint
Write-Host "Testing health endpoint..."
curl http://localhost:9090/api/v1/health

Write-Host "`n`nTesting registration endpoint..."
# Test registration
$registerData = @{
    name = "John Doe"
    phone_number = "1234567890"
    email = "john@example.com"
    password = "password123"
    role = "donor"
    categories = @("Organic", "Medicines")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/api/v1/register" -Method POST -Body $registerData -ContentType "application/json"

Write-Host "`n`nTesting login endpoint..."
# Test login
$loginData = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:9090/api/v1/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.data.token

Write-Host "`n`nTesting profile endpoint..."
# Test get profile
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:9090/api/v1/profile" -Method GET -Headers $headers
