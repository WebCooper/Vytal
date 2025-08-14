// Authentication and security utilities
import ballerina/crypto;
import ballerina/jwt;
import ballerina/time;
import vytal_backend.models;

// JWT configuration
configurable string JWT_SECRET = "vytal-secret-key-development-2025";

// Password hashing utilities
public function hashPassword(string password) returns string|error {
    // Using SHA2-256 to match database implementation
    byte[] hashedBytes = check crypto:hashSha256(password.toBytes());
    return hashedBytes.toBase16();
}

public function verifyPassword(string password, string hash) returns boolean|error {
    string hashedPassword = check hashPassword(password);
    return hashedPassword == hash;
}

// JWT token utilities
public function generateJWT(models:User user) returns string|error {
    jwt:IssuerConfig issuerConfig = {
        username: user.email,
        issuer: "vytal-backend",
        audience: "vytal-frontend",
        expTime: 3600, // 1 hour
        customClaims: {
            "userId": user.id,
            "role": user.role,
            "category": user.category
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

public function validateJWT(string token) returns jwt:Payload|error {
    return jwt:validate({
        issuer: "vytal-backend",
        audience: "vytal-frontend",
        signature: {
            algorithm: jwt:HS256,
            config: {
                secret: JWT_SECRET
            }
        }
    }, token);
}
