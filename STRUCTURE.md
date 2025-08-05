# Project Structure Overview

This document provides a detailed overview of the Vytal backend project structure and organization.

## Root Directory Structure

```
e:\MY\PROJECTS\WEB APP\Vytal\
├── backend/                    # Ballerina authentication API
│   ├── main.bal               # Main HTTP service definition
│   ├── Ballerina.toml         # Project configuration
│   ├── Dependencies.toml      # Dependency management
│   ├── README.md             # Project documentation
│   ├── README_NEW.md         # Updated documentation
│   ├── config/
│   │   └── Config.toml       # Configuration settings
│   ├── target/               # Build artifacts
│   │   ├── build
│   │   ├── bin/
│   │   │   └── backend.jar   # Compiled executable
│   │   ├── cache/
│   │   └── resources/
│   └── modules/              # Modular code organization
│       ├── types/            # Type definitions module
│       │   ├── Module.md     # Module documentation
│       │   └── types.bal     # User, Role, Category types
│       ├── storage/          # Data storage module
│       │   └── storage.bal   # In-memory storage operations
│       ├── utils/            # Utility functions module
│       │   └── validation.bal # Input validation functions
│       ├── auth/             # Authentication module
│       │   └── auth.bal      # Password hashing, token management
│       ├── services/         # Business logic module
│       │   └── userService.bal # User operations (register, login, etc.)
│       └── handlers/         # HTTP handlers module
│           └── apiHandlers.bal # Request/response handling
└── frontend/                  # Next.js React application
    ├── package.json          # Node.js dependencies
    ├── next.config.ts        # Next.js configuration
    ├── tsconfig.json         # TypeScript configuration
    ├── app/                  # App router pages
    │   ├── layout.tsx        # Root layout
    │   ├── page.tsx          # Home page
    │   └── auth/             # Authentication pages
    │       ├── signin/
    │       │   └── page.tsx  # Sign in page
    │       └── signup/
    │           └── page.tsx  # Sign up page
    ├── components/           # Reusable UI components
    ├── contexts/             # React contexts
    ├── lib/                  # Utility libraries
    └── public/               # Static assets
        ├── file.svg
        ├── globe.svg
        ├── next.svg
        ├── vercel.svg
        └── window.svg
```

## Module Dependencies

```
main.bal
├── types (User, Role, Category definitions)
└── handlers (HTTP request handlers)
    └── services (Business logic)
        ├── auth (Authentication utilities)
        │   └── storage (Data storage)
        ├── utils (Validation)
        └── storage (Data operations)
```

## Key Features by Module

### `types` Module
- User data structure definitions
- Role enumeration (DONOR, RECEIVER)
- Category enumeration (ORGANIC, MEDICINES, BLOOD)
- Request/Response type definitions

### `storage` Module
- In-memory user and token storage
- CRUD operations for users and tokens
- User-to-UserResponse conversion utilities

### `utils` Module
- Email validation with regex
- Registration input validation
- Login input validation
- Helper utility functions

### `auth` Module
- SHA-256 password hashing
- Unique token generation with UUID
- Token validation and authorization
- Logout functionality

### `services` Module
- User registration business logic
- User authentication and login
- Profile management (get/update)
- Business rule enforcement

### `handlers` Module
- HTTP request/response handling
- Status code management
- JSON payload formatting
- Error response formatting

## API Architecture

The system follows a layered architecture:

```
HTTP Request → Handlers → Services → Auth/Utils → Storage
             ↓
HTTP Response ← JSON Formatting ← Business Logic ← Data Operations
```

## Security Implementation

1. **Password Security**: SHA-256 hashing before storage
2. **Token Security**: UUID-based tokens with timestamps
3. **Authorization**: Bearer token validation for protected endpoints
4. **Input Validation**: Comprehensive validation at multiple layers
5. **Error Handling**: Secure error responses without sensitive data exposure

## Build and Deployment

- **Build Command**: `bal build` (creates `target/bin/backend.jar`)
- **Run Command**: `bal run` (starts server on port 9090)
- **Health Check**: GET `http://localhost:9090/api/v1/health`

## Development Guidelines

1. **Modularity**: Each module has a single responsibility
2. **Type Safety**: Strong typing with Ballerina's type system
3. **Error Handling**: Consistent error handling across all modules
4. **Documentation**: Each module includes comprehensive documentation
5. **Testing**: Structure supports unit testing of individual modules

This modular structure provides:
- **Maintainability**: Easy to modify individual components
- **Scalability**: Can add new modules without affecting existing ones
- **Testability**: Each module can be tested independently
- **Readability**: Clear separation of concerns
- **Reusability**: Modules can be reused across different services
