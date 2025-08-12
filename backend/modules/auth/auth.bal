import ballerina/crypto;
import backend.types;

public isolated function hashPassword(string password) returns string {
    byte[] hashedBytes = crypto:hashSha256(password.toBytes());
    return hashedBytes.toBase16();
}

public isolated function userToUserResponse(types:User user) returns types:UserResponse {
    return {
        name: user.name,
        phone_number: user.phone_number,
        email: user.email,
        role: user.role,
        categories: user.categories
    };
}