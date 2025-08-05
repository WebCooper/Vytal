// Main service file for Vytal Authentication API
import ballerina/http;
import ballerina/time;
import ballerina/crypto;
import ballerina/uuid;
import ballerina/regex;

// Type definitions
public enum Role {
    DONOR = "donor",
    RECEIVER = "receiver"
}

public enum Category {
    ORGANIC = "Organic",
    MEDICINES = "Medicines", 
    BLOOD = "Blood"
}

public type User record {
    string name;
    string phone_number;
    string email;
    string password;
    Role role;
    Category[] categories;
};

public type UserResponse record {
    string name;
    string phone_number;
    string email;
    Role role;
    Category[] categories;
};

public type RegisterRequest record {
    string name;
    string phone_number;
    string email;
    string password;
    Role role;
    Category[] categories;
};

public type LoginRequest record {
    string email;
    string password;
};

public type LoginResponse record {
    string token;
    UserResponse user;
};

// In-memory storage
map<User> userStore = {};
map<string> tokenStore = {};

// Utility functions
function hashPassword(string password) returns string {
    byte[] hashedBytes = crypto:hashSha256(password.toBytes());
    return hashedBytes.toBase16();
}

function generateToken(string email) returns string {
    string timestamp = time:utcNow().toString();
    string tokenData = email + ":" + timestamp + ":" + uuid:createType1AsString();
    return tokenData.toBytes().toBase16();
}

function validateToken(string? authHeader) returns string|error {
    if authHeader is () {
        return error("Authorization header is missing");
    }
    
    if !authHeader.startsWith("Bearer ") {
        return error("Invalid authorization format");
    }
    
    string token = authHeader.substring(7);
    string? email = tokenStore[token];
    
    if email is () {
        return error("Invalid or expired token");
    }
    
    return email;
}

function userToUserResponse(User user) returns UserResponse {
    return {
        name: user.name,
        phone_number: user.phone_number,
        email: user.email,
        role: user.role,
        categories: user.categories
    };
}

// Validation functions
function isValidEmail(string email) returns boolean {
    string emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
    return regex:matches(email, emailPattern);
}

function validateRegistrationInput(RegisterRequest request) returns error? {
    if request.name.trim() == "" {
        return error("Name is required");
    }
    
    if request.phone_number.trim() == "" {
        return error("Phone number is required");
    }
    
    if !isValidEmail(request.email) {
        return error("Invalid email format");
    }
    
    if request.password.length() < 6 {
        return error("Password must be at least 6 characters long");
    }
    
    if request.categories.length() == 0 {
        return error("At least one category must be selected");
    }
}

function validateLoginInput(LoginRequest request) returns error? {
    if !isValidEmail(request.email) {
        return error("Invalid email format");
    }
    
    if request.password.trim() == "" {
        return error("Password is required");
    }
}

// Service functions
function registerUser(RegisterRequest request) returns UserResponse|error {
    // Validate input
    error? validationResult = validateRegistrationInput(request);
    if validationResult is error {
        return validationResult;
    }
    
    // Check if user already exists
    if userStore.hasKey(request.email) {
        return error("User with this email already exists");
    }
    
    // Hash password
    string hashedPassword = hashPassword(request.password);
    
    // Create user
    User newUser = {
        name: request.name,
        phone_number: request.phone_number,
        email: request.email,
        password: hashedPassword,
        role: request.role,
        categories: request.categories
    };
    
    // Store user
    userStore[request.email] = newUser;
    
    return userToUserResponse(newUser);
}

function loginUser(LoginRequest request) returns LoginResponse|error {
    // Validate input
    error? validationResult = validateLoginInput(request);
    if validationResult is error {
        return validationResult;
    }
    
    // Check if user exists
    User? user = userStore[request.email];
    if user is () {
        return error("Invalid email or password");
    }
    
    // Verify password
    string hashedPassword = hashPassword(request.password);
    if user.password != hashedPassword {
        return error("Invalid email or password");
    }
    
    // Generate token
    string token = generateToken(request.email);
    tokenStore[token] = request.email;
    
    return {
        token: token,
        user: userToUserResponse(user)
    };
}

function getUserProfile(string email) returns UserResponse|error {
    User? user = userStore[email];
    if user is () {
        return error("User not found");
    }
    
    return userToUserResponse(user);
}

