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

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vytal_db
JWT_SECRET=your_jwt_secret
SERVER_PORT=9090
```

## Testing Status

✅ All endpoints tested and working:
- Health check: ✅
- Registration: ✅
- Login: ✅
- Profile retrieval: ✅
- Profile update: ✅

The backend is ready for frontend integration and provides a solid foundation for the Vytal application's authentication system.
