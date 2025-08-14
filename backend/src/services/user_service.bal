// User service - handles all user-related operations
import ballerina/sql;
import ballerina/io;
import vytal_backend.models;
import vytal_backend.utils.database;
import vytal_backend.utils.auth;

// Database operations
public function getUserById(int id) returns models:User|error? {
    sql:ParameterizedQuery query = `
        SELECT id, name, phone, email, role, category, created_at, updated_at 
        FROM users WHERE id = ${id}
    `;
    
    stream<models:User, error?> resultStream = database:dbClient->query(query);
    models:User? user = check resultStream.next();
    check resultStream.close();
    
    return user;
}

public function getUserByEmail(string email) returns models:User|error? {
    sql:ParameterizedQuery query = `
        SELECT id, name, phone, email, password_hash, role, category, created_at, updated_at 
        FROM users WHERE email = ${email}
    `;
    
    stream<models:User, error?> resultStream = database:dbClient->query(query);
    models:User? user = check resultStream.next();
    check resultStream.close();
    
    return user;
}

public function getAllUsers() returns models:User[]|error {
    sql:ParameterizedQuery query = `
        SELECT id, name, phone, email, role, category, created_at, updated_at 
        FROM users ORDER BY created_at DESC
    `;
    
    stream<models:User, error?> resultStream = database:dbClient->query(query);
    models:User[] users = [];
    
    error? e = resultStream.forEach(function(models:User user) {
        users.push(user);
    });
    
    if e is error {
        return e;
    }
    
    return users;
}

public function createUser(models:UserCreateRequest userReq) returns models:User|error {
    // Validate required fields
    if userReq.name.trim() == "" || userReq.phone.trim() == "" || userReq.email.trim() == "" || userReq.password.trim() == "" {
        return error("All fields are required");
    }
    
    // Validate role
    if userReq.role != "donor" && userReq.role != "receiver" {
        return error("Role must be either 'donor' or 'receiver'");
    }
    
    // Validate category
    if userReq.category != "Organs" && userReq.category != "Medicines" && userReq.category != "Blood" {
        return error("Category must be 'Organs', 'Medicines', or 'Blood'");
    }
    
    // Check if user already exists
    models:User? existingUser = check getUserByEmail(userReq.email);
    if existingUser is models:User {
        return error("User with this email already exists");
    }
    
    // Hash password using SHA2 to match database
    string hashedPassword = check auth:hashPassword(userReq.password);
    
    // Insert new user
    sql:ParameterizedQuery insertQuery = `
        INSERT INTO users (name, phone, email, password_hash, role, category) 
        VALUES (${userReq.name}, ${userReq.phone}, ${userReq.email}, ${hashedPassword}, ${userReq.role}, ${userReq.category})
    `;
    
    sql:ExecutionResult result = check database:dbClient->execute(insertQuery);
    
    if result.affectedRowCount > 0 {
        // Retrieve the created user
        models:User? newUser = check getUserByEmail(userReq.email);
        if newUser is models:User {
            return newUser;
        } else {
            return error("Failed to retrieve created user");
        }
    } else {
        return error("Failed to create user");
    }
}

public function authenticateUser(models:UserLoginRequest loginReq) returns models:User|error {
    // Get user by email
    models:User? user = check getUserByEmail(loginReq.email);
    
    if user is () {
        return error("Invalid email or password");
    }
    
    // Verify password using SHA2 hash
    string hashedPassword = check auth:hashPassword(loginReq.password);
    
    if user.password_hash != hashedPassword {
        return error("Invalid email or password");
    }
    
    // Remove password hash from response
    user.password_hash = ();
    
    return user;
}

public function updateUser(int id, models:UserCreateRequest userReq) returns models:User|error {
    // Validate that user exists
    models:User? existingUser = check getUserById(id);
    if existingUser is () {
        return error("User not found");
    }
    
    // Validate fields
    if userReq.name.trim() == "" || userReq.phone.trim() == "" || userReq.email.trim() == "" {
        return error("Name, phone, and email are required");
    }
    
    // Validate role and category
    if userReq.role != "donor" && userReq.role != "receiver" {
        return error("Role must be either 'donor' or 'receiver'");
    }
    
    if userReq.category != "Organs" && userReq.category != "Medicines" && userReq.category != "Blood" {
        return error("Category must be 'Organs', 'Medicines', or 'Blood'");
    }
    
    // Check if email is already taken by another user
    models:User? userWithEmail = check getUserByEmail(userReq.email);
    if userWithEmail is models:User && userWithEmail.id != id {
        return error("Email is already taken by another user");
    }
    
    // Update user
    sql:ParameterizedQuery updateQuery = `
        UPDATE users 
        SET name = ${userReq.name}, phone = ${userReq.phone}, email = ${userReq.email}, 
            role = ${userReq.role}, category = ${userReq.category}
        WHERE id = ${id}
    `;
    
    sql:ExecutionResult result = check database:dbClient->execute(updateQuery);
    
    if result.affectedRowCount > 0 {
        models:User? updatedUser = check getUserById(id);
        if updatedUser is models:User {
            return updatedUser;
        } else {
            return error("Failed to retrieve updated user");
        }
    } else {
        return error("Failed to update user");
    }
}

public function deleteUser(int id) returns boolean|error {
    // Validate that user exists
    models:User? existingUser = check getUserById(id);
    if existingUser is () {
        return error("User not found");
    }
    
    sql:ParameterizedQuery deleteQuery = `DELETE FROM users WHERE id = ${id}`;
    sql:ExecutionResult result = check database:dbClient->execute(deleteQuery);
    
    return result.affectedRowCount > 0;
}
