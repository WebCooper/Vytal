# Vytal Backend

A modular Ballerina backend service for the Vytal application, providing user authentication and management functionality.

## Features

- User registration and authentication
- Token-based authorization
- Profile management
- Modular architecture
- CORS support for frontend integration

## Modules

- `types` - Data type definitions
- `auth` - Authentication and token management
- `storage` - Data storage abstraction
- `services` - Business logic services
- `utils` - Utility functions and validation

## API Endpoints

- `GET /api/v1/health` - Health check
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `PUT /api/v1/auth/profile` - Update user profile (protected)
- `POST /api/v1/auth/logout` - User logout (protected)
