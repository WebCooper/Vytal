// Authentication utilities
import ballerina/crypto;
import ballerina/time;
import ballerina/uuid;

// Hash password using SHA-256
public function hashPassword(string password) returns string {
    byte[] hashedBytes = crypto:hashSha256(password.toBytes());
    return hashedBytes.toBase16();
}

// Generate a unique token for user session
public function generateToken(string email) returns string {
    string timestamp = time:utcNow().toString();
    string tokenData = email + ":" + timestamp + ":" + uuid:createType1AsString();
    return tokenData.toBytes().toBase16();
}

// Validate authorization token and return email
public function validateToken(string? authHeader, map<string> tokenStore) returns string|error {
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

// Logout user by removing token
public function logoutUser(string token, map<string> tokenStore) returns error? {
    if !tokenStore.hasKey(token) {
        return error("Invalid token");
    }
    
    _ = tokenStore.remove(token);
}
