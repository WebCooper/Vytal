import backend.types;
import backend.database;
import backend.auth;
import backend.token;
import backend.utils as validation;
import backend.storage;

// User service functions

public isolated function registerUser(types:RegisterRequest request) returns types:UserResponse|error {
    // Validate input
    error? validationResult = validation:validateRegistrationInput(request);
    if validationResult is error {
        return validationResult;
    }
    
    // Check if user already exists in database
    boolean|error userExists = database:userExistsByEmail(request.email);
    if userExists is error {
        return error("Database error: " + userExists.message());
    }
    if userExists {
        return error("User with this email already exists");
    }
    
    // Hash password
    string hashedPassword = auth:hashPassword(request.password);
    
    // Create user for database insertion
    types:UserCreate newUser = {
        name: request.name,
        phone_number: request.phone_number,
        email: request.email,
        password: hashedPassword,
        role: request.role,
        categories: request.categories
    };
    
    // Insert user into database
    var result = database:insertUser(newUser);
    if result is error {
        return error("Failed to register user: " + result.message());
    }
    
    // Get the newly created user to get their ID
    types:User?|error userResult = database:getUserByEmail(newUser.email);
    if userResult is error {
        return error("Failed to retrieve user after creation: " + userResult.message());
    }
    if userResult is () {
        return error("User not found after creation");
    }
    
    types:User user = <types:User>userResult;
    
    // Return user response
    return {
        id: <int>user.id,
        name: newUser.name,
        phone_number: newUser.phone_number,
        email: newUser.email,
        role: newUser.role,
        categories: newUser.categories
    };
}

public isolated function loginUser(types:LoginRequest request) returns types:LoginResponse|error {
    // Validate input
    error? validationResult = validation:validateLoginInput(request);
    if validationResult is error {
        return validationResult;
    }
    
    // Get user from database
    types:User?|error userResult = database:getUserByEmail(request.email);
    if userResult is error {
        return error("Database error: " + userResult.message());
    }
    if userResult is () {
        return error("Invalid email or password");
    }
    
    types:User user = <types:User>userResult;
    
    // Verify password
    string hashedPassword = auth:hashPassword(request.password);
    if user.password != hashedPassword {
        return error("Invalid email or password");
    }
    
    // Convert categories from JSON string to array
    types:Category[]|error categoriesResult = database:convertJsonToCategories(user.categories);
    if categoriesResult is error {
        return error("Error processing user data");
    }
    
    // Generate token
    string tokenValue = token:generateToken(request.email);
    storage:addToken(tokenValue, request.email);
    
    return {
        token: tokenValue,
        user: {
            id: <int>user.id,
            name: user.name,
            phone_number: user.phone_number,
            email: user.email,
            role: user.role,
            categories: categoriesResult
        }
    };
}

public isolated function getUserProfile(string email) returns types:UserResponse|error {
    types:User?|error userResult = database:getUserByEmail(email);
    if userResult is error {
        return error("Database error: " + userResult.message());
    }
    if userResult is () {
        return error("User not found");
    }
    
    types:User user = <types:User>userResult;
    
    // Convert categories from JSON string to array
    types:Category[]|error categoriesResult = database:convertJsonToCategories(user.categories);
    if categoriesResult is error {
        return error("Error processing user data");
    }
    
    int userId = user.id ?: 0; // Provide a default value if ID is null
    return {
        id: userId,
        name: user.name,
        phone_number: user.phone_number,
        email: user.email,
        role: user.role,
        categories: categoriesResult
    };
}

public isolated function updateUserProfile(string email, types:User updatedUser) returns types:UserResponse|error {
    // Get existing user from database
    types:User?|error existingUserResult = database:getUserByEmail(email);
    if existingUserResult is error {
        return error("Database error: " + existingUserResult.message());
    }
    if existingUserResult is () {
        return error("User not found");
    }
    
    types:User existingUser = <types:User>existingUserResult;
    
    // Convert categories from JSON string to array
    types:Category[]|error categoriesResult = database:convertJsonToCategories(updatedUser.categories);
    if categoriesResult is error {
        return error("Error processing user data");
    }
    
    // Create update record
    types:UserUpdate updateData = {
        name: updatedUser.name,
        phone_number: updatedUser.phone_number,
        role: updatedUser.role,
        categories: categoriesResult
    };
    
    // Update user in database
    var result = database:updateUser(<int>existingUser.id, updateData);
    if result is error {
        return error("Failed to update user: " + result.message());
    }
    
    int userId = existingUser.id ?: 0; // Provide a default value if ID is null
    return {
        id: userId,
        name: updatedUser.name,
        phone_number: updatedUser.phone_number,
        email: email,
        role: updatedUser.role,
        categories: categoriesResult
    };

}

# Get user by ID
# + userId - The ID of the user to retrieve
# + return - User response or error
public isolated function getUserById(int userId) returns types:UserResponse|error {
    // Get user from database
    types:User?|error userResult = database:getUserById(userId);
    if userResult is error {
        return error("Database error: " + userResult.message());
    }
    if userResult is () {
        return error("User not found");
    }
    
    types:User user = <types:User>userResult;
    
    // Convert categories from JSON string to array
    types:Category[]|error categoriesResult = database:convertJsonToCategories(user.categories);
    if categoriesResult is error {
        return error("Error processing user data");
    }
    
    // Convert to UserResponse format
    return {
        id: user.id ?: 0,
        name: user.name,
        phone_number: user.phone_number,
        email: user.email,
        role: user.role,
        categories: categoriesResult
    };
}

public isolated function logoutUser(string tokenValue) returns error? {
    if !storage:tokenExists(tokenValue) {
        return error("Invalid token");
    }
    
    _ = storage:removeToken(tokenValue);
}