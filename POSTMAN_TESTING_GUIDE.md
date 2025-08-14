# 🚀 Vytal Backend API Testing with Postman

## 📋 Overview
This guide provides complete instructions for testing all Vytal backend APIs using Postman.

## 🔧 Setup Requirements

### 1. Start the Backend Server
```bash
cd "E:\MY\PROJECTS\WEB APP\Vytal\backend"
$env:JAVA_OPTS="-Xmx256m -Xms128m"
bal run
```
**Server will run on:** `http://localhost:9091`

### 2. Ensure MySQL Database is Running
- Make sure MySQL server is running on localhost:3306
- Database `vytal_db` should exist with proper tables
- Tables `users` and `tokens` should be created
- MySQL credentials should match your configuration (default: root/1010)
- Verify database is properly initialized with:
```sql
USE vytal_db;
SHOW TABLES;
```

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/health` | Health check | No |
| POST | `/api/v1/register` | User registration | No |
| POST | `/api/v1/login` | User login | No |
| GET | `/api/v1/profile` | Get user profile | Yes |
| PUT | `/api/v1/profile` | Update user profile | Yes |
| POST | `/api/v1/logout` | User logout | Yes |

## 🧪 Postman Collection Setup

### Base Configuration
- **Base URL:** `http://localhost:9091`
- **Content-Type:** `application/json`

## 🛢️ Database Verification

After running API tests in Postman, you can verify the data is properly stored in MySQL:

### Checking User Data
```sql
-- Connect to MySQL
mysql -u root -p1010

-- Select the database
USE vytal_db;

-- View registered users
SELECT * FROM users;

-- Check stored authentication tokens
SELECT * FROM tokens;

-- Verify user categories
SELECT * FROM users WHERE email = 'john.doe@example.com';
```

### Data Validation Checks
- Verify that user passwords are stored as hashed values, not plaintext
- Confirm that tokens are created during login and removed during logout
- Check that user updates are properly reflected in the database

## 🔍 API Testing Instructions

### 1. **Health Check** - GET `/api/v1/health`

**Purpose:** Verify server is running and MySQL connection is working

**Request:**
- **Method:** GET
- **URL:** `http://localhost:9091/api/v1/health`
- **Headers:** None required

**Expected Response:**
```json
{
    "status": "healthy",
    "timestamp": "2025-08-14T10:30:00.000Z",
    "service": "Vytal Authentication API"
}
```

**Status Code:** `200 OK`

---

### 2. **User Registration** - POST `/api/v1/register`

**Purpose:** Register a new user and store in MySQL database

**Request:**
- **Method:** POST
- **URL:** `http://localhost:9091/api/v1/register`
- **Headers:**
  ```
  Content-Type: application/json
  ```

**Request Body:**
```json
{
    "name": "John Doe",
    "phone_number": "+1234567890",
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "role": "donor",
    "categories": ["Organic", "Medicines"]
}
```

**Field Options:**
- **role:** `"donor"` or `"receiver"`
- **categories:** Array of `"Organic"`, `"Medicines"`, `"Blood"`

**Expected Success Response:**
```json
{
    "message": "User registered successfully",
    "user": {
        "name": "John Doe",
        "phone_number": "+1234567890",
        "email": "john.doe@example.com",
        "role": "donor",
        "categories": ["Organic", "Medicines"]
    },
    "timestamp": "2025-08-14T10:30:00.000Z"
}
```

**Status Code:** `201 Created`

**Expected Error Response (if email exists):**
```json
{
    "error": "User already exists",
    "timestamp": "2025-08-14T10:30:00.000Z"
}
```

**Status Code:** `400 Bad Request`

---

### 3. **User Login** - POST `/api/v1/login`

**Purpose:** Authenticate user and get access token (creates token entry in database)

**Request:**
- **Method:** POST
- **URL:** `http://localhost:9091/api/v1/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```

**Request Body:**
```json
{
    "email": "john.doe@example.com",
    "password": "securePassword123"
}
```

**Expected Success Response:**
```json
{
    "message": "Login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "name": "John Doe",
            "phone_number": "+1234567890",
            "email": "john.doe@example.com",
            "role": "donor",
            "categories": ["Organic", "Medicines"]
        }
    },
    "timestamp": "2025-08-14T10:30:00.000Z"
}
```

**Status Code:** `200 OK`

**⚠️ IMPORTANT:** Save the `token` value for authenticated requests!

**Expected Error Response (invalid credentials):**
```json
{
    "error": "Invalid credentials",
    "timestamp": "2025-08-14T10:30:00.000Z"
}
```

**Status Code:** `401 Unauthorized`

---

### 4. **Get User Profile** - GET `/api/v1/profile`

**Purpose:** Get current user's profile information from database

