# Testing Guide for Vytal Database and API

This guide helps you verify that your database and API are working correctly.

## 🔍 Quick Testing Steps

### 1. **Database Testing** (Run First)
```powershell
# Go to backend directory
cd "e:\MY\PROJECTS\WEB APP\Vytal\backend"

# Run database test script
.\test-database.ps1
```

### 2. **Start the Backend** (Required for API testing)
```powershell
# In backend directory
bal run
```

### 3. **API Testing** (Run in another terminal)
```powershell
# Open new PowerShell window, go to backend directory
cd "e:\MY\PROJECTS\WEB APP\Vytal\backend"

# Run API test script
.\test-api.ps1
```

## 🔧 Manual Database Verification

### Connect to MySQL and check manually:
```bash
# Connect to MySQL
mysql -u root -p

# Switch to database
USE vytal_db;

# Check if tables exist
SHOW TABLES;

# View users table structure
DESCRIBE users;

# See all users
SELECT id, name, email, role, created_at FROM users;

# Count total users
SELECT COUNT(*) FROM users;

# Check specific user
SELECT * FROM users WHERE email = 'admin@vytal.com';
```

## 🌐 Manual API Testing

### Using curl commands:

#### 1. Health Check
```bash
curl http://localhost:8080/api/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": 1642780800,
  "service": "Vytal Backend",
  "database": "connected",
  "version": "1.0.0"
}
```

#### 2. Database Health
```bash
curl http://localhost:8080/api/db/health
```

#### 3. Get All Users
```bash
curl http://localhost:8080/api/users
```

#### 4. Create New User
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "phone": "+1234567890",
    "role": "user"
  }'
```

#### 5. Login Test
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vytal.com",
    "password": "admin123"
  }'
```

## 🧪 Frontend Testing

### Test the complete flow:

1. **Start Frontend:**
```powershell
cd "e:\MY\PROJECTS\WEB APP\Vytal\frontend"
npm run dev
```

2. **Visit:** http://localhost:3000

3. **Test Sign In:**
   - Email: `admin@vytal.com`
   - Password: `admin123`

4. **Check Dashboard:**
   - Should show user info
   - Should display API health status
   - Should list users from database

## ❗ Troubleshooting

### Database Issues:
- **Database not found:** Run `.\setup-database.ps1` first
- **Connection refused:** Check if MySQL is running
- **Access denied:** Verify username/password in Config.toml

### API Issues:
- **Connection refused:** Make sure backend is running (`bal run`)
- **CORS errors:** Check frontend URL is in CORS config
- **404 errors:** Verify API endpoints are correct

### Backend Issues:
- **Ballerina not found:** Install Ballerina from ballerina.io
- **Build errors:** Check dependencies in Ballerina.toml
- **Port in use:** Change port or kill existing process

## 📊 Expected Test Results

### Database Test Should Show:
- ✅ Database 'vytal_db' exists
- ✅ Tables: users, health_records, appointments
- ✅ Default users: admin, doctor, patient
- ✅ User count > 0

### API Test Should Show:
- ✅ Health check returns 200 status
- ✅ Database health check passes
- ✅ Users endpoint returns array
- ✅ User creation succeeds
- ✅ Login returns JWT token

### Frontend Test Should Show:
- ✅ Sign in page loads
- ✅ Login with admin@vytal.com works
- ✅ Dashboard displays user info
- ✅ API status shows "healthy"
- ✅ Users list displays

## 🎯 Test User Accounts

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@vytal.com | admin123 | System administration |
| Doctor | doctor@vytal.com | doctor123 | Medical professional |
| Patient | patient@vytal.com | patient123 | Regular user |

## 🔄 Complete Testing Checklist

- [ ] Database connection works
- [ ] Tables are created correctly
- [ ] Default users exist
- [ ] Backend starts without errors
- [ ] Health endpoints respond
- [ ] User creation works
- [ ] Authentication works
- [ ] JWT tokens are generated
- [ ] Frontend connects to backend
- [ ] Sign in flow works
- [ ] Dashboard displays data

If all items are checked, your setup is working correctly! ✅
