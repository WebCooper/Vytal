import ballerina/regex;
import backend.types;

public isolated function isValidEmail(string email) returns boolean {
    string emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
    return regex:matches(email, emailPattern);
}

public isolated function validateRegistrationInput(types:RegisterRequest request) returns error? {
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

public isolated function validateLoginInput(types:LoginRequest request) returns error? {
    if !isValidEmail(request.email) {
        return error("Invalid email format");
    }
    if request.password.trim() == "" {
        return error("Password is required");
    }
}