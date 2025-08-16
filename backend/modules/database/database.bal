import ballerinax/mysql;
import ballerinax/mysql.driver as _; // Import MySQL driver
import ballerina/sql;
import ballerina/regex;
import backend.types;
import backend.storage;
import ballerina/io;

# Database Client Configuration - optional for development
configurable string dbHost = ?;
configurable string dbUser = ?;
configurable string dbPassword = ?;
configurable string dbDatabase = ?;
configurable int dbPort = ?;
configurable boolean useSSL = false;
configurable string sslMode = "PREFERRED";
configurable decimal connectTimeout = 30;

# MySQL client instance - with error handling
isolated mysql:Client? dbClient = ();

# Module initialization - try to connect to database
# Module initialization - try to connect to database
function init() {
    types:DatabaseConfig config = {
        host: dbHost,
        user: dbUser,
        password: dbPassword,
        database: dbDatabase,
        port: dbPort
    };
    
    io:println(string `=== MySQL Connection Test ===`);
    io:println(string `Host: ${config.host}, Port: ${config.port}, Database: ${config.database}, User: ${config.user}`);
    io:println(string `===========================`);
    
    // Set up MySQL options with connection timeout
    mysql:Options mysqlOptions = {
        connectTimeout: connectTimeout
    };
    
    // Configure SSL if enabled
    if useSSL {
        mysql:SSLMode sslModeEnum = getSslMode(sslMode);
        mysqlOptions.ssl = {
            mode: sslModeEnum
        };
    }
    
    // Configure connection pooling
    sql:ConnectionPool connectionPool = {
        maxOpenConnections: 15,
        maxConnectionLifeTime: 1800,
        minIdleConnections: 5
    };
    
    io:println("Connecting to MySQL database at " + config.host + ":" + config.port.toString());
    
    mysql:Client|error clientResult = new (
        host = config.host,
        user = config.user, 
        password = config.password,
        database = config.database,
        port = config.port,
        options = mysqlOptions,
        connectionPool = connectionPool
    );
    
    if clientResult is mysql:Client {
        lock {
            dbClient = clientResult;
        }
        io:println("✅ Successfully connected to MySQL database");

        // Ensure required tables exist
        checkpanic setupDatabase(clientResult);
    } else {
        io:println("❌ Failed to connect to MySQL database: " + clientResult.message());
        io:println("⚠️ Will use in-memory fallback storage instead");
    }
}


# Helper function to convert string SSL mode to enum
# + mode - SSL mode as string
# + return - Corresponding mysql:SSLMode enum value
isolated function getSslMode(string mode) returns mysql:SSLMode {
    match mode {
        "DISABLED" => {
            return mysql:SSL_DISABLED;
        }
        "REQUIRED" => {
            return mysql:SSL_REQUIRED;
        }
        "VERIFY_CA" => {
            return mysql:SSL_VERIFY_CA;
        }
        "VERIFY_IDENTITY" => {
            return mysql:SSL_VERIFY_IDENTITY;
        }
        _ => {
            // Default to PREFERRED
            return mysql:SSL_PREFERRED;
        }
    }
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
            "Organs" => {
                types:Category organs = "Organs";
                categories.push(organs);
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

# Close the database client connection
# Should be called when the application is shutting down
# + return - Error if closing fails
public isolated function closeDbConnection() returns error? {
    lock {
        if dbClient is mysql:Client {
            mysql:Client tempClient = <mysql:Client>dbClient;
            dbClient = ();
            return tempClient.close();
        }
    }
    return ();
}

# Description.
#
# + dbClient - parameter description
# + return - return value description
public isolated function setupDatabase(mysql:Client dbClient) returns error? {
    // Users table
    sql:ExecutionResult _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('donor', 'receiver') NOT NULL,
        categories JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_created_at (created_at)
    )`);

    // Health records table
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS health_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        record_type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_record_type (record_type),
        INDEX idx_created_at (created_at)
    )`);

    // Appointments table
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATETIME NOT NULL,
        status ENUM('scheduled', 'confirmed', 'completed', 'cancelled') DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_patient_id (patient_id),
        INDEX idx_doctor_id (doctor_id),
        INDEX idx_appointment_date (appointment_date),
        INDEX idx_status (status)
    )`);

    io:println("✅ Database tables are ready");
}
