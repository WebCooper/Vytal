import ballerinax/mysql;
import ballerina/sql;
import ballerina/regex;
import backend.types;

# Database Client Configuration
configurable types:DatabaseConfig dbConfig = ?;

# MySQL client instance
mysql:Client dbClient = check new (
    user = dbConfig.user,
    password = dbConfig.password,
    database = dbConfig.database,
    host = dbConfig.host,
    port = dbConfig.port
);

# Get user by email
public function getUserByEmail(string email) returns types:User?|error {
    sql:ParameterizedQuery query = `
        SELECT 
            id, name, phone_number, email, password, role, categories, created_at, updated_at
        FROM users 
        WHERE email = ${email}
    `;
    
    stream<types:User, sql:Error?> resultStream = dbClient->query(query);
    record {|types:User value;|}? result = check resultStream.next();
    check resultStream.close();
    
    if result is () {
        return ();
    }
    
    return result.value;
}

# Check if user exists by email
public function userExistsByEmail(string email) returns boolean|error {
    sql:ParameterizedQuery query = `
        SELECT COUNT(*) as count FROM users WHERE email = ${email}
    `;
    
    stream<record {int count;}, sql:Error?> resultStream = dbClient->query(query);
    record {|record {int count;} value;|}? result = check resultStream.next();
    check resultStream.close();
    
    if result is () {
        return false;
    }
    
    return result.value.count > 0;
}

# Insert new user
public function insertUser(types:UserCreate user) returns sql:ExecutionResult|error {
    // Convert categories array to JSON string
    string categoriesJson = convertCategoriesToJson(user.categories);
    
    sql:ParameterizedQuery query = `
        INSERT INTO users (name, phone_number, email, password, role, categories)
        VALUES (${user.name}, ${user.phone_number}, ${user.email}, ${user.password}, ${user.role}, ${categoriesJson})
    `;
    
    return dbClient->execute(query);
}

# Update user
public function updateUser(int id, types:UserUpdate user) returns sql:ExecutionResult|error {
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
    
    return dbClient->execute(query);
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
