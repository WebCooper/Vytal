# Vytal Backend - Organized Code Structure

## 📁 Project Structure

```
backend/
├── main.bal                     # Main HTTP service and entry point
├── types.bal                    # All data type definitions
├── storage.bal                  # In-memory storage operations
├── auth.bal                     # Authentication utilities
├── validation.bal               # Input validation functions
├── services.bal                 # Business logic services
├── handlers.bal                 # HTTP request handlers
├── Ballerina.toml              # Project configuration
├── Package.md                  # Package documentation
├── config/
│   └── Config.toml             # Configuration settings
└── target/                     # Build output directory
```

## 📋 File Descriptions

### 1. `main.bal`
- **Purpose**: HTTP service configuration and routing
- **Contents**: 
  - Service endpoints definition
  - CORS configuration
  - Main function and logging

### 2. `types.bal`
- **Purpose**: All data type definitions
- **Contents**:
  - `Role` and `Category` enums
  - `User`, `UserResponse`, `LoginRequest`, `LoginResponse`, `RegisterRequest` records
  - `ApiResponse` record for consistent API responses

### 3. `storage.bal`
- **Purpose**: Data storage abstraction
- **Contents**:
  - In-memory user storage operations
  - Token storage operations
  - User conversion utilities

### 4. `auth.bal`
- **Purpose**: Authentication and security
- **Contents**:
  - Password hashing and verification
  - Token generation and validation
  - Authorization utilities

### 5. `validation.bal`
- **Purpose**: Input validation
- **Contents**:
  - Registration input validation
  - Login input validation
  - Email, phone, password validation utilities

### 6. `services.bal`
- **Purpose**: Business logic layer
- **Contents**:
  - User registration service
  - User login service
  - Profile management services

### 7. `handlers.bal`
- **Purpose**: HTTP request handlers
- **Contents**:
  - API endpoint handlers
  - Response formatting
  - Error handling

## 🔄 Request Flow

```
HTTP Request → main.bal → handlers.bal → services.bal → auth.bal/validation.bal → storage.bal
```

## 🚀 How to Run

1. **Build the project**:
   ```bash
   cd backend
   bal build
   ```

2. **Run the server**:
   ```bash
   bal run
   ```

3. **Test the health endpoint**:
   ```bash
   curl http://localhost:8080/api/v1/health
   ```

## 📊 Benefits of This Structure

### ✅ **Organized Code**
- Each file has a specific purpose
- Easy to find and modify functionality
- Clear separation of concerns

### ✅ **Maintainable**
- Changes in one area don't affect others
- Easy to debug and fix issues
- Clear code organization

### ✅ **Testable**
- Individual functions can be tested
- Mock implementations possible
- Better test coverage

### ✅ **Scalable**
- Easy to add new features
- Database layer can be swapped
- New endpoints can be added easily

## 🔧 Key Features

### 🔐 **Authentication System**
- Password hashing with SHA-256
- Token-based authentication
- Session management

### 📝 **Input Validation**
- Email format validation
- Password strength checking
- Required field validation

### 🌐 **API Design**
- RESTful endpoints
- Consistent JSON responses
- Proper HTTP status codes

### 🔒 **Security**
- CORS configuration
- Authorization headers
- Secure password handling

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/health` | Health check | No |
| POST | `/api/v1/auth/register` | User registration | No |
| POST | `/api/v1/auth/login` | User login | No |
| GET | `/api/v1/auth/profile` | Get user profile | Yes |
| PUT | `/api/v1/auth/profile` | Update profile | Yes |
| POST | `/api/v1/auth/logout` | User logout | Yes |

## 🧪 Testing Examples

### Register a user:
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone_number": "+1234567890",
    "email": "john@example.com",
    "password": "password123",
    "role": "donor",
    "categories": ["Organic"]
  }'
```

### Login:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get profile:
```bash
curl -X GET http://localhost:8080/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔄 Next Steps

1. **Database Integration**: Replace in-memory storage with MySQL/PostgreSQL
2. **Enhanced JWT**: Implement proper JWT with expiration and signing
3. **Rate Limiting**: Add request rate limiting
4. **Logging**: Implement structured logging
5. **Testing**: Add unit and integration tests
6. **Documentation**: Generate API documentation
7. **Deployment**: Add Docker and deployment configs

## 🏗️ Architecture Benefits

- **Single Package**: All files in one Ballerina package for simplicity
- **Functional Organization**: Each file has a specific functional purpose
- **Easy Navigation**: Clear file naming makes it easy to find code
- **Minimal Dependencies**: Simple imports between files
- **Production Ready**: Clean structure ready for database integration

This organized structure maintains the functionality of the monolithic version while providing clear separation of concerns and better maintainability.
