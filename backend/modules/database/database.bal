import ballerinax/mysql;
import ballerinax/mysql.driver as _; // Import MySQL driver
import ballerina/sql;
import ballerina/regex;
import backend.types;
import backend.storage;
import ballerina/io;
import ballerina/lang.'int;

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

# Get user by ID
# + userId - User ID to search for
# + return - User record if found, null if not found, or error if operation fails
public isolated function getUserById(int userId) returns types:User?|error {
    mysql:Client|error dbClientResult = getDbClient();
    
    // If database not available, use in-memory storage
    if dbClientResult is error {
        return error("Database not available");
    }
    
    mysql:Client dbClientInstance = dbClientResult;
    
    sql:ParameterizedQuery query = `
        SELECT 
            id, name, phone_number, email, password, role, categories, created_at, updated_at
        FROM users 
        WHERE id = ${userId}
    `;
    
    stream<types:User, sql:Error?> resultStream = dbClientInstance->query(query);
    record {|types:User value;|}? result = check resultStream.next();
    check resultStream.close();
    
    if result is () {
        return ();
    }
    
    return result.value;
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
                types:Category organs = "organs";
                categories.push(organs);
            }
            "Medicines" => {
                types:Category medicines = "medicines";
                categories.push(medicines);
            }
            "Blood" => {
                types:Category blood = "blood";
                categories.push(blood);
            }
            "Fundraiser" => {
                types:Category fundraiser = "fundraiser";
                categories.push(fundraiser);
            }
            "Supplies" => {
                types:Category supplies = "supplies";
                categories.push(supplies);
            }
        }
    }
    
    return categories;
}
public isolated function getRecipientPosts() returns types:RecipientPost[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `SELECT * FROM recipient_posts ORDER BY created_at DESC`;
    stream<record {}, sql:Error?> resultStream = dbClientInstance->query(query);

    types:RecipientPost[] posts = [];

    while (true) {
        record {|record {} value;|}|sql:Error? result = resultStream.next();
        if result is sql:Error {
            return error("Error retrieving posts: " + result.message());
        } else if result is () {
            break;
        } else {
            var row = result.value;
            
            // Parse category, status, and urgency by removing surrounding quotes
            string categoryClean = regex:replaceAll(row.get("category").toString(), "\"", "");
            string statusClean = regex:replaceAll(row.get("status").toString(), "\"", "");
            
            string? urgencyValue = row.get("urgency") is string ? row.get("urgency").toString() : ();
            string? urgencyClean = urgencyValue is string ? regex:replaceAll(urgencyValue, "\"", "") : ();
            
            types:RecipientPost post = {
                id: check int:fromString(row.get("id").toString()),
                recipient_id: check int:fromString(row.get("recipient_id").toString()),
                title: row.get("title").toString(),
                content: row.get("content").toString(),
                category: <types:Category>categoryClean,
                status: <types:Status>statusClean,
                location: row.get("location") is string ? row.get("location").toString() : (),
                urgency: urgencyClean is string ? <types:Urgency>urgencyClean : (),
                contact: row.get("contact") is string ? row.get("contact").toString() : (),
                created_at: row.get("created_at") is string ? row.get("created_at").toString() : (),
                updated_at: row.get("updated_at") is string ? row.get("updated_at").toString() : (),
                likes: check int:fromString(row.get("likes").toString()),
                comments: check int:fromString(row.get("comments").toString()),
                shares: check int:fromString(row.get("shares").toString()),
                views: check int:fromString(row.get("views").toString()),
                goal: row.get("goal") is decimal ? <decimal>row.get("goal") : (),
                received: row.get("received") is decimal ? <decimal>row.get("received") : ()
            };
            posts.push(post);
        }
    }
    
    check resultStream.close();

    check resultStream.close();
    return posts;
}


