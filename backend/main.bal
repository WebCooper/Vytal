// Vytal Backend - Main Application Entry Point
import ballerina/http;
import ballerina/io;
import ballerina/cors;
import ballerina/time;
import vytal_backend.services.user_service;
import vytal_backend.utils.database;
import vytal_backend.utils.auth;
import vytal_backend.models;

// CORS configuration
cors:Config corsConfig = {
    allowOrigins: ["http://localhost:3000", "http://localhost:3001"],
    allowCredentials: false,
    allowHeaders: ["CORS-Request-Method", "CORS-Request-Headers", "Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

// HTTP service configuration
listener http:Listener httpListener = new(8080, config = {
    cors: corsConfig
});

// Main HTTP service
service /api on httpListener {
    
    // Health check endpoint
    resource function get health() returns json {
        return {
            "status": "healthy",
            "timestamp": time:utcNow(),
            "service": "Vytal Backend",
            "database": "connected",
            "version": "1.0.0"
        };
    }
    
    // Get all users
    resource function get users() returns models:User[]|http:InternalServerError {
        models:User[]|error users = user_service:getAllUsers();
        if users is error {
            io:println("Error fetching users: ", users.message());
            return http:INTERNAL_SERVER_ERROR;
        }
        return users;
    }
    
    // Get user by ID
    resource function get users/[int id]() returns models:User|http:NotFound|http:InternalServerError {
        models:User|error? user = user_service:getUserById(id);
        if user is error {
            io:println("Error fetching user: ", user.message());
            return http:INTERNAL_SERVER_ERROR;
        }
        if user is () {
            return http:NOT_FOUND;
        }
        return user;
    }
    
    // Create new user (registration)
    resource function post users(@http:Payload models:UserCreateRequest userReq) returns models:User|http:BadRequest|http:InternalServerError {
        // Validate required fields
        if userReq.name.trim() == "" || userReq.email.trim() == "" || userReq.password.trim() == "" {
            return http:BAD_REQUEST;
        }
        
        models:User|error newUser = user_service:createUser(userReq);
        if newUser is error {
            io:println("Error creating user: ", newUser.message());
            if newUser.message().includes("Email already exists") {
                return http:BAD_REQUEST;
            }
            return http:INTERNAL_SERVER_ERROR;
        }
        
        return newUser;
    }
    
    // User login/authentication
    resource function post auth/login(@http:Payload models:UserLoginRequest loginReq) returns models:AuthResponse|http:BadRequest|http:InternalServerError {
        if loginReq.email.trim() == "" || loginReq.password.trim() == "" {
            return {
                success: false,
                message: "Email and password are required",
                token: (),
                user: ()
            };
        }
        
        models:User|error? user = user_service:authenticateUser(loginReq.email, loginReq.password);
        
        if user is error {
            io:println("Authentication error: ", user.message());
            return http:INTERNAL_SERVER_ERROR;
        }
        
        if user is () {
            return {
                success: false,
                message: "Invalid credentials",
                token: (),
                user: ()
            };
        }
        
        // Generate JWT token
        string|error token = auth:generateJWT(user);
        if token is error {
            io:println("JWT generation error: ", token.message());
            return http:INTERNAL_SERVER_ERROR;
        }
        
        return {
            success: true,
            message: "Login successful",
            token: token,
            user: user
        };
    }
    
    // Protected endpoint example (requires JWT)
    resource function get profile(@http:Header string? Authorization) returns models:User|http:Unauthorized|http:InternalServerError {
        if Authorization is () || !Authorization.startsWith("Bearer ") {
            return http:UNAUTHORIZED;
        }
        
        string token = Authorization.substring(7); // Remove "Bearer " prefix
        
        var payload = auth:validateJWT(token);
        if payload is error {
            io:println("JWT validation error: ", payload.message());
            return http:UNAUTHORIZED;
        }
        
        // Extract user ID from JWT
        any userId = payload["userId"];
        if userId is int {
            models:User|error? user = user_service:getUserById(userId);
            if user is models:User {
                return user;
            }
        }
        
        return http:UNAUTHORIZED;
    }
    
    // Database health check
    resource function get db/health() returns json|http:InternalServerError {
        // Test database connection
        models:User[]|error users = user_service:getAllUsers();
        if users is error {
            return http:INTERNAL_SERVER_ERROR;
        }
        
        return {
            "database": "healthy",
            "timestamp": time:utcNow(),
            "user_count": users.length()
        };
    }
}

// Application startup
public function main() returns error? {
    io:println("=== Vytal Backend Starting ===");
    
    // Initialize database
    error? dbInit = database:initDatabase();
    if dbInit is error {
        io:println("Database initialization failed: ", dbInit.message());
        return dbInit;
    }
    
    io:println("✅ Database connected and initialized");
    io:println("✅ Vytal Backend Service started on port 8080");
    io:println("📍 API Base URL: http://localhost:8080/api");
    io:println("🏥 Health Check: http://localhost:8080/api/health");
    io:println("💾 DB Health: http://localhost:8080/api/db/health");
    io:println("👤 Users API: http://localhost:8080/api/users");
    io:println("🔐 Login API: http://localhost:8080/api/auth/login");
    io:println("👤 Profile API: http://localhost:8080/api/profile");
    io:println("");
    io:println("Ready for connections! 🚀");
}
    string? token;
    User? user;
|};

// Database connection
mysql:Client dbClient = check new (
    host = DB_HOST,
    port = DB_PORT,
    database = DB_NAME,
    user = DB_USER,
    password = DB_PASSWORD
);

// CORS configuration
cors:Config corsConfig = {
    allowOrigins: ["http://localhost:3000", "http://localhost:3001"],
    allowCredentials: false,
    allowHeaders: ["CORS-Request-Method", "CORS-Request-Headers", "Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

// HTTP service configuration
listener http:Listener httpListener = new(8080, config = {
    cors: corsConfig
});

// Database initialization
function initDatabase() returns error? {
    // Create users table if it doesn't exist
    sql:ExecutionResult result = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(20),
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            category VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
    
    io:println("Database initialized successfully");
    
    // Insert sample users if table is empty
    sql:ParameterizedQuery countQuery = `SELECT COUNT(*) as count FROM users`;
    stream<record {int count;}, error?> countResult = dbClient->query(countQuery);
    record {int count;}? countRecord = check countResult.next();
    check countResult.close();
    
    if countRecord?.count == 0 {
        check insertSampleUsers();
    }
}

// Insert sample users
function insertSampleUsers() returns error? {
    string johnPassword = check crypto:hashSha256("password123".toBytes()).toBase16();
    string janePassword = check crypto:hashSha256("password456".toBytes()).toBase16();
    
    sql:ParameterizedQuery insertJohn = `
        INSERT INTO users (name, email, phone, password_hash, role) 
        VALUES ("John Doe", "john@example.com", "+1234567890", ${johnPassword}, "admin")
    `;
    
    sql:ParameterizedQuery insertJane = `
        INSERT INTO users (name, email, phone, password_hash, role) 
        VALUES ("Jane Smith", "jane@example.com", "+0987654321", ${janePassword}, "user")
    `;
    
    _ = check dbClient->execute(insertJohn);
    _ = check dbClient->execute(insertJane);
    
    io:println("Sample users inserted");
}

// Utility functions
function hashPassword(string password) returns string|error {
    byte[] hashedBytes = check crypto:hashSha256(password.toBytes());
    return hashedBytes.toBase16();
}

function verifyPassword(string password, string hash) returns boolean|error {
    string hashedPassword = check hashPassword(password);
    return hashedPassword == hash;
}

function generateJWT(User user) returns string|error {
    jwt:IssuerConfig issuerConfig = {
        username: user.email,
        issuer: "vytal-backend",
        audience: "vytal-frontend",
        expTime: 3600, // 1 hour
        customClaims: {
            "userId": user.id,
            "role": user.role
        }
    };
    
    return jwt:issue({
        issuer: issuerConfig.issuer,
        audience: issuerConfig.audience,
        expTime: time:utcNow()[0] + issuerConfig.expTime,
        customClaims: issuerConfig.customClaims
    }, {
        algorithm: jwt:HS256,
        config: {
            secret: JWT_SECRET
        }
    });
}

// Database operations
function getUserById(int id) returns User|error? {
    sql:ParameterizedQuery query = `
        SELECT id, name, phone, email, role, category, created_at, updated_at 
        FROM users WHERE id = ${id}
    `;
    
    stream<User, error?> resultStream = dbClient->query(query);
    User? user = check resultStream.next();
    check resultStream.close();
    
    return user;
}

function getAllUsers() returns User[]|error {
    sql:ParameterizedQuery query = `
        SELECT id, name, phone, email, role, category, created_at, updated_at 
        FROM users ORDER BY created_at DESC
    `;
    
    stream<User, error?> resultStream = dbClient->query(query);
    User[] users = [];
    
    error? e = resultStream.forEach(function(User user) {
        users.push(user);
    });
    
    if e is error {
        return e;
    }
    
    return users;
}

function createUser(UserCreateRequest userReq) returns User|error {
    // Validate required fields
    if userReq.name.trim() == "" || userReq.phone.trim() == "" || userReq.email.trim() == "" || userReq.password.trim() == "" {
        return error("All fields are required");
    }
    
    // Validate role
    if userReq.role != "donor" && userReq.role != "receiver" {
        return error("Role must be either 'donor' or 'receiver'");
    }
    
    // Validate category
    if userReq.category != "Organs" && userReq.category != "Medicines" && userReq.category != "Blood" {
        return error("Category must be 'Organs', 'Medicines', or 'Blood'");
    }
    
    // Check if email already exists
    sql:ParameterizedQuery checkQuery = `SELECT COUNT(*) as count FROM users WHERE email = ${userReq.email}`;
    stream<record {int count;}, error?> checkResult = dbClient->query(checkQuery);
    record {int count;}? existingUser = check checkResult.next();
    check checkResult.close();
    
    if existingUser?.count > 0 {
        return error("Email already exists");
    }
    
    // Hash password
    string hashedPassword = check hashPassword(userReq.password);
    
    // Insert new user
    sql:ParameterizedQuery insertQuery = `
        INSERT INTO users (name, phone, email, password_hash, role, category)
        VALUES (${userReq.name}, ${userReq.phone}, ${userReq.email}, ${hashedPassword}, 
                ${userReq.role}, ${userReq.category})
    `;
    
    sql:ExecutionResult result = check dbClient->execute(insertQuery);
    
    if result.lastInsertId is int {
        int userId = <int>result.lastInsertId;
        User? createdUser = check getUserById(userId);
        if createdUser is User {
            return createdUser;
        }
    }
    
    return error("Failed to create user");
}

function authenticateUser(string email, string password) returns User|error? {
    sql:ParameterizedQuery query = `
        SELECT id, name, email, phone, password_hash, role, category, created_at, updated_at 
        FROM users WHERE email = ${email}
    `;
    
    stream<record {
        int id;
        string name;
        string email;
        string phone;
        string password_hash;
        string role;
        string category;
        string created_at;
        string updated_at;
    }, error?> resultStream = dbClient->query(query);
    
    var userRecord = check resultStream.next();
    check resultStream.close();
    
    if userRecord is record {
        int id;
        string name;
        string email;
        string phone;
        string password_hash;
        string role;
        string category;
        string created_at;
        string updated_at;
    } {
        boolean isValid = check verifyPassword(password, userRecord.password_hash);
        if isValid {
            return {
                id: userRecord.id,
                name: userRecord.name,
                email: userRecord.email,
                phone: userRecord.phone,
                role: userRecord.role,
                category: userRecord.category,
                created_at: userRecord.created_at,
                updated_at: userRecord.updated_at
            };
        }
    }
    
    return ();
}

// Main HTTP service
service /api on httpListener {
    
    // Health check endpoint
    resource function get health() returns json {
        return {
            "status": "healthy",
            "timestamp": time:utcNow(),
            "service": "Vytal Backend",
            "database": "connected",
            "version": "1.0.0"
        };
    }
    
    // Get all users
    resource function get users() returns User[]|http:InternalServerError {
        User[]|error users = getAllUsers();
        if users is error {
            io:println("Error fetching users: ", users.message());
            return http:INTERNAL_SERVER_ERROR;
        }
        return users;
    }
    
    // Get user by ID
    resource function get users/[int id]() returns User|http:NotFound|http:InternalServerError {
        User|error? user = getUserById(id);
        if user is error {
            io:println("Error fetching user: ", user.message());
            return http:INTERNAL_SERVER_ERROR;
        }
        if user is () {
            return http:NOT_FOUND;
        }
        return user;
    }
    
    // Create new user (registration)
    resource function post users(@http:Payload UserCreateRequest userReq) returns User|http:BadRequest|http:InternalServerError {
        // Validate required fields
        if userReq.name.trim() == "" || userReq.email.trim() == "" || userReq.password.trim() == "" {
            return http:BAD_REQUEST;
        }
        
        User|error newUser = createUser(userReq);
        if newUser is error {
            io:println("Error creating user: ", newUser.message());
            if newUser.message().includes("Email already exists") {
                return http:BAD_REQUEST;
            }
            return http:INTERNAL_SERVER_ERROR;
        }
        
        return newUser;
    }
    
    // User login/authentication
    resource function post auth/login(@http:Payload UserLoginRequest loginReq) returns AuthResponse|http:BadRequest|http:InternalServerError {
        if loginReq.email.trim() == "" || loginReq.password.trim() == "" {
            return {
                success: false,
                message: "Email and password are required"
            };
        }
        
        User|error? user = authenticateUser(loginReq.email, loginReq.password);
        
        if user is error {
            io:println("Authentication error: ", user.message());
            return http:INTERNAL_SERVER_ERROR;
        }
        
        if user is () {
            return {
                success: false,
                message: "Invalid credentials"
            };
        }
        
        // Generate JWT token
        string|error token = generateJWT(user);
        if token is error {
            io:println("JWT generation error: ", token.message());
            return http:INTERNAL_SERVER_ERROR;
        }
        
        return {
            success: true,
            message: "Login successful",
            token: token,
            user: user
        };
    }
    
    // Protected endpoint example (requires JWT)
    resource function get profile(@http:Header string? Authorization) returns User|http:Unauthorized|http:InternalServerError {
        if Authorization is () || !Authorization.startsWith("Bearer ") {
            return http:UNAUTHORIZED;
        }
        
        string token = Authorization.substring(7); // Remove "Bearer " prefix
        
        jwt:Payload|error payload = jwt:validate(token, {
            issuer: "vytal-backend",
            audience: "vytal-frontend",
            clockSkew: 60,
            signatureConfig: {
                secret: JWT_SECRET
            }
        });
        
        if payload is error {
            io:println("JWT validation error: ", payload.message());
            return http:UNAUTHORIZED;
        }
        
        // Extract user ID from JWT
        any userId = payload["userId"];
        if userId is int {
            User|error? user = getUserById(userId);
            if user is User {
                return user;
            }
        }
        
        return http:UNAUTHORIZED;
    }
    
    // Database health check
    resource function get db/health() returns json|http:InternalServerError {
        sql:ParameterizedQuery query = `SELECT 1 as status`;
        stream<record {int status;}, error?> result = dbClient->query(query);
        
        error? e = result.close();
        if e is error {
            return http:INTERNAL_SERVER_ERROR;
        }
        
        return {
            "database": "healthy",
            "timestamp": time:utcNow()
        };
    }
}

// Application startup
public function main() returns error? {
    io:println("=== Vytal Backend Starting ===");
    
    // Initialize database
    error? dbInit = initDatabase();
    if dbInit is error {
        io:println("Database initialization failed: ", dbInit.message());
        return dbInit;
    }
    
    io:println("✅ Database connected and initialized");
    io:println("✅ Vytal Backend Service started on port 8080");
    io:println("📍 API Base URL: http://localhost:8080/api");
    io:println("🏥 Health Check: http://localhost:8080/api/health");
    io:println("💾 DB Health: http://localhost:8080/api/db/health");
    io:println("👤 Users API: http://localhost:8080/api/users");
    io:println("🔐 Login API: http://localhost:8080/api/auth/login");
}
