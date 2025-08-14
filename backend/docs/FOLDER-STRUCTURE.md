# Vytal Backend - Organized Folder Structure

## 📁 Backend Directory Structure

```
backend/
├── .devcontainer.json          # VS Code dev container config
├── .gitignore                  # Git ignore rules
├── Ballerina.toml             # Main Ballerina project config
├── Dependencies.toml          # Ballerina dependencies
├── main.bal                   # Main application entry point
├── README.md                  # Project documentation
│
├── config/                    # Configuration files
│   ├── Config.example.toml    # Example configuration
│   └── Config.toml           # Actual configuration (DB credentials, etc.)
│
├── src/                      # Source code modules
│   ├── main.bal              # Legacy main file (can be removed)
│   ├── models/               # Data models and types
│   │   └── user.bal         # User-related data types
│   ├── services/             # Business logic services
│   │   └── user_service.bal # User operations (CRUD, auth)
│   └── utils/                # Utility functions
│       ├── auth.bal         # Authentication utilities (JWT, passwords)
│       └── database.bal     # Database connection and setup
│
├── database/                 # SQL scripts
│   ├── setup.sql            # Database schema setup
│   └── reset.sql            # Database reset script
│
├── scripts/                  # PowerShell automation scripts
│   ├── database/             # Database management scripts
│   │   ├── install-mysql-guide.ps1
│   │   ├── reset-database.ps1
│   │   ├── setup-database.ps1
│   │   └── simple-reset.ps1
│   └── testing/              # Testing scripts
│       ├── simple-login-test.ps1
│       ├── test-api.ps1
│       ├── test-complete-system.ps1
│       ├── test-database.ps1
│       └── test-mysql-connection.ps1
│
└── docs/                     # Documentation
    ├── TEST-ACCOUNTS.md      # Test user accounts info
    └── TESTING.md           # Testing guidelines
```

## 🏗️ Architecture Overview

### **Main Application (`main.bal`)**
- Clean entry point that imports from modules
- HTTP service configuration with CORS
- API endpoints that delegate to service layers
- Minimal business logic (just orchestration)

### **Models (`src/models/`)**
- **`user.bal`**: User data types, request/response models
- Centralized type definitions
- Enums for roles and categories

### **Services (`src/services/`)**
- **`user_service.bal`**: User business logic
  - CRUD operations
  - Authentication logic
  - Data validation

### **Utils (`src/utils/`)**
- **`database.bal`**: Database connection and initialization
- **`auth.bal`**: JWT token management, password hashing

### **Configuration (`config/`)**
- **`Config.toml`**: Database credentials, JWT secrets
- Environment-specific configurations

### **Database (`database/`)**
- **`setup.sql`**: Complete database schema
- **`reset.sql`**: Reset and sample data script

### **Scripts (`scripts/`)**
- **`database/`**: Database setup and management
- **`testing/`**: Automated testing scripts

### **Documentation (`docs/`)**
- **`TEST-ACCOUNTS.md`**: Available test user accounts
- **`TESTING.md`**: Testing procedures and guidelines

## 🚀 How to Use

1. **Start the backend**: `bal run` (from backend directory)
2. **Reset database**: `.\scripts\database\simple-reset.ps1`
3. **Test API**: `.\scripts\testing\simple-login-test.ps1`
4. **View docs**: Check `docs/` folder for guides

## ✅ Benefits of This Structure

- **Modular**: Clear separation of concerns
- **Maintainable**: Easy to find and modify code
- **Testable**: Isolated components
- **Scalable**: Easy to add new modules
- **Professional**: Industry-standard organization

The backend is now properly organized and ready for development! 🎉