public isolated function getRecipientPostById(int id) returns types:RecipientPost?|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `
        SELECT id, recipient_id, title, content, category, status,
               location, urgency, contact, created_at, updated_at,
               likes, comments, shares, views, goal, received
        FROM recipient_posts
        WHERE id = ${id}
    `;

    // Define the record with all required fields
    stream<record {
        int id;
        int recipient_id;
        string title;
        string content;
        string category;
        string status;
        string? location;
        string? urgency;
        string? contact;
        string? created_at;
        string? updated_at;
        int likes;
        int comments;
        int shares;
        int views;
        decimal? goal;
        decimal? received;
    }, sql:Error?> resultStream = dbClientInstance->query(query);

    record {|record {
        int id;
        int recipient_id;
        string title;
        string content;
        string category;
        string status;
        string? location;
        string? urgency;
        string? contact;
        string? created_at;
        string? updated_at;
        int likes;
        int comments;
        int shares;
        int views;
        decimal? goal;
        decimal? received;
    } value;|}? result = check resultStream.next();
    check resultStream.close();

    if result is () {
        return ();
    }

    var row = result.value;

    // Parse JSON string fields
    string categoryClean = regex:replaceAll(row.category, "\"", "");
    string statusClean = regex:replaceAll(row.status, "\"", "");
    string? urgencyClean = row.urgency is string 
    ? regex:replaceAll(row.urgency ?: "", "\"", "") 
    : ();


    // Build the RecipientPost record
    types:RecipientPost post = {
        id: row.id,
        recipient_id: row.recipient_id,
        title: row.title,
        content: row.content,
        category: <types:Category>categoryClean,
        status: <types:Status>statusClean,
        location: row.location,
        urgency: urgencyClean is string ? <types:Urgency>urgencyClean : (),
        contact: row.contact,
        created_at: row.created_at,
        updated_at: row.updated_at,
        likes: row.likes,
        comments: row.comments,
        shares: row.shares,
        views: row.views,
        goal: row.goal,
        received: row.received
    };

    return post;
}


# Insert a new recipient post into the database
# + post - The recipient post data to insert
# + return - The execution result or error if operation fails
public isolated function insertRecipientPost(types:RecipientPostCreate post) returns sql:ExecutionResult|error {
    mysql:Client dbClientInstance = check getDbClient();

    // Serialize enums to string (which will be inserted as JSON strings)
    string categoryJson = "\"" + post.category.toString() + "\"";
    string statusJson = "\"" + post.status.toString() + "\"";
    string? urgencyJson = post.urgency is () ? () : "\"" + post.urgency.toString() + "\"";

    sql:ParameterizedQuery query = `INSERT INTO recipient_posts (
        recipient_id, title, content, category, status,
        location, urgency, contact, goal
    ) VALUES (
        ${post.recipient_id}, ${post.title}, ${post.content}, ${categoryJson}, ${statusJson},
        ${post.location}, ${urgencyJson}, ${post.contact}, ${post.goal}
    )`;
    
    return dbClientInstance->execute(query);
}


# Update an existing recipient post in the database
# + id - The ID of the recipient post to update
# + post - The updated recipient post data
# + return - The execution result or error if operation fails
public isolated function updateRecipientPost(int id, types:RecipientPostUpdate post) returns sql:ExecutionResult|error {
    mysql:Client dbClientInstance = check getDbClient();
    sql:ParameterizedQuery query = `
        UPDATE recipient_posts 
        SET 
            title = COALESCE(${post.title}, title),
            content = COALESCE(${post.content}, content),
            category = COALESCE(${post.category is () ? () : "\"" + post.category.toString() + "\""}, category),
            status = COALESCE(${post.status is () ? () : "\"" + post.status.toString() + "\""}, status),
            location = COALESCE(${post.location}, location),
            urgency = COALESCE(${post.urgency is () ? () : "\"" + post.urgency.toString() + "\""}, urgency),
            contact = COALESCE(${post.contact}, contact),
            goal = COALESCE(${post.goal}, goal),
            received = COALESCE(${post.received}, received),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
    `;
    return dbClientInstance->execute(query);
}

