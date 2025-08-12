import ballerina/time;
import ballerina/uuid;
import backend.storage;

public isolated function generateToken(string email) returns string {
    string timestamp = time:utcNow().toString();
    string tokenData = email + ":" + timestamp + ":" + uuid:createType1AsString();
    return tokenData.toBytes().toBase16();
}

public isolated function validateToken(string? authHeader) returns string|error {
    if authHeader is () {
        return error("Authorization header is missing");
    }
    
    if !authHeader.startsWith("Bearer ") {
        return error("Invalid authorization format");
    }
    
    string token = authHeader.substring(7);
    string? email = storage:getEmailByToken(token);
    
    if email is () {
        return error("Invalid or expired token");
    }
    
    return email;
}