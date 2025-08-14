# Vytal Backend - User Authentication System

## Overview

I've successfully created a comprehensive user registration and login system for the Vytal application using Ballerina. The backend includes all the features from your User schema:

## User Schema Implementation

✅ **User Fields**:
- `id` - Auto-generated UUID
- `name` - User's full name
- `phone_number` - Phone number
- `email` - Email address (used for login)
- `password` - Hashed using SHA-256
- `role` - Enum: "donor" or "receiver"
- `categories` - Array of enums: "Organic", "Medicines", "Blood"
- `created_at` - Timestamp when user was created
- `updated_at` - Timestamp when user was last updated

## API Endpoints

### 1. Health Check
- **GET** `/api/v1/health`
- Returns server status and timestamp

### 2. User Registration
- **POST** `/api/v1/auth/register`
- Creates a new user account
- Validates input data
- Hashes password securely
- Returns user data without password

### 3. User Login
- **POST** `/api/v1/auth/login`
- Authenticates user credentials
- Returns access token and user data
- Password verification using SHA-256

### 4. Get Profile (Protected)
- **GET** `/api/v1/auth/profile`
- Requires Bearer token in Authorization header
- Returns current user's profile data

### 5. Update Profile (Protected)
- **PUT** `/api/v1/auth/profile`
- Requires Bearer token in Authorization header
- Updates user profile information
- Email cannot be changed

## Security Features

✅ **Password Security**:
- SHA-256 hashing before storage
- Passwords never returned in API responses

✅ **Authentication**:
- Token-based authentication system
- Bearer token format
- Token validation for protected endpoints

✅ **Input Validation**:
- Email format validation
- Password strength requirements (minimum 6 characters)
- Required field validation
- Category validation

✅ **CORS Support**:
- Configured for frontend integration
- Supports localhost:3000 and localhost:3001

## Response Format

All API responses follow a consistent format:

```json
{
    "success": boolean,
    "message": "string",
    "data": object (optional)
}
```

## Example Usage

### Register a new user:
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "phone_number": "+1987654321",
    "email": "alice@example.com",
    "password": "securepass123",
    "role": "donor",
    "categories": ["Organic", "Blood"]
  }'
```

### Login:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securepass123"
  }'
```

### Get profile:
```bash
curl -X GET http://localhost:8080/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Technical Implementation

✅ **Ballerina Features Used**:
- HTTP service with resource functions
- Record types for data models
- Error handling and validation
- Crypto module for password hashing
- UUID generation for unique IDs
- Time utilities for timestamps

✅ **Data Storage**:
- In-memory storage (userStore map)
- Token storage for authentication
- Ready for database integration in production

✅ **Error Handling**:
- Comprehensive error responses
- HTTP status codes (400, 401, 409, 500)
- Validation error messages

## Server Information

- **Port**: 8080
- **Base URL**: http://localhost:8080/api/v1
- **Status**: ✅ Running and tested
- **Build**: ✅ Successful compilation

## Next Steps for Production

1. **Database Integration**: Replace in-memory storage with MySQL/PostgreSQL
2. **JWT Implementation**: Use proper JWT tokens with expiration
3. **Password Reset**: Add forgot password functionality
4. **Rate Limiting**: Implement request rate limiting
5. **Logging**: Add comprehensive logging
6. **Environment Configuration**: Use environment variables for secrets
7. **API Documentation**: Generate OpenAPI/Swagger documentation

## Testing Status

✅ All endpoints tested and working:
- Health check: ✅
- Registration: ✅
- Login: ✅
- Profile retrieval: ✅
- Profile update: ✅

The backend is ready for frontend integration and provides a solid foundation for the Vytal application's authentication system.
=======
# Vytal Backend with MySQL Database

A complete Ballerina backend with MySQL database integration for the Vytal health platform.

## 🚀 Features

- **Database Integration**: Full MySQL database with user management
- **Authentication**: JWT-based authentication with secure password hashing
- **RESTful API**: Complete CRUD operations for users
- **CORS Support**: Configured for frontend integration
- **Security**: Password hashing with SHA-256, JWT tokens
- **Health Checks**: API and database health monitoring
- **Type Safety**: Strongly typed with Ballerina records

## 📋 Prerequisites

1. **Ballerina**: Install from [ballerina.io](https://ballerina.io/downloads/)
2. **MySQL**: Install MySQL Server 8.0+
3. **MySQL Client**: For running database scripts

## 🔧 Setup Instructions

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE vytal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Run the setup script
mysql -u root -p vytal_db < database_setup.sql
```

Or use the provided script:
```bash
mysql -u root -p < database_setup.sql
```

### 2. Configuration

Copy and update the configuration file:
```bash
cp Config.example.toml Config.toml
```

Update `Config.toml` with your database credentials:
```toml
[vytal_backend]
DB_HOST = "localhost"
DB_PORT = 3306
DB_NAME = "vytal_db"
DB_USER = "your_username"
DB_PASSWORD = "your_password"
JWT_SECRET = "your-production-secret-key"
```

### 3. Install Dependencies

```bash
bal build
```

### 4. Run the Backend

```bash
bal run
```

The server will start on `http://localhost:8080`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/profile` - Get user profile (requires JWT)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user (registration)

### Health Checks
- `GET /api/health` - API health check
- `GET /api/db/health` - Database health check

## 📝 Sample Requests

### Register User
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "securepassword",
    "role": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword"
  }'
```

### Get Profile (with JWT)
```bash
curl -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'doctor', 'patient') DEFAULT 'user',
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔐 Security Features

1. **Password Hashing**: SHA-256 password hashing
2. **JWT Authentication**: Secure token-based authentication
3. **Input Validation**: Server-side validation for all inputs
4. **CORS Protection**: Configured for specific origins
5. **SQL Injection Prevention**: Parameterized queries

## 🧪 Testing

### Default Test Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vytal.com | admin123 |
| Doctor | doctor@vytal.com | doctor123 |
| Patient | patient@vytal.com | patient123 |

### Health Check
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": 1642780800,
  "service": "Vytal Backend",
  "database": "connected",
  "version": "1.0.0"
}
```

## 🔧 Troubleshooting

### Database Connection Issues
1. Verify MySQL is running: `sudo systemctl status mysql`
2. Check credentials in `Config.toml`
3. Ensure database `vytal_db` exists
4. Verify user permissions

### Port Already in Use
```bash
# Find process using port 8080
netstat -tulpn | grep :8080

# Kill the process if needed
sudo kill -9 <PID>
```

### JWT Token Issues
- Ensure `JWT_SECRET` is set in `Config.toml`
- Token expires after 1 hour (configurable)
- Include `Bearer ` prefix in Authorization header

## 🚀 Production Deployment

1. **Change JWT Secret**: Use a strong, unique secret key
2. **Database Security**: Use non-root MySQL user with limited permissions
3. **HTTPS**: Configure SSL/TLS certificates
4. **Environment Variables**: Use environment variables for sensitive data
5. **Logging**: Configure appropriate log levels
6. **Monitoring**: Set up health check monitoring

## 📁 Project Structure

```
backend/
├── main.bal                 # Main application file
├── Ballerina.toml          # Project configuration
├── Config.toml             # Runtime configuration
├── Config.example.toml     # Configuration template
├── database_setup.sql      # Database initialization
├── Dependencies.toml       # Dependencies lock file
└── README.md              # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper testing
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.