# Delete a recipient post from the database
# + id - The ID of the recipient post to delete
# + return - The execution result or error if operation fails
public isolated function deleteRecipientPost(int id) returns sql:ExecutionResult|error {
    mysql:Client dbClientInstance = check getDbClient();
    sql:ParameterizedQuery query = `DELETE FROM recipient_posts WHERE id = ${id}`;
    return dbClientInstance->execute(query);
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
        role ENUM('donor', 'recipient', 'admin','organization') NOT NULL,
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

    // Recipient posts table
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS recipient_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        category JSON NOT NULL,
        status JSON,
        location VARCHAR(200),
        urgency JSON,
        contact VARCHAR(300),
        likes INT DEFAULT 0,
        comments INT DEFAULT 0,
        shares INT DEFAULT 0,
        views INT DEFAULT 0,
        goal DECIMAL(15,2),
        received DECIMAL(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
    io:println("✅ Database tables are ready");
}

# ===== ADMIN DATABASE FUNCTIONS =====

# Get admin by email for authentication
# + email - Email address of the admin to retrieve
# + return - User record if admin found, error if not found or operation fails
public isolated function getAdminByEmail(string email) returns types:User|error {
    mysql:Client|error dbClientResult = getDbClient();
    
    if dbClientResult is error {
        return error("Database client not initialized");
    }
    
    mysql:Client dbConnection = dbClientResult;
    
    sql:ParameterizedQuery query = `SELECT * FROM users WHERE email = ${email} AND role = 'admin'`;
    stream<types:User, sql:Error?> resultStream = dbConnection->query(query);
    
    record {|types:User value;|}? result = check resultStream.next();
    check resultStream.close();
    
    if result is () {
        return error("Admin not found");
    }
    
    return result.value;
}

# Update last login timestamp for user
# + userId - ID of the user to update last login time
# + return - Error if the operation fails
public isolated function updateLastLogin(int userId) returns error? {
    mysql:Client|error dbClientResult = getDbClient();
    
    if dbClientResult is error {
        return error("Database client not initialized");
    }
    
    mysql:Client dbConnection = dbClientResult;

    sql:ParameterizedQuery query = `UPDATE users SET updated_at = NOW() WHERE id = ${userId}`;
    _ = check dbConnection->execute(query);
    return;
}

# Get filtered users with pagination for admin
# + search - Optional search string to filter users
# + role - Optional role to filter users
# + status - Optional status to filter users
# + pageLimit - Number of users per page
# + offset - Starting offset for pagination
# + return - Array of user summaries or error
public isolated function getFilteredUsers(string? search, types:Role? role, string? status, int pageLimit, int offset) returns types:UserSummary[]|error {
    mysql:Client|error dbClientResult = getDbClient();
    
    if dbClientResult is error {
        return error("Database client not initialized");
    }
    
    mysql:Client dbConnection = dbClientResult;

    // Build the query dynamically
    sql:ParameterizedQuery query = `SELECT id, name, email, phone_number, role, status, created_at FROM users WHERE 1=1`;
    
    if search is string && search.trim() != "" {
        string searchPattern = "%" + search + "%";
        query = sql:queryConcat(query, ` AND (name LIKE ${searchPattern} OR email LIKE ${searchPattern})`);
    }
    
    if role is types:Role {
        string roleStr = role.toString();
        query = sql:queryConcat(query, ` AND role = ${roleStr}`);
    }
    
    if status is string && status.trim() != "" {
        query = sql:queryConcat(query, ` AND status = ${status}`);
    }
    
    query = sql:queryConcat(query, ` ORDER BY created_at DESC LIMIT ${pageLimit} OFFSET ${offset}`);
    
    stream<record {| int id; string name; string email; string phone_number; string role; string status; string created_at; |}, sql:Error?> resultStream = dbConnection->query(query);
    
    types:UserSummary[] users = [];
    
    // Use isolated function with check
    check from record {| int id; string name; string email; string phone_number; string role; string status; string created_at; |} user in resultStream
        do {
            types:UserSummary userSummary = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                role: getRoleFromString(user.role),
                status: user.status,
                created_at: user.created_at,
                last_login: () // Add last_login tracking if needed
            };
            users.push(userSummary);
        };
    
    check resultStream.close();
    return users;
}

