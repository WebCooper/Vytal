// Main service file for Vytal Authentication API
import ballerina/http;
import ballerina/time;
import backend.types;
import backend.handlers;

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
    resource function post register(types:RegisterRequest request) returns http:Response|error {
        return handlers:handleRegister(request);
    }

    // Login endpoint
    resource function post login(types:LoginRequest request) returns http:Response|error {
        return handlers:handleLogin(request);
    }

    // Get profile endpoint
    resource function get profile(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        return handlers:handleGetProfile(authorization);
    }

    // Update profile endpoint
    resource function put profile(@http:Header {name: "Authorization"} string? authorization, types:User updatedUser) returns http:Response|error {
        return handlers:handleUpdateProfile(authorization, updatedUser);
    }

    // Logout endpoint
    resource function post logout(@http:Header {name: "Authorization"} string? authorization) returns http:Response|error {
        return handlers:handleLogout(authorization);
    }
}
