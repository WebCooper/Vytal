import ballerina/sql;
import ballerina/regex;
import backend.types;
import backend.database.client;
import backend.database.db_queries;

# Get all users from database
public function getUsers() returns types:User[]|sql:Error {
    stream<types:User, sql:Error?> resultStream = client:getDbClient()->query(db_queries:getUsersQuery());
    
    types:User[] users = [];
    error? e = resultStream.forEach(function(types:User user) {
        users.push(user);
    });
    
    if e is error {
        return error("Error fetching users: " + e.message());
    }
    
    return users;
}

# Get user by email
public function getUserByEmail(string email) returns types:User?|sql:Error {
    stream<types:User, sql:Error?> resultStream = client:getDbClient()->query(db_queries:getUserByEmailQuery(email));
    
    record {|types:User value;|}? result = check resultStream.next();
    check resultStream.close();
    
    if result is () {
        return ();
    }
    
    return result.value;
}

# Get user by ID
public function getUserById(int id) returns types:User?|sql:Error {
    stream<types:User, sql:Error?> resultStream = client:getDbClient()->query(db_queries:getUserByIdQuery(id));
    
    record {|types:User value;|}? result = check resultStream.next();
    check resultStream.close();
    
    if result is () {
        return ();
    }
    
    return result.value;
}

# Insert new user
public function insertUser(types:UserCreate user) returns sql:ExecutionResult|sql:Error {
    // Convert categories array to JSON string
    string categoriesJson = convertCategoriesToJson(user.categories);
    
    return client:getDbClient()->execute(db_queries:insertUserQuery(user, categoriesJson));
}

# Update user
public function updateUser(int id, types:UserUpdate user) returns sql:ExecutionResult|sql:Error {
    string? categoriesJson = ();
    if user.categories is Category[] {
        categoriesJson = convertCategoriesToJson(<Category[]>user.categories);
    }
    
    return client:getDbClient()->execute(db_queries:updateUserQuery(id, user, categoriesJson));
}

# Delete user
public function deleteUser(int id) returns sql:ExecutionResult|sql:Error {
    return client:getDbClient()->execute(db_queries:deleteUserQuery(id));
}

# Check if user exists by email
public function userExistsByEmail(string email) returns boolean|sql:Error {
    stream<record {int count;}, sql:Error?> resultStream = client:getDbClient()->query(db_queries:userExistsByEmailQuery(email));
    
    record {|record {int count;} value;|}? result = check resultStream.next();
    check resultStream.close();
    
    if result is () {
        return false;
    }
    
    return result.value.count > 0;
}

# Helper function to convert categories array to JSON string
function convertCategoriesToJson(types:Category[] categories) returns string {
    string[] categoryStrings = [];
    foreach var category in categories {
        categoryStrings.push("\"" + category + "\"");
    }
    return "[" + string:'join(",", ...categoryStrings) + "]";
}

# Helper function to convert JSON string to categories array
public function convertJsonToCategories(string categoriesJson) returns types:Category[]|error {
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
        if trimmed == "Organic" {
            categories.push(types:ORGANIC);
        } else if trimmed == "Medicines" {
            categories.push(types:MEDICINES);
        } else if trimmed == "Blood" {
            categories.push(types:BLOOD);
        }
    }
    
    return categories;
}