# Get user count for pagination
# + search - Optional search string to filter users
# + role - Optional role to filter users
# + status - Optional status to filter users
# + return - Total count of filtered users or error
public isolated function getUserCount(string? search, types:Role? role, string? status) returns int|error {
    mysql:Client|error dbClientResult = getDbClient();
    
    if dbClientResult is error {
        return error("Database client not initialized");
    }
    
    mysql:Client dbConnection = dbClientResult;

    // Build the query dynamically
    sql:ParameterizedQuery query = `SELECT COUNT(*) as count FROM users WHERE 1=1`;
    
    if search is string && search.trim() != "" {
        string searchPattern = "%" + search + "%";
        query = sql:queryConcat(query, ` AND (name LIKE ${searchPattern} OR email LIKE ${searchPattern})`);
    }
    
    if role is types:Role {
        string roleStr = role.toString();
        query = sql:queryConcat(query, ` AND role = ${roleStr}`);
    }
    
    if status is string && status.trim() != "" {
        query = sql:queryConcat(query, ` AND status = ${status}`);
    }
    
    record {| int count; |}? result = check dbConnection->queryRow(query);
    
    if result is () {
        return 0;
    }
    
    return result.count;
}

# Get user statistics
# + userId - ID of the user to get statistics for
# + return - User stats record or error
public isolated function getUserStats(int userId) returns types:UserStats|error {
    mysql:Client|error dbClientResult = getDbClient();
    
    if dbClientResult is error {
        return error("Database client not initialized");
    }
    
    mysql:Client dbConnection = dbClientResult;

    sql:ParameterizedQuery query = `
        SELECT 
            COUNT(*) as total_posts,
            SUM(CASE WHEN status = '"open"' THEN 1 ELSE 0 END) as active_posts,
            SUM(CASE WHEN status = '"fulfilled"' THEN 1 ELSE 0 END) as completed_posts
        FROM recipient_posts 
        WHERE recipient_id = ${userId}
    `;
    
    record {| int total_posts; int active_posts; int completed_posts; |}? result = check dbConnection->queryRow(query);
    
    if result is () {
        return {
            total_posts: 0,
            active_posts: 0,
            completed_posts: 0,
            donations_made: (),
            donations_received: ()
        };
    }
    
    return {
        total_posts: result.total_posts,
        active_posts: result.active_posts,
        completed_posts: result.completed_posts,
        donations_made: (), // Implement when donation tracking is added
        donations_received: () // Implement when donation tracking is added
    };
}

# Update user status
# + userId - ID of the user to update status
# + status - New status value (active, inactive, suspended)
# + reason - Optional reason for status change
# + return - Error if operation fails
public isolated function updateUserStatus(int userId, string status, string? reason) returns error? {
    mysql:Client|error dbClientResult = getDbClient();
    
    if dbClientResult is error {
        return error("Database client not initialized");
    }
    
    mysql:Client dbConnection = dbClientResult;

    sql:ParameterizedQuery query = `UPDATE users SET status = ${status}, updated_at = NOW() WHERE id = ${userId}`;
    _ = check dbConnection->execute(query);
    
    // Log the status change
    io:println(string `User ${userId} status updated to ${status}. Reason: ${reason ?: "No reason provided"}`);
    return;
}

# Helper function to convert string to Role enum
# + roleStr - String representation of role
# + return - Role enum value
isolated function getRoleFromString(string roleStr) returns types:Role {
    match roleStr {
        "donor" => { return types:DONOR; }
        "recipient" => { return types:RECIPIENT; }
        "organization" => { return types:ORGANIZATION; }
        "admin" => { return types:ADMIN; }
        _ => { return types:DONOR; } // default
    }
}
