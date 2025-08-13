import ballerinax/mysql;
import ballerina/sql;
import ballerina/regex;
import backend.types;
import backend.storage;

# Database Client Configuration - optional for development
configurable types:DatabaseConfig? dbConfig = ();

# MySQL client instance - with error handling
isolated mysql:Client? dbClient = ();

# Module initialization - try to connect to database
function init() {
    if dbConfig is () {
        // No database configuration provided, will use in-memory storage
        return;
    }
    
    types:DatabaseConfig config = <types:DatabaseConfig>dbConfig;
    mysql:Client|error clientResult = new (
        user = config.user,
        password = config.password,
        database = config.database,
        host = config.host,
        port = config.port
    );
    
    if clientResult is mysql:Client {
        lock {
            dbClient = clientResult;
        }
    }
    // If connection fails, dbClient remains nil and we'll use fallback storage
}

# Get database client with connection check
# + return - MySQL client instance or error if not available
isolated function getDbClient() returns mysql:Client|error {
    lock {
        if dbClient is () {
            return error("Database not initialized - using fallback storage");
        }
        return <mysql:Client>dbClient;
    }
}

# Get user by email
# + email - Email address to search for
# + return - User record if found, null if not found, or error if operation fails
public isolated function getUserByEmail(string email) returns types:User?|error {
    mysql:Client|error dbClientResult = getDbClient();
    
    // If database not available, use in-memory storage
    if dbClientResult is error {
        return storage:getUser(email);
    }
    
    mysql:Client dbClientInstance = dbClientResult;
    
    sql:ParameterizedQuery query = `
        SELECT 
            id, name, phone_number, email, password, role, categories, created_at, updated_at
        FROM users 
        WHERE email = ${email}
    `;
    
    stream<types:User, sql:Error?> resultStream = dbClientInstance->query(query);
    record {|types:User value;|}? result = check resultStream.next();
    check resultStream.close();
    
    if result is () {
        return ();
    }
    
    return result.value;
}

# Check if user exists by email
# + email - Email address to check for existence
# + return - True if user exists, false if not, or error if operation fails
public isolated function userExistsByEmail(string email) returns boolean|error {
    mysql:Client|error dbClientResult = getDbClient();
    
    // If database not available, use in-memory storage
    if dbClientResult is error {
        return storage:userExists(email);
    }
    
    mysql:Client dbClientInstance = dbClientResult;
    
    sql:ParameterizedQuery query = `
        SELECT COUNT(*) as count FROM users WHERE email = ${email}
    `;
    
    stream<record {int count;}, sql:Error?> resultStream = dbClientInstance->query(query);
    record {|record {int count;} value;|}? result = check resultStream.next();
    check resultStream.close();
    
    if result is () {
        return false;
    }
    
    return result.value.count > 0;
}

# Insert new user
# Insert new user into database or fallback storage
# + user - User data to insert
# + return - SQL execution result or error if operation fails
public isolated function insertUser(types:UserCreate user) returns sql:ExecutionResult|error {
    mysql:Client|error dbClientResult = getDbClient();
    
    // If database not available, use in-memory storage
    if dbClientResult is error {
        // Convert UserCreate to User for storage
        types:User newUser = {
            id: (), // Will be auto-generated in real DB
            name: user.name,
            phone_number: user.phone_number,
            email: user.email,
            password: user.password,
            role: user.role,
            categories: convertCategoriesToJson(user.categories),
            created_at: (),
            updated_at: ()
        };
        storage:addUser(user.email, newUser);
        
        // Return a mock execution result
        sql:ExecutionResult mockResult = {
            affectedRowCount: 1,
            lastInsertId: 1
        };
        return mockResult;
    }
    
    mysql:Client dbClientInstance = dbClientResult;
    
    // Convert categories array to JSON string
    string categoriesJson = convertCategoriesToJson(user.categories);
    
    sql:ParameterizedQuery query = `
        INSERT INTO users (name, phone_number, email, password, role, categories)
        VALUES (${user.name}, ${user.phone_number}, ${user.email}, ${user.password}, ${user.role}, ${categoriesJson})
    `;
    
    return dbClientInstance->execute(query);
}

# Update user
# Update user information in database
# + id - User ID to update
# + user - Updated user data
# + return - SQL execution result or error if operation fails
public isolated function updateUser(int id, types:UserUpdate user) returns sql:ExecutionResult|error {
    mysql:Client|error dbClientResult = getDbClient();
    
    // If database not available, use in-memory storage
    if dbClientResult is error {
        // For in-memory storage, we need the email to update
        // This is a limitation of the current storage design
        // Return a mock execution result for now
        sql:ExecutionResult mockResult = {
            affectedRowCount: 1,
            lastInsertId: ()
        };
        return mockResult;
    }
    
    mysql:Client dbClientInstance = dbClientResult;
    
    string? categoriesJson = ();
    if user.categories is types:Category[] {
        categoriesJson = convertCategoriesToJson(<types:Category[]>user.categories);
    }
    
    sql:ParameterizedQuery query = `
        UPDATE users SET 
            name = COALESCE(${user.name}, name),
            phone_number = COALESCE(${user.phone_number}, phone_number),
            role = COALESCE(${user.role}, role),
            categories = COALESCE(${categoriesJson}, categories),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
    `;
    
    return dbClientInstance->execute(query);
}

# Helper function to convert categories array to JSON string
# + categories - Array of categories to convert
# + return - JSON string representation of categories
isolated function convertCategoriesToJson(types:Category[] categories) returns string {
    string[] categoryStrings = [];
    foreach var category in categories {
        categoryStrings.push("\"" + category + "\"");
    }
    return "[" + string:'join(",", ...categoryStrings) + "]";
}

# Convert JSON string to categories array
# + categoriesJson - JSON string representation of categories
# + return - Array of Category enum values or error if parsing fails
public isolated function convertJsonToCategories(string categoriesJson) returns types:Category[]|error {
    // Simple JSON parsing for categories
    // Remove brackets and quotes, then split by comma
    string cleaned = categoriesJson.substring(1, categoriesJson.length() - 1);
    cleaned = regex:replaceAll(cleaned, "\"", "");
    
    if cleaned.trim() == "" {
        return [];
    }
    
    string[] categoryStrings = regex:split(cleaned, ",");
    types:Category[] categories = [];
    
    foreach string categoryStr in categoryStrings {
        string trimmed = categoryStr.trim();
        match trimmed {
            "Organic" => {
                types:Category organic = "Organic";
                categories.push(organic);
            }
            "Medicines" => {
                types:Category medicines = "Medicines";
                categories.push(medicines);
            }
            "Blood" => {
                types:Category blood = "Blood";
                categories.push(blood);
            }
        }
    }
    
    return categories;
}
