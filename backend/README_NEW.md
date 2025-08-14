# Vytal Backend Authentication API

This is a Ballerina-based authentication system for the Vytal application providing user registration, login, profile management, and secure token-based authentication.

## Project Structure

```
backend/
├── main.bal                      # Main HTTP service definition
├── Ballerina.toml               # Project configuration
├── Dependencies.toml            # Dependency management
├── config/
│   └── Config.toml             # Configuration settings
└── modules/
    ├── types/
    │   ├── Module.md           # Types module documentation
    │   └── types.bal           # Type definitions (User, Role, Category, etc.)
    ├── storage/
    │   └── storage.bal         # In-memory data storage operations
    ├── utils/
    │   └── validation.bal      # Input validation utilities
    ├── auth/
    │   └── auth.bal           # Authentication and token management
    ├── services/
    │   └── userService.bal    # Business logic for user operations
    └── handlers/
        └── apiHandlers.bal    # HTTP request handlers
```

## Features

- **User Registration**: Create new user accounts with validation
- **User Authentication**: Secure login with password hashing
- **Profile Management**: Get and update user profiles
- **Token-based Authentication**: Secure API access with Bearer tokens
- **Role-based Access**: Support for donor and receiver roles
- **Category Management**: Organic, Medicines, and Blood categories
- **Input Validation**: Comprehensive validation for all inputs

## API Endpoints

### Base URL: `http://localhost:9090/api/v1`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/health` | Health check | None |
| POST | `/register` | User registration | None |
| POST | `/login` | User login | None |
| GET | `/profile` | Get user profile | Bearer Token |
| PUT | `/profile` | Update user profile | Bearer Token |
| POST | `/logout` | User logout | Bearer Token |

## Data Models

### User
```ballerina
type User record {
    string name;
    string phone_number;
    string email;
    string password;        // Hashed using SHA-256
    Role role;             // "donor" or "receiver"
    Category[] categories; // Array of categories
};
```

### Roles
- `DONOR`: User who can donate items
- `RECEIVER`: User who can receive items

### Categories  
- `ORGANIC`: Organic food items
- `MEDICINES`: Medical supplies
- `BLOOD`: Blood donations

## Security Features

- **Password Hashing**: SHA-256 encryption for secure password storage
- **Token Generation**: Unique tokens with timestamp and UUID components
- **Authorization Headers**: Bearer token authentication
- **Input Validation**: Email format, password strength, required fields
- **Error Handling**: Comprehensive error responses with timestamps

## Development

The project follows a modular architecture with separate modules for different concerns. Each module has a specific responsibility and can be maintained independently.

## Configuration

Server runs on port `9090` by default. This can be configured in the main service definition or through environment variables.