**Request:**
- **Method:** GET
- **URL:** `http://localhost:9091/api/v1/profile`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN_HERE
  ```

**Expected Success Response:**
```json
{
    "data": {
        "name": "John Doe",
        "phone_number": "+1234567890",
        "email": "john.doe@example.com",
        "role": "donor",
        "categories": ["Organic", "Medicines"]
    },
    "timestamp": "2025-08-14T10:30:00.000Z"
}
```

**Status Code:** `200 OK`

**Expected Error Response (no token):**
```json
{
    "error": "Authorization header is missing",
    "timestamp": "2025-08-14T10:30:00.000Z"
}
```

**Status Code:** `401 Unauthorized`

---

### 5. **Update User Profile** - PUT `/api/v1/profile`

**Purpose:** Update current user's profile information in database

**Request:**
- **Method:** PUT
- **URL:** `http://localhost:9091/api/v1/profile`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN_HERE
  ```

**Request Body (all fields optional):**
```json
{
    "name": "John Updated Doe",
    "phone_number": "+1987654321",
    "role": "receiver",
    "categories": ["Blood", "Organic"]
}
```

**Expected Success Response:**
```json
{
    "message": "Profile updated successfully",
    "data": {
        "name": "John Updated Doe",
        "phone_number": "+1987654321",
        "email": "john.doe@example.com",
        "role": "receiver",
        "categories": ["Blood", "Organic"]
    },
    "timestamp": "2025-08-14T10:30:00.000Z"
}
```

**Status Code:** `200 OK`

---

### 6. **User Logout** - POST `/api/v1/logout`

**Purpose:** Logout user and invalidate token (removes token from database)

**Request:**
- **Method:** POST
- **URL:** `http://localhost:9091/api/v1/logout`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN_HERE
  ```

**Request Body:** Empty `{}`

**Expected Success Response:**
```json
{
    "message": "Logout successful",
    "timestamp": "2025-08-14T10:30:00.000Z"
}
```

**Status Code:** `200 OK`

## 🔄 Testing Workflow

### Complete User Journey Test:

1. **✅ Health Check**
   ```
   GET /api/v1/health
   ```

2. **✅ Register New User**
   ```
   POST /api/v1/register
   ```
   - Verify in MySQL: `SELECT * FROM users WHERE email = 'john.doe@example.com';`

3. **✅ Login with Credentials**
   ```
   POST /api/v1/login
   Save the token from response!
   ```
   - Verify in MySQL: `SELECT * FROM tokens WHERE email = 'john.doe@example.com';`

4. **✅ Get User Profile**
   ```
   GET /api/v1/profile
   (Use token from step 3)
   ```

5. **✅ Update User Profile**
   ```
   PUT /api/v1/profile
   (Use token from step 3)
   ```
   - Verify in MySQL: `SELECT * FROM users WHERE email = 'john.doe@example.com';`

6. **✅ Logout User**
   ```
   POST /api/v1/logout
   (Use token from step 3)
   ```
   - Verify in MySQL: `SELECT * FROM tokens WHERE email = 'john.doe@example.com';` (should be empty)

7. **✅ Try Access After Logout**
   ```
   GET /api/v1/profile
   (Should fail with 401)
   ```

## 🛠️ Postman Environment Setup

### Create Environment Variables:
- **base_url:** `http://localhost:9091`
- **auth_token:** `{{auth_token}}` (set after login)

### Auto-Save Token Script:
Add this to the **Tests** tab of the login request:

```javascript
// Save token from login response
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("auth_token", response.data.token);
        console.log("Token saved:", response.data.token);
    }
}
```

### Auto-Use Token in Headers:
For authenticated requests, set Authorization header to:
```
Bearer {{auth_token}}
```

## 🐛 Common Issues & Troubleshooting

### Issue 1: Connection Refused
**Error:** `ECONNREFUSED`
**Solution:** Ensure backend server is running on port 9091

### Issue 2: 401 Unauthorized
**Error:** `Authorization header is missing`
**Solution:** Check that Authorization header is properly set with "Bearer " prefix

### Issue 3: 400 Bad Request
**Error:** Various validation errors
**Solution:** Check request body format matches the expected JSON schema

### Issue 4: Database Connection Issues
**Error:** Database-related errors
**Solution:** 
- Ensure MySQL is running on localhost:3306
- Verify database credentials in Config.toml match your MySQL setup
- Check that database and tables are properly created:
  ```sql
  SHOW DATABASES;
  USE vytal_db;
  SHOW TABLES;
  ```
- Verify MySQL connection parameters:
  ```sql
  SELECT USER(), CURRENT_USER();
  SHOW GRANTS;
  ```

## 📊 Expected Status Codes

| Status Code | Meaning | When You'll See It |
|-------------|---------|-------------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (registration) |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | User not found |
| 500 | Server Error | Database/server issues |

## 🎯 Testing Checklist

- [ ] Health check returns 200
- [ ] User registration with valid data returns 201
- [ ] User registration with duplicate email returns 400
- [ ] Login with valid credentials returns 200 with token
- [ ] Login with invalid credentials returns 401
- [ ] Profile access with valid token returns 200
- [ ] Profile access without token returns 401
- [ ] Profile update with valid token returns 200
- [ ] Logout with valid token returns 200
- [ ] Profile access after logout returns 401

## �️ Database Testing Checklist

- [ ] User data correctly stored in `users` table after registration
- [ ] Password stored as hashed value, not plaintext
- [ ] Token created in `tokens` table after login
- [ ] User data updated in database after profile update
- [ ] Token removed from database after logout
- [ ] Database queries execute with acceptable performance

## �🚀 Ready to Test!

1. Start your backend server
2. Open Postman
3. Follow the testing workflow above
4. Check off items in the testing checklist

Your Vytal backend APIs are ready for comprehensive testing! 🎉
