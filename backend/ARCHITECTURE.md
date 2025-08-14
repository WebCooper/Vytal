# Vytal Backend - Modular Architecture

## Project Structure

```
backend/
├── main.bal                     # Main service entry point
├── Ballerina.toml              # Project configuration
├── Package.md                  # Package documentation
├── config/
│   └── Config.toml            # Configuration settings
├── modules/
│   ├── types/
│   │   └── user.bal           # User data type definitions
│   ├── storage/
│   │   └── memory.bal         # In-memory storage implementation
│   ├── auth/
│   │   ├── token.bal          # Token generation and validation
│   │   └── handlers.bal       # HTTP request handlers
│   ├── services/
│   │   └── user.bal           # User business logic services
│   └── utils/
│       ├── validation.bal     # Input validation utilities
│       └── constants.bal      # Application constants
└── target/                    # Build output directory
```

## Module Responsibilities

### 1. `types` Module
- **File**: `user.bal`
- **Purpose**: Defines all data types and records
- **Contents**:
  - `Role` and `Category` enums
  - `User`, `UserResponse` records
  - `LoginRequest`, `LoginResponse` records
  - `RegisterRequest`, `ApiResponse` records

### 2. `storage` Module
- **File**: `memory.bal`
- **Purpose**: Data storage abstraction layer
- **Contents**:
  - In-memory user storage operations
  - Token storage operations
  - Utility functions for data conversion

### 3. `auth` Module
- **Files**: `token.bal`, `handlers.bal`
- **Purpose**: Authentication and authorization
- **Contents**:
  - Password hashing and verification
  - Token generation and validation
  - HTTP request handlers for auth endpoints

### 4. `services` Module
- **File**: `user.bal`
- **Purpose**: Business logic layer
- **Contents**:
  - User registration logic
  - User login logic
  - Profile management operations

### 5. `utils` Module
- **Files**: `validation.bal`, `constants.bal`
- **Purpose**: Utility functions and constants
- **Contents**:
  - Input validation functions
  - Application constants and configuration
  - Helper functions

## Benefits of Modular Architecture

### 1. **Separation of Concerns**
- Each module has a specific responsibility
- Clear boundaries between different layers
- Easier to understand and maintain

### 2. **Reusability**
- Modules can be reused across different parts of the application
- Easy to test individual components
- Facilitates code sharing

### 3. **Maintainability**
- Changes in one module don't affect others
- Easier to debug and fix issues
- Clear code organization

### 4. **Scalability**
- Easy to add new modules and features
- Database layer can be easily swapped
- API endpoints can be extended

### 5. **Testing**
- Individual modules can be unit tested
- Mock implementations can be created
- Better test coverage

## How It Works

### 1. **Request Flow**
```
HTTP Request → main.bal → auth/handlers.bal → services/user.bal → storage/memory.bal
```

### 2. **Authentication Flow**
```
Login Request → Validation → Password Check → Token Generation → Response
```

### 3. **Authorization Flow**
```
Protected Request → Token Validation → User Retrieval → Business Logic → Response
```

## Development Guidelines

### 1. **Adding New Features**
- Create new modules for new domains
- Follow the existing naming conventions
- Add proper error handling
- Include input validation

### 2. **Database Integration**
- Replace `storage/memory.bal` with database module
- Keep the same interface for easy migration
- Add connection pooling and error handling

### 3. **Security Enhancements**
- Implement proper JWT with signing
- Add rate limiting
- Include request logging
- Add input sanitization

### 4. **Performance Optimization**
- Add caching layers
- Implement connection pooling
- Add monitoring and metrics
- Optimize database queries

## Configuration

The application uses `config/Config.toml` for configuration:

```toml
[vytal_backend]
# Database settings
DB_HOST = "localhost"
DB_PORT = 3306
DB_NAME = "vytal_db"
DB_USER = "root"
DB_PASSWORD = "1010"

# JWT settings
JWT_SECRET = "vytal-secret-key-development-2025"
JWT_EXPIRY_HOURS = 24

# Server settings
SERVER_PORT = 8080
```

## API Documentation

All endpoints follow RESTful conventions and return consistent JSON responses:

```json
{
    "success": boolean,
    "message": "string",
    "data": object (optional)
}
```

## Error Handling

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication failures)
- **409**: Conflict (resource already exists)
- **500**: Internal Server Error

## Next Steps

1. **Database Integration**: Replace in-memory storage
2. **JWT Enhancement**: Implement proper JWT with signing
3. **API Documentation**: Generate OpenAPI/Swagger docs
4. **Testing**: Add comprehensive unit and integration tests
5. **Logging**: Implement structured logging
6. **Monitoring**: Add health checks and metrics
7. **Security**: Implement rate limiting and input sanitization
