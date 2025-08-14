# 🧪 Vytal Backend Testing Guide

## 📋 Overview
This guide provides comprehensive instructions for testing the Vytal backend API endpoints. The backend includes user authentication, profile management, and database integration.

## 🚀 Prerequisites

### 1. Backend Running
Ensure the Vytal backend is running:
```powershell
cd "e:\MY\PROJECTS\WEB APP\Vytal\backend"
$env:JAVA_OPTS="-Xmx256m -Xms128m"
bal run
```

### 2. Database Setup
- MySQL server running on localhost:3306
- Database: `vytal_db`
- Tables: `users` and `tokens`
- Credentials: root/1010

### 3. API Base URL
- **Development**: `http://localhost:9090/api/v1`
- **Port**: 9090 (as configured in main.bal)

## 🔧 Testing Methods

### Method 1: Automated Testing Script
```powershell
# Run the comprehensive test script
cd "e:\MY\PROJECTS\WEB APP\Vytal\backend"
.\test_api_complete.ps1
```

### Method 2: Manual Testing with curl
```bash
# Test each endpoint manually (see examples below)
```

### Method 3: Postman/Thunder Client
Import the endpoints and test via GUI tools.

## 📡 API Endpoints Testing

### 1. Health Check
**Purpose**: Verify the service is running

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:9090/api/v1/health" -Method GET

# curl
curl http://localhost:9090/api/v1/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-14T...",
  "service": "Vytal Authentication API"
}
```

### 2. User Registration
**Purpose**: Create a new user account

```powershell
# PowerShell
$registerData = @{
    name = "John Doe"
    phone_number = "+1234567890"
    email = "john@example.com"
    password = "password123"
    role = "donor"
    categories = @("Organic", "Medicines")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/api/v1/register" -Method POST -Body $registerData -ContentType "application/json"
```

```bash
# curl
curl -X POST http://localhost:9090/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone_number": "+1234567890",
    "email": "john@example.com",
    "password": "password123",
    "role": "donor",
    "categories": ["Organic", "Medicines"]
  }'
```

**Expected Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donor",
    "categories": ["Organic", "Medicines"]
  },
  "timestamp": "2025-08-14T..."
}
```

### 3. User Login
**Purpose**: Authenticate user and get access token

```powershell
# PowerShell
$loginData = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:9090/api/v1/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.data.token
```

```bash
# curl
curl -X POST http://localhost:9090/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response** (200 OK):
```json
{
  "message": "Login successful",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "donor"
    }
  },
  "timestamp": "2025-08-14T..."
}
```

### 4. Get User Profile
**Purpose**: Retrieve authenticated user's profile
**Requires**: Valid Authorization header

```powershell
# PowerShell (using token from login)
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:9090/api/v1/profile" -Method GET -Headers $headers
```

```bash
# curl (replace TOKEN with actual token)
curl -X GET http://localhost:9090/api/v1/profile \
  -H "Authorization: Bearer TOKEN"
```

**Expected Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "role": "donor",
    "categories": ["Organic", "Medicines"]
  },
  "timestamp": "2025-08-14T..."
}
```

### 5. Update User Profile
**Purpose**: Update authenticated user's profile
**Requires**: Valid Authorization header

```powershell
# PowerShell
$updateData = @{
    name = "John Doe Updated"
    phone_number = "+1234567899"
    role = "receiver"
    categories = @("Blood", "Medicines")
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:9090/api/v1/profile" -Method PUT -Body $updateData -Headers $headers -ContentType "application/json"
```

```bash
# curl
curl -X PUT http://localhost:9090/api/v1/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "phone_number": "+1234567899",
    "role": "receiver",
    "categories": ["Blood", "Medicines"]
  }'
```

### 6. User Logout
**Purpose**: Invalidate user session
**Requires**: Valid Authorization header

```powershell
# PowerShell
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:9090/api/v1/logout" -Method POST -Headers $headers
```

```bash
# curl
curl -X POST http://localhost:9090/api/v1/logout \
  -H "Authorization: Bearer TOKEN"
```

**Expected Response** (200 OK):
```json
{
  "message": "Logout successful",
  "timestamp": "2025-08-14T..."
}
```

## 🚨 Error Testing

### 1. Invalid Registration
```powershell
# Missing required fields
$invalidData = @{
    name = "John"
    # missing email, password, etc.
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/api/v1/register" -Method POST -Body $invalidData -ContentType "application/json"
```

### 2. Duplicate Email Registration
```powershell
# Try to register with existing email
# Should return 400 Bad Request
```

### 3. Invalid Login
```powershell
# Wrong credentials
$wrongCredentials = @{
    email = "john@example.com"
    password = "wrongpassword"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/api/v1/login" -Method POST -Body $wrongCredentials -ContentType "application/json"
```

### 4. Unauthorized Access
```powershell
# Access profile without token
# Should return 401 Unauthorized
Invoke-RestMethod -Uri "http://localhost:9090/api/v1/profile" -Method GET
```

### 5. Invalid Token
```powershell
# Use invalid/expired token
$headers = @{
    "Authorization" = "Bearer invalid_token"
}
Invoke-RestMethod -Uri "http://localhost:9090/api/v1/profile" -Method GET -Headers $headers
```

## 🗄️ Database Verification

### Check User Data
```sql
-- Connect to MySQL
mysql -u root -p1010

-- Use the database
USE vytal_db;

-- Check users table
SELECT * FROM users;

-- Check tokens table  
SELECT token, email, created_at FROM tokens;

-- Count users
SELECT COUNT(*) as total_users FROM users;
```

## 📊 Test Scenarios

### Scenario 1: Complete User Journey
1. Register new user
2. Login with credentials
3. Get profile information
4. Update profile
5. Logout
6. Try to access profile (should fail)

### Scenario 2: Error Handling
1. Register with invalid data
2. Login with wrong credentials
3. Access protected endpoints without token
4. Use expired/invalid tokens

### Scenario 3: Database Integration
1. Register user and verify in database
2. Login and check token storage
3. Update profile and verify changes
4. Logout and verify token removal

## 🐛 Troubleshooting

### Backend Not Starting
- Check if port 9090 is available
- Verify Java memory settings
- Check MySQL connection
- Review error logs

### Database Connection Issues
- Verify MySQL is running
- Check credentials in Config.toml
- Ensure vytal_db database exists
- Verify tables are created

### Authentication Issues
- Check token format (Bearer TOKEN)
- Verify token is valid and not expired
- Ensure proper Authorization header

### API Response Issues
- Check Content-Type headers
- Verify JSON format
- Check endpoint URLs
- Review request body structure

## 📝 Test Results Checklist

- [ ] Health endpoint returns 200
- [ ] User registration works (201)
- [ ] User login returns token (200)
- [ ] Profile retrieval works with token (200)
- [ ] Profile update works (200)
- [ ] Logout invalidates token (200)
- [ ] Unauthorized access fails (401)
- [ ] Invalid login fails (401)
- [ ] Duplicate registration fails (400)
- [ ] Database stores user data correctly
- [ ] Tokens are managed properly

## 🎯 Success Criteria

✅ **All endpoints respond correctly**
✅ **Authentication flow works end-to-end**
✅ **Database integration functional**
✅ **Error handling appropriate**
✅ **Security measures effective**

Use the automated test script for quick verification or follow manual steps for detailed testing!
