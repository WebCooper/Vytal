import backend.types;
import backend.storage;
import backend.auth;
import backend.token;
import backend.utils as validation;

// User service functions

public isolated function registerUser(types:RegisterRequest request) returns types:UserResponse|error {
    // Validate input
    error? validationResult = validation:validateRegistrationInput(request);
    if validationResult is error {
        return validationResult;
    }
    
    // Check if user already exists
    if storage:userExists(request.email) {
        return error("User with this email already exists");
    }
    
    // Hash password
    string hashedPassword = auth:hashPassword(request.password);
    
    // Create user
    types:User newUser = {
        name: request.name,
        phone_number: request.phone_number,
        email: request.email,
        password: hashedPassword,
        role: request.role,
        categories: request.categories
    };
    
    // Store user
    storage:addUser(request.email, newUser);
    
    return auth:userToUserResponse(newUser);
}

public isolated function loginUser(types:LoginRequest request) returns types:LoginResponse|error {
    // Validate input
    error? validationResult = validation:validateLoginInput(request);
    if validationResult is error {
        return validationResult;
    }
    
    // Check if user exists
    types:User? user = storage:getUser(request.email);
    if user is () {
        return error("Invalid email or password");
    }
    
    // Verify password
    string hashedPassword = auth:hashPassword(request.password);
    if user.password != hashedPassword {
        return error("Invalid email or password");
    }
    
    // Generate token
    string tokenValue = token:generateToken(request.email);
    storage:addToken(tokenValue, request.email);
    
    return {
        token: tokenValue,
        user: auth:userToUserResponse(user)
    };
}

public isolated function getUserProfile(string email) returns types:UserResponse|error {
    types:User? user = storage:getUser(email);
    if user is () {
        return error("User not found");
    }
    
    return auth:userToUserResponse(user);
}

public isolated function updateUserProfile(string email, types:User updatedUser) returns types:UserResponse|error {
    types:User? existingUser = storage:getUser(email);
    if existingUser is () {
        return error("User not found");
    }
    
    // Update user (keep the same email and password hash)
    types:User user = {
        name: updatedUser.name,
        phone_number: updatedUser.phone_number,
        email: email, // Keep original email
        password: existingUser.password, // Keep existing password hash
        role: updatedUser.role,
        categories: updatedUser.categories
    };
    
    storage:addUser(email, user);
    
    return auth:userToUserResponse(user);
}

public isolated function logoutUser(string tokenValue) returns error? {
    if !storage:tokenExists(tokenValue) {
        return error("Invalid token");
    }
    
    _ = storage:removeToken(tokenValue);
}