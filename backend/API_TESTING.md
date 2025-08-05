# Vytal Backend API Testing

This document provides examples of how to test the authentication endpoints.

## Endpoints

### 1. Health Check
```
GET http://localhost:8080/api/v1/health
```

### 2. User Registration
```
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "phone_number": "+1234567890",
    "email": "john.doe@example.com",
    "password": "password123",
    "role": "donor",
    "categories": ["Organic", "Medicines"]
}
```

### 3. User Login
```
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
    "email": "john.doe@example.com",
    "password": "password123"
}
```

### 4. Get User Profile (Protected)
```
GET http://localhost:8080/api/v1/auth/profile
Authorization: Bearer <your-jwt-token>
```

### 5. Update User Profile (Protected)
```
PUT http://localhost:8080/api/v1/auth/profile
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
    "name": "John Updated",
    "phone_number": "+1234567890",
    "role": "receiver",
    "categories": ["Blood"]
}
```

## Response Format

All responses follow this format:

```json
{
    "success": boolean,
    "message": "string",
    "data": object (optional)
}
```

## Error Codes

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials or token)
- `409`: Conflict (user already exists)
- `500`: Internal Server Error

## Testing with curl

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

### Get profile with token:
```bash
curl -X GET http://localhost:8080/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Notes

- Passwords are hashed using SHA-256 before storage
- JWT tokens expire after 1 hour (configurable)
- Email validation is performed on registration
- User data is currently stored in memory (implement database for production)
- All endpoints support CORS for frontend integration