function updateUserProfile(string email, User updatedUser) returns UserResponse|error {
    User? existingUser = userStore[email];
    if existingUser is () {
        return error("User not found");
    }
    
    // Update user (keep the same email and password hash)
    User user = {
        name: updatedUser.name,
        phone_number: updatedUser.phone_number,
        email: email, // Keep original email
        password: existingUser.password, // Keep existing password hash
        role: updatedUser.role,
        categories: updatedUser.categories
    };
    
    userStore[email] = user;
    
    return userToUserResponse(user);
}

function logoutUser(string token) returns error? {
    if !tokenStore.hasKey(token) {
        return error("Invalid token");
    }
    
    _ = tokenStore.remove(token);
}

// Handler functions
function handleRegister(RegisterRequest request) returns http:Response {
    http:Response response = new;
    
    UserResponse|error result = registerUser(request);
    
    if result is error {
        response.statusCode = 400;
        response.setJsonPayload({
            "error": result.message(),
            "timestamp": time:utcNow()
        });
    } else {
        response.statusCode = 201;
        response.setJsonPayload({
            "message": "User registered successfully",
            "user": result.toJson(),
            "timestamp": time:utcNow()
        });
    }
    
    return response;
}

function handleLogin(LoginRequest request) returns http:Response {
    http:Response response = new;
    
    LoginResponse|error result = loginUser(request);
    
    if result is error {
        response.statusCode = 401;
        response.setJsonPayload({
            "error": result.message(),
            "timestamp": time:utcNow()
        });
    } else {
        response.statusCode = 200;
        response.setJsonPayload({
            "message": "Login successful",
            "data": result.toJson(),
            "timestamp": time:utcNow()
        });
    }
    
    return response;
}

function handleGetProfile(string? authorization) returns http:Response {
    http:Response response = new;
    
    string|error email = validateToken(authorization);
    
    if email is error {
        response.statusCode = 401;
        response.setJsonPayload({
            "error": email.message(),
            "timestamp": time:utcNow()
        });
        return response;
    }
    
    UserResponse|error result = getUserProfile(email);
    
    if result is error {
        response.statusCode = 404;
        response.setJsonPayload({
            "error": result.message(),
            "timestamp": time:utcNow()
        });
    } else {
        response.statusCode = 200;
        response.setJsonPayload({
            "data": result.toJson(),
            "timestamp": time:utcNow()
        });
    }
    
    return response;
}

function handleUpdateProfile(string? authorization, User updatedUser) returns http:Response {
    http:Response response = new;
    
    string|error email = validateToken(authorization);
    
    if email is error {
        response.statusCode = 401;
        response.setJsonPayload({
            "error": email.message(),
            "timestamp": time:utcNow()
        });
        return response;
    }
    
    UserResponse|error result = updateUserProfile(email, updatedUser);
    
    if result is error {
        response.statusCode = 400;
        response.setJsonPayload({
            "error": result.message(),
            "timestamp": time:utcNow()
        });
    } else {
        response.statusCode = 200;
        response.setJsonPayload({
            "message": "Profile updated successfully",
            "data": result.toJson(),
            "timestamp": time:utcNow()
        });
    }
    
    return response;
}

function handleLogout(string? authorization) returns http:Response {
    http:Response response = new;
    
    if authorization is () || !authorization.startsWith("Bearer ") {
        response.statusCode = 401;
        response.setJsonPayload({
            "error": "Invalid authorization format",
            "timestamp": time:utcNow()
        });
        return response;
    }
    
    string token = authorization.substring(7);
    error? result = logoutUser(token);
    
    if result is error {
        response.statusCode = 401;
        response.setJsonPayload({
            "error": result.message(),
            "timestamp": time:utcNow()
        });
    } else {
        response.statusCode = 200;
        response.setJsonPayload({
            "message": "Logout successful",
            "timestamp": time:utcNow()
        });
    }
    
    return response;
}

// HTTP service with all authentication endpoints
service /api/v1 on new http:Listener(9090) {

    // Health check endpoint
    resource function get health() returns json {
        return {
            "status": "healthy",
            "timestamp": time:utcNow(),
            "service": "Authentication API"
        };
    }

    // Registration endpoint
    resource function post register(RegisterRequest request) returns http:Response|error {
        return handleRegister(request);
    }

    // Login endpoint
    resource function post login(LoginRequest request) returns http:Response|error {
        return handleLogin(request);
    }

    // Get profile endpoint
    resource function get profile(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        return handleGetProfile(authorization);
    }

    // Update profile endpoint
    resource function put profile(@http:Header {name: "Authorization"} string? authorization, User updatedUser) returns http:Response|error {
        return handleUpdateProfile(authorization, updatedUser);
    }

    // Logout endpoint
    resource function post logout(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        return handleLogout(authorization);
    }
}
