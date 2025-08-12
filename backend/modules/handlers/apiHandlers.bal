import ballerina/http;
import ballerina/time;
import backend.types;
import backend.services as userService;
import backend.token;

// Handler functions for API endpoints

public isolated function handleRegister(types:RegisterRequest request) returns http:Response {
    http:Response response = new;
    
    types:UserResponse|error result = userService:registerUser(request);
    
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

public isolated function handleLogin(types:LoginRequest request) returns http:Response {
    http:Response response = new;
    
    types:LoginResponse|error result = userService:loginUser(request);
    
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

public isolated function handleGetProfile(string? authorization) returns http:Response {
    http:Response response = new;
    
    string|error email = token:validateToken(authorization);
    
    if email is error {
        response.statusCode = 401;
        response.setJsonPayload({
            "error": email.message(),
            "timestamp": time:utcNow()
        });
        return response;
    }
    
    types:UserResponse|error result = userService:getUserProfile(email);
    
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

public isolated function handleUpdateProfile(string? authorization, types:User updatedUser) returns http:Response {
    http:Response response = new;
    
    string|error email = token:validateToken(authorization);
    
    if email is error {
        response.statusCode = 401;
        response.setJsonPayload({
            "error": email.message(),
            "timestamp": time:utcNow()
        });
        return response;
    }
    
    types:UserResponse|error result = userService:updateUserProfile(email, updatedUser);
    
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

public isolated function handleLogout(string? authorization) returns http:Response {
    http:Response response = new;
    
    if authorization is () || !authorization.startsWith("Bearer ") {
        response.statusCode = 401;
        response.setJsonPayload({
            "error": "Invalid authorization format",
            "timestamp": time:utcNow()
        });
        return response;
    }
    
    string tokenValue = authorization.substring(7);
    error? result = userService:logoutUser(tokenValue);
    
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