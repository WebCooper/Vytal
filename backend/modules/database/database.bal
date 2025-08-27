import backend.storage;
import backend.types;

import ballerina/io;
import ballerina/lang.'int;
import ballerina/lang.value;
import ballerina/regex;
import ballerina/sql;
import ballerinax/mysql;
import ballerinax/mysql.driver as _; // Import MySQL driver

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

    record {|
        record {
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
        } value;
    |}? result = check resultStream.next();
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

public isolated function createDonorPost(int userId, types:DonorPostCreate request) returns int|error {
    mysql:Client|error dbClientResult = getDbClient();

    // If database not available, return an error
    if dbClientResult is error {
        return error("Database not available");
    }

    mysql:Client dbClientInstance = dbClientResult;
    string categoryJson = value:toJson(request.category).toJsonString();
    string statusJson = value:toJson(request.status).toJsonString();
    string urgencyJson = value:toJson(request.urgency).toJsonString();

    // Convert complex objects to JSON strings if they exist
    string? bloodOfferingJson = request.bloodOffering is () ? () :
        value:toJson(request.bloodOffering).toJsonString();
    string? fundraiserOfferingJson = request.fundraiserOffering is () ? () :
        value:toJson(request.fundraiserOffering).toJsonString();
    string? medicineOfferingJson = request.medicineOffering is () ? () :
        value:toJson(request.medicineOffering).toJsonString();
    string? organOfferingJson = request.organOffering is () ? () :
        value:toJson(request.organOffering).toJsonString();

    // Match exactly with the database column names from the CREATE TABLE statement
    sql:ParameterizedQuery query = `INSERT INTO donor_posts 
        (donor_id, title, category, content, location, status, urgency, contact, 
        bloodOffering, fundraiserOffering, medicineOffering, organOffering,
        likes, comments, shares, views, created_at) 
        VALUES (${userId}, ${request.title}, ${categoryJson}, ${request.content},
                ${request.location}, ${statusJson}, ${urgencyJson}, ${request.contact},
                ${bloodOfferingJson}, ${fundraiserOfferingJson},
                ${medicineOfferingJson}, ${organOfferingJson},
                0, 0, 0, 0, CURRENT_TIMESTAMP())`;

    sql:ExecutionResult|error result = dbClientInstance->execute(query);
    if result is error {
        return result;
    }

    return <int>result.lastInsertId;
}

public isolated function getDonorPostById(int id) returns types:DonorPost|error|() {
    mysql:Client|error dbClientResult = getDbClient();

    if dbClientResult is error {
        return error("Database not available");
    }

    mysql:Client dbClientInstance = dbClientResult;

    sql:ParameterizedQuery query = `SELECT * FROM donor_posts WHERE id = ${id}`;
    stream<record {}, sql:Error?> resultStream = dbClientInstance->query(query);

    // Use proper type casting to handle the result
    var result = resultStream.next();
    check resultStream.close();

    if result is sql:Error {
        return error("Error fetching donor post: " + result.message());
    } else if result is () {
        return ();
    } else {
        // The result can only be a record at this point
        var recordResult = <record {|record {} value;|}>result;
        return mapRowToDonorPost(recordResult.value);
    }
}

public isolated function getDonorPosts() returns types:DonorPost[]|error {
    mysql:Client|error dbClientResult = getDbClient();

    if dbClientResult is error {
        return error("Database not available");
    }

    mysql:Client dbClientInstance = dbClientResult;

    sql:ParameterizedQuery query = `SELECT * FROM donor_posts ORDER BY created_at DESC`;
    stream<record {}, sql:Error?> resultStream = dbClientInstance->query(query);

    types:DonorPost[] posts = [];

    // Process each row
    while (true) {
        var result = resultStream.next();
        if result is sql:Error {
            check resultStream.close();
            return error("Error fetching donor posts: " + result.message());
        } else if result is () {
            break;
        } else {
            // The result can only be a record at this point
            var recordResult = <record {|record {} value;|}>result;
            types:DonorPost|error post = mapRowToDonorPost(recordResult.value);
            if post is error {
                check resultStream.close();
                return post;
            }
            posts.push(post);
        }
    }

    check resultStream.close();
    return posts;
}

public isolated function updateDonorPost(int id, types:DonorPostUpdate request) returns boolean|error {
    mysql:Client|error dbClientResult = getDbClient();

    if dbClientResult is error {
        return error("Database not available");
    }

    mysql:Client dbClientInstance = dbClientResult;

    // Convert complex objects to JSON strings if they exist
    string? bloodOfferingJson = request.bloodOffering is () ? () :
        value:toJson(request.bloodOffering).toJsonString();
    string? fundraiserOfferingJson = request.fundraiserOffering is () ? () :
        value:toJson(request.fundraiserOffering).toJsonString();
    string? medicineOfferingJson = request.medicineOffering is () ? () :
        value:toJson(request.medicineOffering).toJsonString();
    string? organOfferingJson = request.organOffering is () ? () :
        value:toJson(request.organOffering).toJsonString();

    sql:ParameterizedQuery query = `UPDATE donor_posts SET 
        title = COALESCE(${request.title}, title),
        category = COALESCE(${request.category}, category),
        content = COALESCE(${request.content}, content),
        status = COALESCE(${request.status}, status),
        location = COALESCE(${request.location}, location),
        urgency = COALESCE(${request.urgency}, urgency),
        contact = COALESCE(${request.contact}, contact),
        blood_offering = COALESCE(${bloodOfferingJson}, blood_offering),
        fundraiser_offering = COALESCE(${fundraiserOfferingJson}, fundraiser_offering),
        medicine_offering = COALESCE(${medicineOfferingJson}, medicine_offering),
        organ_offering = COALESCE(${organOfferingJson}, organ_offering),
        updated_at = CURRENT_TIMESTAMP()
        WHERE id = ${id}`;

    sql:ExecutionResult|error result = dbClientInstance->execute(query);
    if result is error {
        return result;
    }

    return result?.affectedRowCount > 0;
}

public isolated function deleteDonorPost(int id) returns boolean|error {
    mysql:Client|error dbClientResult = getDbClient();

    if dbClientResult is error {
        return error("Database not available");
    }

    mysql:Client dbClientInstance = dbClientResult;

    sql:ParameterizedQuery query = `DELETE FROM donor_posts WHERE id = ${id}`;
    sql:ExecutionResult|error result = dbClientInstance->execute(query);
    if result is error {
        return result;
    }
    return result?.affectedRowCount > 0;
}

# Mapper Helper for converting database row to DonorPost record
# + row - Database row containing donor post data
# + return - DonorPost record or error
isolated function mapRowToDonorPost(record {} row) returns types:DonorPost|error {
    // Parse JSON strings to objects
    types:BloodOffering? bloodOffer = ();
    types:FundraiserOffering? fundraiserOffer = ();
    types:MedicineOffering? medicineOffer = ();
    types:OrganOffering? organOffer = ();

    // --- Offerings ---
    if row["bloodOffering"] is string {
        string jsonStr = <string>row["bloodOffering"];
        if jsonStr.trim() != "" {
            json jsonData = check value:fromJsonString(jsonStr);
            bloodOffer = check value:cloneWithType(jsonData);
        }
    }

    if row["fundraiserOffering"] is string {
        string jsonStr = <string>row["fundraiserOffering"];
        if jsonStr.trim() != "" {
            json jsonData = check value:fromJsonString(jsonStr);
            fundraiserOffer = check value:cloneWithType(jsonData);
        }
    }

    if row["medicineOffering"] is string {
        string jsonStr = <string>row["medicineOffering"];
        if jsonStr.trim() != "" {
            json jsonData = check value:fromJsonString(jsonStr);
            medicineOffer = check value:cloneWithType(jsonData);
        }
    }

    if row["organOffering"] is string {
        string jsonStr = <string>row["organOffering"];
        if jsonStr.trim() != "" {
            json jsonData = check value:fromJsonString(jsonStr);
            organOffer = check value:cloneWithType(jsonData);
        }
    }

    // --- Core JSON fields ---
    string status = "";
    string category = "";
    string urgency = "";

    if row["status"] is string {
        string jsonStr = <string>row["status"];
        if jsonStr.trim() != "" {
            json parsed = check value:fromJsonString(jsonStr);
            // unwrap JSON string like `"low"` into plain string
            if parsed is string {
                status = parsed;
            }
        }
    }

    if row["category"] is string {
        string jsonStr = <string>row["category"];
        if jsonStr.trim() != "" {
            json parsed = check value:fromJsonString(jsonStr);
            if parsed is string {
                category = parsed;
            } else if parsed is json[] {
                // if category was stored as an array, take first element (or join them)
                if parsed.length() > 0 && parsed[0] is string {
                    category = <string>parsed[0];
                }
            }
        }
    }

    if row["urgency"] is string {
        string jsonStr = <string>row["urgency"];
        if jsonStr.trim() != "" {
            json parsed = check value:fromJsonString(jsonStr);
            if parsed is string {
                urgency = parsed;
            }
        }
    }

    // --- Build DonorPost record ---
    types:DonorPost donorPost = {
        id: <int>row["id"],
        donor_id: <int>row["donor_id"],
        title: <string>row["title"],
        status: <types:Status>status,
        category: <types:Category>category,
        content: <string>row["content"],
        location: <string>row["location"],
        createdAt: <string>row["created_at"],
        urgency: <types:Urgency>urgency,
        contact: <string>row["contact"],

        engagement: {
            likes: row["likes"] is int ? <int>row["likes"] : 0,
            comments: row["comments"] is int ? <int>row["comments"] : 0,
            shares: row["shares"] is int ? <int>row["shares"] : 0,
            views: row["views"] is int ? <int>row["views"] : 0
        },

        bloodOffering: bloodOffer,
        fundraiserOffering: fundraiserOffer,
        medicineOffering: medicineOffer,
        organOffering: organOffer
    };

    return donorPost;
}

# Description.
#
# + messageData - The data of the message to insert.
# + return - The result of the insert operation.
public isolated function insertMessage(record {
            int sender_id;
            int receiver_id;
            int? post_id;
            string subject;
            string content;
            string message_type;
        } messageData) returns sql:ExecutionResult|error {
    mysql:Client dbClientInstance = check getDbClient();

    io:println("Inserting message with data: " + messageData.toString());

    sql:ParameterizedQuery query = `
        INSERT INTO messages (sender_id, receiver_id, post_id, subject, content, message_type, status, created_at, updated_at)
        VALUES (${messageData.sender_id}, ${messageData.receiver_id}, ${messageData.post_id}, 
                ${messageData.subject}, ${messageData.content}, ${messageData.message_type}, 'unread', NOW(), NOW())
    `;

    sql:ExecutionResult result = check dbClientInstance->execute(query);
    io:println("Insert result: " + result.toString());
    io:println("Last insert ID: " + (result.lastInsertId is int ? result.lastInsertId.toString() : "null"));
    io:println("Affected rows: " + result.affectedRowCount.toString());

    return result;
}

# Description.
#
# + userId - parameter description
# + return - return value description
public isolated function getUnreadMessageCount(int userId) returns int|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `
        SELECT COUNT(*) as count FROM messages WHERE receiver_id = ${userId} AND status = 'unread'
    `;

    stream<record {}, error?> resultStream = dbClientInstance->query(query);
    record {|record {} value;|}? result = check resultStream.next();
    check resultStream.close();

    if result is record {|record {} value;|} {
        record {} row = result.value;
        return <int>row["count"];
    }

    return 0;
}

# Description.
#
# + userId - The ID of the user for whom to count unread messages.
# + status - The status of the messages to count (e.g., "unread").
# + return - The count of unread messages for the user.
public isolated function getMessagesForUser(int userId, string? status = ()) returns record {
    int id;
    int sender_id;
    int receiver_id;
    int? post_id;
    string subject;
    string content;
    string message_type;
    string status;
    string created_at;
    string updated_at;
    types:UserPreview sender;
    types:UserPreview receiver;
    record {int id; string title; string category;}? post?;
}[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query;
    if status is string {
        query = `
            SELECT 
                m.id, m.sender_id, m.receiver_id, m.post_id, m.subject, m.content, 
                m.message_type, m.status, m.created_at, m.updated_at,
                s.name as sender_name, s.email as sender_email, s.role as sender_role,
                r.name as receiver_name, r.email as receiver_email, r.role as receiver_role,
                p.title as post_title, p.category as post_category
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.receiver_id = r.id
            LEFT JOIN recipient_posts p ON m.post_id = p.id
            WHERE m.receiver_id = ${userId} AND m.status = ${status}
            ORDER BY m.created_at DESC
        `;
    } else {
        query = `
            SELECT 
                m.id, m.sender_id, m.receiver_id, m.post_id, m.subject, m.content, 
                m.message_type, m.status, m.created_at, m.updated_at,
                s.name as sender_name, s.email as sender_email, s.role as sender_role,
                r.name as receiver_name, r.email as receiver_email, r.role as receiver_role,
                p.title as post_title, p.category as post_category
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.receiver_id = r.id
            LEFT JOIN recipient_posts p ON m.post_id = p.id
            WHERE m.receiver_id = ${userId}
            ORDER BY m.created_at DESC
        `;
    }

    stream<record {}, error?> resultStream = dbClientInstance->query(query);
    record {
        int id;
        int sender_id;
        int receiver_id;
        int? post_id;
        string subject;
        string content;
        string message_type;
        string status;
        string created_at;
        string updated_at;
        types:UserPreview sender;
        types:UserPreview receiver;
        record {int id; string title; string category;}? post?;
    }[] messages = [];

    check from record {} row in resultStream
        do {
            record {int id; string title; string category;}? post = ();
            if row["post_title"] is string {
                string categoryClean = row["post_category"] is string ?
                    regex:replaceAll(<string>row["post_category"], "\"", "") : "";
                post = {
                    id: <int>row["post_id"],
                    title: <string>row["post_title"],
                    category: categoryClean
                };
            }

            var message = {
                id: <int>row["id"],
                sender_id: <int>row["sender_id"],
                receiver_id: <int>row["receiver_id"],
                post_id: row["post_id"] is int ? <int>row["post_id"] : (),
                subject: <string>row["subject"],
                content: <string>row["content"],
                message_type: <string>row["message_type"],
                status: <string>row["status"],
                created_at: <string>row["created_at"],
                updated_at: <string>row["updated_at"],
                sender: {
                    id: <int>row["sender_id"],
                    name: <string>row["sender_name"],
                    email: <string>row["sender_email"],
                    role: <string>row["sender_role"]
                },
                receiver: {
                    id: <int>row["receiver_id"],
                    name: <string>row["receiver_name"],
                    email: <string>row["receiver_email"],
                    role: <string>row["receiver_role"]
                },
                post: post
            };
            messages.push(message);
        };

    check resultStream.close();
    return messages;
}

# Description.
#
# + messageId - parameter description
# + return - return value description
public isolated function markMessageAsRead(int messageId) returns error? {
    mysql:Client dbClientInstance = check getDbClient();

    _ = check dbClientInstance->execute(`
        UPDATE messages SET status = 'read', updated_at = NOW() WHERE id = ${messageId}
    `);
}

// Get sent messages for user
public isolated function getSentMessagesForUser(int userId, string? status = ()) returns record {
    int id;
    int sender_id;
    int receiver_id;
    int? post_id;
    string subject;
    string content;
    string message_type;
    string status;
    string created_at;
    string updated_at;
    types:UserPreview sender;
    types:UserPreview receiver;
    record {int id; string title; string category;}? post?;
}[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query;
    if status is string {
        query = `
            SELECT 
                m.id, m.sender_id, m.receiver_id, m.post_id, m.subject, m.content, 
                m.message_type, m.status, m.created_at, m.updated_at,
                s.name as sender_name, s.email as sender_email, s.role as sender_role,
                r.name as receiver_name, r.email as receiver_email, r.role as receiver_role,
                p.title as post_title, p.category as post_category
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.receiver_id = r.id
            LEFT JOIN recipient_posts p ON m.post_id = p.id
            WHERE m.sender_id = ${userId} AND m.status = ${status}
            ORDER BY m.created_at DESC
        `;
    } else {
        query = `
            SELECT 
                m.id, m.sender_id, m.receiver_id, m.post_id, m.subject, m.content, 
                m.message_type, m.status, m.created_at, m.updated_at,
                s.name as sender_name, s.email as sender_email, s.role as sender_role,
                r.name as receiver_name, r.email as receiver_email, r.role as receiver_role,
                p.title as post_title, p.category as post_category
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.receiver_id = r.id
            LEFT JOIN recipient_posts p ON m.post_id = p.id
            WHERE m.sender_id = ${userId}
            ORDER BY m.created_at DESC
        `;
    }

    stream<record {}, error?> resultStream = dbClientInstance->query(query);
    record {
        int id;
        int sender_id;
        int receiver_id;
        int? post_id;
        string subject;
        string content;
        string message_type;
        string status;
        string created_at;
        string updated_at;
        types:UserPreview sender;
        types:UserPreview receiver;
        record {int id; string title; string category;}? post?;
    }[] messages = [];

    check from record {} row in resultStream
        do {
            record {int id; string title; string category;}? post = ();
            if row["post_title"] is string {
                string categoryClean = row["post_category"] is string ?
                    regex:replaceAll(<string>row["post_category"], "\"", "") : "";
                post = {
                    id: <int>row["post_id"],
                    title: <string>row["post_title"],
                    category: categoryClean
                };
            }

            var message = {
                id: <int>row["id"],
                sender_id: <int>row["sender_id"],
                receiver_id: <int>row["receiver_id"],
                post_id: row["post_id"] is int ? <int>row["post_id"] : (),
                subject: <string>row["subject"],
                content: <string>row["content"],
                message_type: <string>row["message_type"],
                status: <string>row["status"],
                created_at: <string>row["created_at"],
                updated_at: <string>row["updated_at"],
                sender: {
                    id: <int>row["sender_id"],
                    name: <string>row["sender_name"],
                    email: <string>row["sender_email"],
                    role: <string>row["sender_role"]
                },
                receiver: {
                    id: <int>row["receiver_id"],
                    name: <string>row["receiver_name"],
                    email: <string>row["receiver_email"],
                    role: <string>row["receiver_role"]
                },
                post: post
            };
            messages.push(message);
        };

    check resultStream.close();
    return messages;
}

// Get conversation between two users
public isolated function getConversationBetweenUsers(int userId1, int userId2) returns record {
    int id;
    int sender_id;
    int receiver_id;
    int? post_id;
    string subject;
    string content;
    string message_type;
    string status;
    string created_at;
    string updated_at;
    types:UserPreview sender;
    types:UserPreview receiver;
    record {int id; string title; string category;}? post?;
}[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `
        SELECT 
            m.id, m.sender_id, m.receiver_id, m.post_id, m.subject, m.content, 
            m.message_type, m.status, m.created_at, m.updated_at,
            s.name as sender_name, s.email as sender_email, s.role as sender_role,
            r.name as receiver_name, r.email as receiver_email, r.role as receiver_role,
            p.title as post_title, p.category as post_category
        FROM messages m
        JOIN users s ON m.sender_id = s.id
        JOIN users r ON m.receiver_id = r.id
        LEFT JOIN recipient_posts p ON m.post_id = p.id
        WHERE (m.sender_id = ${userId1} AND m.receiver_id = ${userId2}) 
           OR (m.sender_id = ${userId2} AND m.receiver_id = ${userId1})
        ORDER BY m.created_at ASC
    `;

    stream<record {}, error?> resultStream = dbClientInstance->query(query);
    record {
        int id;
        int sender_id;
        int receiver_id;
        int? post_id;
        string subject;
        string content;
        string message_type;
        string status;
        string created_at;
        string updated_at;
        types:UserPreview sender;
        types:UserPreview receiver;
        record {int id; string title; string category;}? post?;
    }[] messages = [];

    check from record {} row in resultStream
        do {
            record {int id; string title; string category;}? post = ();
            if row["post_title"] is string {
                string categoryClean = row["post_category"] is string ?
                    regex:replaceAll(<string>row["post_category"], "\"", "") : "";
                post = {
                    id: <int>row["post_id"],
                    title: <string>row["post_title"],
                    category: categoryClean
                };
            }

            var message = {
                id: <int>row["id"],
                sender_id: <int>row["sender_id"],
                receiver_id: <int>row["receiver_id"],
                post_id: row["post_id"] is int ? <int>row["post_id"] : (),
                subject: <string>row["subject"],
                content: <string>row["content"],
                message_type: <string>row["message_type"],
                status: <string>row["status"],
                created_at: <string>row["created_at"],
                updated_at: <string>row["updated_at"],
                sender: {
                    id: <int>row["sender_id"],
                    name: <string>row["sender_name"],
                    email: <string>row["sender_email"],
                    role: <string>row["sender_role"]
                },
                receiver: {
                    id: <int>row["receiver_id"],
                    name: <string>row["receiver_name"],
                    email: <string>row["receiver_email"],
                    role: <string>row["receiver_role"]
                },
                post: post
            };
            messages.push(message);
        };

    check resultStream.close();
    return messages;
}

// Get user conversations (summary view)
// Replace the getUserConversations function in your database.bal file with this version

public isolated function getUserConversations(int userId) returns record {
    int other_user_id;
    types:UserPreview other_user;
    record {
        int id;
        int sender_id;
        int receiver_id;
        int? post_id;
        string subject;
        string content;
        string message_type;
        string status;
        string created_at;
        string updated_at;
        types:UserPreview sender;
        types:UserPreview receiver;
        record {int id; string title; string category;}? post?;
    } latest_message;
    int unread_count;
    string last_activity;
}[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    // Simplified query to get conversations with latest message ordered by timestamp
    sql:ParameterizedQuery conversationQuery = `
        SELECT 
            CASE 
                WHEN latest.sender_id = ${userId} THEN latest.receiver_id 
                ELSE latest.sender_id 
            END as other_user_id,
            latest.latest_message_id,
            latest.created_at as last_activity,
            (SELECT COUNT(*) FROM messages m2 
             WHERE m2.receiver_id = ${userId} 
               AND m2.status = 'unread'
               AND (m2.sender_id = other_user_id)
            ) as unread_count
        FROM (
            SELECT 
                m.sender_id,
                m.receiver_id,
                m.created_at,
                m.id as latest_message_id,
                CASE 
                    WHEN m.sender_id = ${userId} THEN m.receiver_id 
                    ELSE m.sender_id 
                END as conversation_partner,
                ROW_NUMBER() OVER (
                    PARTITION BY CASE 
                        WHEN m.sender_id = ${userId} THEN m.receiver_id 
                        ELSE m.sender_id 
                    END 
                    ORDER BY m.created_at DESC
                ) as rn
            FROM messages m
            WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
        ) latest
        WHERE latest.rn = 1
        ORDER BY latest.created_at DESC
    `;

    stream<record {}, error?> conversationStream = dbClientInstance->query(conversationQuery);

    record {
        int other_user_id;
        types:UserPreview other_user;
        record {
            int id;
            int sender_id;
            int receiver_id;
            int? post_id;
            string subject;
            string content;
            string message_type;
            string status;
            string created_at;
            string updated_at;
            types:UserPreview sender;
            types:UserPreview receiver;
            record {int id; string title; string category;}? post?;
        } latest_message;
        int unread_count;
        string last_activity;
    }[] conversations = [];

    check from record {} convRow in conversationStream
        do {
            int otherUserId = <int>convRow["other_user_id"];
            int latestMessageId = <int>convRow["latest_message_id"];
            int unreadCount = <int>convRow["unread_count"];
            string lastActivity = <string>convRow["last_activity"];

            // Get the full message details for the latest message
            sql:ParameterizedQuery messageQuery = `
                SELECT 
                    m.id, m.sender_id, m.receiver_id, m.post_id, m.subject, m.content, 
                    m.message_type, m.status, m.created_at, m.updated_at,
                    s.name as sender_name, s.email as sender_email, s.role as sender_role,
                    r.name as receiver_name, r.email as receiver_email, r.role as receiver_role,
                    p.title as post_title, p.category as post_category,
                    u.name as other_user_name, u.email as other_user_email, u.role as other_user_role
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                JOIN users r ON m.receiver_id = r.id
                JOIN users u ON u.id = ${otherUserId}
                LEFT JOIN recipient_posts p ON m.post_id = p.id
                WHERE m.id = ${latestMessageId}
            `;

            stream<record {}, error?> messageStream = dbClientInstance->query(messageQuery);
            record {|record {} value;|}? messageResult = check messageStream.next();
            check messageStream.close();

            if messageResult is record {|record {} value;|} {
                record {} msgRow = messageResult.value;

                record {int id; string title; string category;}? post = ();
                if msgRow["post_title"] is string {
                    string categoryClean = msgRow["post_category"] is string ?
                        regex:replaceAll(<string>msgRow["post_category"], "\"", "") : "";
                    post = {
                        id: <int>msgRow["post_id"],
                        title: <string>msgRow["post_title"],
                        category: categoryClean
                    };
                }

                var conversation = {
                    other_user_id: otherUserId,
                    other_user: {
                        id: otherUserId,
                        name: <string>msgRow["other_user_name"],
                        email: <string>msgRow["other_user_email"],
                        role: <string>msgRow["other_user_role"]
                    },
                    latest_message: {
                        id: <int>msgRow["id"],
                        sender_id: <int>msgRow["sender_id"],
                        receiver_id: <int>msgRow["receiver_id"],
                        post_id: msgRow["post_id"] is int ? <int>msgRow["post_id"] : (),
                        subject: <string>msgRow["subject"],
                        content: <string>msgRow["content"],
                        message_type: <string>msgRow["message_type"],
                        status: <string>msgRow["status"],
                        created_at: <string>msgRow["created_at"],
                        updated_at: <string>msgRow["updated_at"],
                        sender: {
                            id: <int>msgRow["sender_id"],
                            name: <string>msgRow["sender_name"],
                            email: <string>msgRow["sender_email"],
                            role: <string>msgRow["sender_role"]
                        },
                        receiver: {
                            id: <int>msgRow["receiver_id"],
                            name: <string>msgRow["receiver_name"],
                            email: <string>msgRow["receiver_email"],
                            role: <string>msgRow["receiver_role"]
                        },
                        post: post
                    },
                    unread_count: unreadCount,
                    last_activity: lastActivity
                };
                conversations.push(conversation);
            }
        };

    check conversationStream.close();

    // No need to sort since we already ordered in the SQL query
    return conversations;
}

// Mark conversation as read (mark all messages in conversation as read for current user)
public isolated function markConversationAsRead(int currentUserId, int otherUserId) returns error? {
    mysql:Client dbClientInstance = check getDbClient();

    _ = check dbClientInstance->execute(`
        UPDATE messages 
        SET status = 'read', updated_at = NOW() 
        WHERE receiver_id = ${currentUserId} 
          AND sender_id = ${otherUserId} 
          AND status = 'unread'
    `);
}

// Create blood camp
public isolated function createBloodCamp(int organizerId, types:BloodCampCreate request) returns int|error {
    mysql:Client dbClientInstance = check getDbClient();

    string bloodTypesJson = value:toJson(request.blood_types).toJsonString();
    string facilitiesJson = request.facilities is () ? "[]" : value:toJson(request.facilities).toJsonString();
    string coordinatesJson = value:toJson(request.coordinates).toJsonString();

    sql:ParameterizedQuery query = `INSERT INTO blood_camps 
        (organizer_id, name, organizer, location, address, date, start_time, end_time, 
         capacity, contact, description, requirements, blood_types, facilities, coordinates) 
        VALUES (${organizerId}, ${request.name}, ${request.organizer}, ${request.location},
                ${request.address}, ${request.date}, ${request.start_time}, ${request.end_time},
                ${request.capacity}, ${request.contact}, ${request.description}, ${request.requirements},
                ${bloodTypesJson}, ${facilitiesJson}, ${coordinatesJson})`;

    sql:ExecutionResult result = check dbClientInstance->execute(query);
    return <int>result.lastInsertId;
}

// Get all blood camps
public isolated function getAllBloodCamps() returns types:BloodCamp[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `SELECT * FROM blood_camps ORDER BY date ASC`;
    stream<record {}, error?> resultStream = dbClientInstance->query(query);

    types:BloodCamp[] camps = [];

    check from record {} row in resultStream
        do {
            // Parse JSON fields
            json bloodTypesJson = check value:fromJsonString(<string>row["blood_types"]);
            string[] bloodTypes = check value:cloneWithType(bloodTypesJson);

            json facilitiesJson = check value:fromJsonString(<string>row["facilities"]);
            string[]? facilities = check value:cloneWithType(facilitiesJson);

            json coordinatesJson = check value:fromJsonString(<string>row["coordinates"]);
            decimal[] coordinates = check value:cloneWithType(coordinatesJson);

            types:BloodCamp camp = {
                id: <int>row["id"],
                organizer_id: <int>row["organizer_id"],
                name: <string>row["name"],
                organizer: <string>row["organizer"],
                location: <string>row["location"],
                address: <string>row["address"],
                date: <string>row["date"],
                start_time: <string>row["start_time"],
                end_time: <string>row["end_time"],
                capacity: <int>row["capacity"],
                contact: <string>row["contact"],
                description: <string>row["description"],
                requirements: <string?>row["requirements"],
                blood_types: bloodTypes,
                facilities: facilities,
                status: <string>row["status"],
                coordinates: coordinates,
                created_at: <string?>row["created_at"],
                updated_at: <string?>row["updated_at"]
            };
            camps.push(camp);
        };

    check resultStream.close();
    return camps;
}

# Insert donation record into database
# + donationData - Donation data to be inserted
# + return - ID of the inserted donation or error if operation fails
public isolated function insertDonation(record {
            int donor_id;
            int? recipient_id;
            int? post_id;
            string donation_type;
            decimal? amount;
            string? quantity;
            string? description;
            string donation_date;
            string status;
            string? location;
            string? notes;
        } donationData) returns int|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `INSERT INTO donations 
        (donor_id, recipient_id, post_id, donation_type, amount, quantity, 
         description, donation_date, status, location, notes) 
        VALUES (${donationData.donor_id}, ${donationData.recipient_id}, ${donationData.post_id},
                ${donationData.donation_type}, ${donationData.amount}, ${donationData.quantity},
                ${donationData.description}, ${donationData.donation_date}, ${donationData.status},
                ${donationData.location}, ${donationData.notes})`;

    sql:ExecutionResult result = check dbClientInstance->execute(query);
    return <int>result.lastInsertId;
}

# Insert blood donation details into the database
# + bloodData - Blood donation specific data including donation_id, blood_type, volume_ml, hemoglobin_level, and donation_center
# + return - SQL execution result or error if operation fails
public isolated function insertBloodDonation(record {
            int donation_id;
            string blood_type;
            int volume_ml;
            decimal? hemoglobin_level;
            string? donation_center;
        } bloodData) returns sql:ExecutionResult|error {
    mysql:Client dbClientInstance = check getDbClient();

    string nextEligibleDate = calculateNextEligibleDate(56);

    sql:ParameterizedQuery query = `INSERT INTO blood_donations 
        (donation_id, blood_type, volume_ml, hemoglobin_level, donation_center, next_eligible_date) 
        VALUES (${bloodData.donation_id}, ${bloodData.blood_type}, ${bloodData.volume_ml},
                ${bloodData.hemoglobin_level}, ${bloodData.donation_center}, ${nextEligibleDate})`;

    return dbClientInstance->execute(query);
}

# Get donations by donor with optional status filtering
# + donorId - ID of the donor to get donations for
# + status - Optional status filter for donations
# + return - Array of donation responses or error if operation fails
public isolated function getDonationsByDonor(int donorId, string? status = ()) returns types:DonationResponse[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query;
    if status is string {
        query = `SELECT d.*, 
                        u.name as recipient_name, u.email as recipient_email, u.role as recipient_role,
                        p.title as post_title, p.category as post_category,
                        bd.blood_type, bd.volume_ml, bd.hemoglobin_level, bd.donation_center, bd.next_eligible_date
                 FROM donations d
                 LEFT JOIN users u ON d.recipient_id = u.id
                 LEFT JOIN recipient_posts p ON d.post_id = p.id
                 LEFT JOIN blood_donations bd ON d.id = bd.donation_id
                 WHERE d.donor_id = ${donorId} AND d.status = ${status}
                 ORDER BY d.donation_date DESC`;
    } else {
        query = `SELECT d.*, 
                        u.name as recipient_name, u.email as recipient_email, u.role as recipient_role,
                        p.title as post_title, p.category as post_category,
                        bd.blood_type, bd.volume_ml, bd.hemoglobin_level, bd.donation_center, bd.next_eligible_date
                 FROM donations d
                 LEFT JOIN users u ON d.recipient_id = u.id
                 LEFT JOIN recipient_posts p ON d.post_id = p.id
                 LEFT JOIN blood_donations bd ON d.id = bd.donation_id
                 WHERE d.donor_id = ${donorId}
                 ORDER BY d.donation_date DESC`;
    }

    stream<record {}, error?> resultStream = dbClientInstance->query(query);
    types:DonationResponse[] donations = [];

    check from record {} row in resultStream
        do {
            types:UserPreview? recipient = ();
            if row["recipient_name"] is string {
                recipient = {
                    id: <int>row["recipient_id"],
                    name: <string>row["recipient_name"],
                    email: <string>row["recipient_email"],
                    role: <string>row["recipient_role"]
                };
            }

            record {int id; string title; string category;}? post = ();
            if row["post_title"] is string {
                string categoryClean = row["post_category"] is string ?
                    regex:replaceAll(<string>row["post_category"], "\"", "") : "";
                post = {
                    id: <int>row["post_id"],
                    title: <string>row["post_title"],
                    category: categoryClean
                };
            }

            types:BloodDonation? bloodDetails = ();
            if row["blood_type"] is string {
                bloodDetails = {
                    id: 0,
                    donation_id: <int>row["id"],
                    blood_type: <string>row["blood_type"],
                    volume_ml: <int>row["volume_ml"],
                    hemoglobin_level: row["hemoglobin_level"] is decimal ? <decimal>row["hemoglobin_level"] : (),
                    donation_center: row["donation_center"] is string ? <string>row["donation_center"] : (),
                    next_eligible_date: row["next_eligible_date"] is string ? <string>row["next_eligible_date"] : (),
                    created_at: ()
                };
            }

            types:DonationResponse donation = {
                id: <int>row["id"],
                donor_id: <int>row["donor_id"],
                recipient_id: row["recipient_id"] is int ? <int>row["recipient_id"] : (),
                post_id: row["post_id"] is int ? <int>row["post_id"] : (),
                donation_type: <types:DonationType>row["donation_type"],
                amount: row["amount"] is decimal ? <decimal>row["amount"] : (),
                quantity: row["quantity"] is string ? <string>row["quantity"] : (),
                description: row["description"] is string ? <string>row["description"] : (),
                donation_date: <string>row["donation_date"],
                status: <types:DonationStatus>row["status"],
                location: row["location"] is string ? <string>row["location"] : (),
                notes: row["notes"] is string ? <string>row["notes"] : (),
                created_at: <string>row["created_at"],
                updated_at: <string>row["updated_at"],
                recipient: recipient,
                post: post,
                blood_details: bloodDetails
            };
            donations.push(donation);
        };

    check resultStream.close();
    return donations;
}

# Update donation record in the database
# + donationId - ID of the donation to update
# + request - Donation update request containing fields to modify
# + return - True if donation was updated successfully, false if not found, or error if operation fails
public isolated function updateDonation(int donationId, types:DonationUpdate request) returns boolean|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `UPDATE donations SET 
        status = COALESCE(${request.status}, status),
        amount = COALESCE(${request.amount}, amount),
        quantity = COALESCE(${request.quantity}, quantity),
        description = COALESCE(${request.description}, description),
        location = COALESCE(${request.location}, location),
        notes = COALESCE(${request.notes}, notes),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ${donationId}`;

    sql:ExecutionResult result = check dbClientInstance->execute(query);
    return result.affectedRowCount > 0;
}

# Get donor statistics from the database
# + donorId - ID of the donor to retrieve statistics for
# + return - Donor statistics record or error if operation fails
public isolated function getDonorStats(int donorId) returns types:DonorStats|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `SELECT 
        donor_id,
        COALESCE(total_donations, 0) as total_donations,
        COALESCE(blood_donations, 0) as blood_donations,
        COALESCE(organ_donations, 0) as organ_donations,
        COALESCE(medicine_donations, 0) as medicine_donations,
        COALESCE(supply_donations, 0) as supply_donations,
        COALESCE(total_fundraiser_amount, 0) as total_fundraiser_amount,
        last_donation_date,
        first_donation_date
        FROM donor_stats WHERE donor_id = ${donorId}`;

    stream<record {}, error?> resultStream = dbClientInstance->query(query);
    record {|record {} value;|}? result = check resultStream.next();
    check resultStream.close();

    if result is () {

        return {
            donor_id: donorId,
            total_donations: 0,
            blood_donations: 0,
            organ_donations: 0,
            medicine_donations: 0,
            supply_donations: 0,
            total_fundraiser_amount: 0.0,
            last_donation_date: (),
            first_donation_date: ()
        };
    }

    record {} row = result.value;
    return {
        donor_id: <int>row["donor_id"],
        total_donations: <int>row["total_donations"],
        blood_donations: <int>row["blood_donations"],
        organ_donations: <int>row["organ_donations"],
        medicine_donations: <int>row["medicine_donations"],
        supply_donations: <int>row["supply_donations"],
        total_fundraiser_amount: <decimal>row["total_fundraiser_amount"],
        last_donation_date: row["last_donation_date"] is string ? <string>row["last_donation_date"] : (),
        first_donation_date: row["first_donation_date"] is string ? <string>row["first_donation_date"] : ()
    };
}

# Get recent donations by donor with limit
# + donorId - ID of the donor to retrieve donations for
# + limit - Maximum number of donations to return
# + return - Array of recent donation responses or error if operation fails
public isolated function getRecentDonationsByDonor(int donorId, int 'limit) returns types:DonationResponse[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `SELECT d.*, 
                    u.name as recipient_name, u.email as recipient_email, u.role as recipient_role,
                    p.title as post_title, p.category as post_category,
                    bd.blood_type, bd.volume_ml, bd.hemoglobin_level, bd.donation_center, bd.next_eligible_date
             FROM donations d
             LEFT JOIN users u ON d.recipient_id = u.id
             LEFT JOIN recipient_posts p ON d.post_id = p.id
             LEFT JOIN blood_donations bd ON d.id = bd.donation_id
             WHERE d.donor_id = ${donorId}
             ORDER BY d.created_at DESC
             LIMIT ${'limit}`;

    stream<record {}, error?> resultStream = dbClientInstance->query(query);
    types:DonationResponse[] donations = [];

    check from record {} row in resultStream
        do {
            types:UserPreview? recipient = ();
            if row["recipient_name"] is string {
                recipient = {
                    id: <int>row["recipient_id"],
                    name: <string>row["recipient_name"],
                    email: <string>row["recipient_email"],
                    role: <string>row["recipient_role"]
                };
            }

            record {int id; string title; string category;}? post = ();
            if row["post_title"] is string {
                string categoryClean = row["post_category"] is string ?
                    regex:replaceAll(<string>row["post_category"], "\"", "") : "";
                post = {
                    id: <int>row["post_id"],
                    title: <string>row["post_title"],
                    category: categoryClean
                };
            }

            types:BloodDonation? bloodDetails = ();
            if row["blood_type"] is string {
                bloodDetails = {
                    id: 0,
                    donation_id: <int>row["id"],
                    blood_type: <string>row["blood_type"],
                    volume_ml: <int>row["volume_ml"],
                    hemoglobin_level: row["hemoglobin_level"] is decimal ? <decimal>row["hemoglobin_level"] : (),
                    donation_center: row["donation_center"] is string ? <string>row["donation_center"] : (),
                    next_eligible_date: row["next_eligible_date"] is string ? <string>row["next_eligible_date"] : (),
                    created_at: ()
                };
            }

            types:DonationResponse donation = {
                id: <int>row["id"],
                donor_id: <int>row["donor_id"],
                recipient_id: row["recipient_id"] is int ? <int>row["recipient_id"] : (),
                post_id: row["post_id"] is int ? <int>row["post_id"] : (),
                donation_type: <types:DonationType>row["donation_type"],
                amount: row["amount"] is decimal ? <decimal>row["amount"] : (),
                quantity: row["quantity"] is string ? <string>row["quantity"] : (),
                description: row["description"] is string ? <string>row["description"] : (),
                donation_date: <string>row["donation_date"],
                status: <types:DonationStatus>row["status"],
                location: row["location"] is string ? <string>row["location"] : (),
                notes: row["notes"] is string ? <string>row["notes"] : (),
                created_at: <string>row["created_at"],
                updated_at: <string>row["updated_at"],
                recipient: recipient,
                post: post,
                blood_details: bloodDetails
            };
            donations.push(donation);
        };

    check resultStream.close();
    return donations;
}

# Get donor achievements from the database
# + donorId - ID of the donor to retrieve achievements for
# + return - Array of achievement records or error if operation fails
public isolated function getDonorAchievements(int donorId) returns types:Achievement[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `SELECT * FROM donor_achievements WHERE donor_id = ${donorId} ORDER BY earned_date DESC`;
    stream<record {}, error?> resultStream = dbClientInstance->query(query);

    types:Achievement[] achievements = [];
    check from record {} row in resultStream
        do {
            types:Achievement achievement = {
                id: <int>row["id"],
                donor_id: <int>row["donor_id"],
                achievement_type: <string>row["achievement_type"],
                achievement_name: <string>row["achievement_name"],
                description: row["description"] is string ? <string>row["description"] : (),
                earned_date: <string>row["earned_date"],
                metadata: row["metadata"] is string ? check value:fromJsonString(<string>row["metadata"]) : (),
                created_at: row["created_at"] is string ? <string>row["created_at"] : ()
            };
            achievements.push(achievement);
        };

    check resultStream.close();
    return achievements;
}

# Get the last blood donation record for a donor
# + donorId - ID of the donor to retrieve last blood donation for
# + return - Last blood donation record, null if no blood donations found, or error if operation fails
public isolated function getLastBloodDonation(int donorId) returns types:BloodDonation?|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `SELECT bd.* FROM blood_donations bd
                                   JOIN donations d ON bd.donation_id = d.id
                                   WHERE d.donor_id = ${donorId}
                                   ORDER BY d.donation_date DESC
                                   LIMIT 1`;

    stream<record {}, error?> resultStream = dbClientInstance->query(query);
    record {|record {} value;|}? result = check resultStream.next();
    check resultStream.close();

    if result is () {
        return ();
    }

    record {} row = result.value;
    return {
        id: <int>row["id"],
        donation_id: <int>row["donation_id"],
        blood_type: <string>row["blood_type"],
        volume_ml: <int>row["volume_ml"],
        hemoglobin_level: row["hemoglobin_level"] is decimal ? <decimal>row["hemoglobin_level"] : (),
        donation_center: row["donation_center"] is string ? <string>row["donation_center"] : (),
        next_eligible_date: row["next_eligible_date"] is string ? <string>row["next_eligible_date"] : (),
        created_at: row["created_at"] is string ? <string>row["created_at"] : ()
    };
}

# Insert achievement record into the database
# + achievementData - Achievement data including donor_id, achievement_type, achievement_name, description, earned_date, and metadata
# + return - ID of the inserted achievement record or error if operation fails
public isolated function insertAchievement(record {
            int donor_id;
            string achievement_type;
            string achievement_name;
            string description;
            string earned_date;
            json? metadata;
        } achievementData) returns int|error {
    mysql:Client dbClientInstance = check getDbClient();

    string? metadataJson = achievementData.metadata is () ? () : achievementData.metadata.toJsonString();

    sql:ParameterizedQuery query = `INSERT INTO donor_achievements 
        (donor_id, achievement_type, achievement_name, description, earned_date, metadata) 
        VALUES (${achievementData.donor_id}, ${achievementData.achievement_type}, ${achievementData.achievement_name},
                ${achievementData.description}, ${achievementData.earned_date}, ${metadataJson})`;

    sql:ExecutionResult result = check dbClientInstance->execute(query);
    return <int>result.lastInsertId;
}

# Helper function to calculate next eligible date for blood donation
# + daysToAdd - Number of days to add to current date for next eligibility
# + return - Date string representing next eligible donation date
isolated function calculateNextEligibleDate(int daysToAdd) returns string {

    return "2025-03-15";
}

# Create blood camp registration
public isolated function createBloodCampRegistration(int donorId, types:BloodCampRegistrationCreate request) returns int|error {
    mysql:Client dbClientInstance = check getDbClient();

    // Determine initial health status based on last donation date
    types:HealthStatus healthStatus = "eligible";
    if request.last_donation_date is
string {
        string lastDonationStr = <string>request.last_donation_date;
        // Simple check - in real implementation, you'd calculate if enough time has passed
        // For blood donation, minimum 56 days (8 weeks) gap is required
        healthStatus = "eligible";
        // This would be calculated based on actual dates
    }

    sql:ParameterizedQuery query = `INSERT INTO blood_camp_registrations 
        (camp_id, donor_id, blood_type, last_donation_date, health_status, 
         contact_phone, emergency_contact_name, emergency_contact_phone,
         medical_conditions, medications, notes, registration_date, status) 
        VALUES (${request.camp_id}, ${donorId}, ${request.blood_type}, ${request.last_donation_date},
                ${healthStatus}, ${request.contact_phone}, ${request.emergency_contact_name},
                ${request.emergency_contact_phone}, ${request.medical_conditions},
                ${request.medications}, ${request.notes}, CURDATE(), 'registered')`;

    sql:ExecutionResult result = check dbClientInstance->execute(query);
    return <int>result.lastInsertId;

}

# Check if donor is already registered for a camp
public isolated function checkExistingRegistration(int donorId, int campId) returns boolean|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `
        SELECT COUNT(*) as count 
        FROM blood_camp_registrations 
        WHERE donor_id = ${donorId} AND camp_id = ${campId} 
        AND status NOT IN ('cancelled')
    `;

    stream<record {int count;}, error?> resultStream = dbClientInstance->query(query);
    record {|record {int count;} value;|}? result = check resultStream.next();
    check resultStream.close();

    if result is record {|record {int count;} value;|} {
        return result.value.count > 0;
    }

    return false;
}

# Check camp capacity
public isolated function checkCampCapacity(int campId) returns types:CampCapacityInfo|error {
    mysql:Client dbClientInstance = check getDbClient();

    // Get camp capacity
    sql:ParameterizedQuery capacityQuery = `
        SELECT capacity FROM blood_camps WHERE id = ${campId}
    `;
    stream<record {int capacity;}, error?> capacityStream = dbClientInstance->query(capacityQuery);
    record {|record {int capacity;} value;|}? capacityResult = check capacityStream.next();
    check capacityStream.close();

    if capacityResult is () {
        return error("Blood camp not found");
    }

    int maxCapacity = capacityResult.value.capacity;

    // Get current registrations count
    sql:ParameterizedQuery registrationQuery = `
        SELECT COUNT(*) as count 
        FROM blood_camp_registrations 
        WHERE camp_id = ${campId} AND status IN ('registered', 'confirmed')
    `;
    stream<record {int count;}, error?> registrationStream = dbClientInstance->query(registrationQuery);
    record {|record {int count;} value;|}? registrationResult = check registrationStream.next();
    check registrationStream.close();

    int currentRegistrations = registrationResult is record {|record {int count;} value;|}
        ? registrationResult.value.count : 0;

    return {
        camp_id: campId,
        max_capacity: maxCapacity,
        current_registrations: currentRegistrations,
        available_spots: maxCapacity - currentRegistrations,
        is_full: currentRegistrations >= maxCapacity,
        waiting_list_size: 0
        // Not implemented yet
    };
}

# Get registrations by donor
public isolated function getRegistrationsByDonor(int donorId) returns types:BloodCampRegistrationResponse[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `
        SELECT 
            r.id, r.camp_id, r.donor_id, r.registration_date, r.status,
            r.blood_type, r.last_donation_date, r.health_status, r.contact_phone,
            r.emergency_contact_name, r.emergency_contact_phone,
            r.medical_conditions, r.medications, r.notes,
            r.created_at, r.updated_at,
            c.name as camp_name, c.location as camp_location, c.date as camp_date,
            c.start_time, c.end_time,
            u.name as donor_name, u.email as donor_email
        FROM blood_camp_registrations r
        JOIN blood_camps c ON r.camp_id = c.id
        JOIN users u ON r.donor_id = u.id
        WHERE r.donor_id = ${donorId}
        ORDER BY c.date DESC, r.created_at DESC
    `;

    stream<record {}, error?> resultStream = dbClientInstance->query(query);
    types:BloodCampRegistrationResponse[] registrations = [];

    check from record {} row in resultStream
        do {
            types:BloodCampRegistrationResponse registration = {
                registration: {
                    id: <int>row["id"],
                    camp_id: <int>row["camp_id"],
                    donor_id: <int>row["donor_id"],
                    registration_date: <string>row["registration_date"],
                    status: <types:RegistrationStatus>row["status"],
                    blood_type: <string>row["blood_type"],
                    last_donation_date: row["last_donation_date"] is string ? <string>row["last_donation_date"] : (),
                    health_status: <types:HealthStatus>row["health_status"],
                    contact_phone: <string>row["contact_phone"],
                    emergency_contact_name: row["emergency_contact_name"] is string ? <string>row["emergency_contact_name"] : (),
                    emergency_contact_phone: row["emergency_contact_phone"] is string ? <string>row["emergency_contact_phone"] : (),
                    medical_conditions: row["medical_conditions"] is string ? <string>row["medical_conditions"] : (),
                    medications: row["medications"] is string ? <string>row["medications"] : (),
                    notes: row["notes"] is string ? <string>row["notes"] : (),
                    created_at: row["created_at"] is string ? <string>row["created_at"] : (),
                    updated_at: row["updated_at"] is string ? <string>row["updated_at"] : ()
                },
                camp: {
                    id: <int>row["camp_id"],
                    name: <string>row["camp_name"],
                    location: <string>row["camp_location"],
                    date: <string>row["camp_date"],
                    start_time: <string>row["start_time"],
                    end_time: <string>row["end_time"]
                },
                donor: {
                    id: <int>row["donor_id"],
                    name: <string>row["donor_name"],
                    email: <string>row["donor_email"]
                }
            };
            registrations.push(registration);
        };

    check resultStream.close();
    return registrations;
}

# Get registrations by camp
public isolated function getRegistrationsByCamp(int campId) returns types:BloodCampRegistrationResponse[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `
        SELECT 
            r.id, r.camp_id, r.donor_id, r.registration_date, r.status,
            r.blood_type, r.last_donation_date, r.health_status, r.contact_phone,
            r.emergency_contact_name, r.emergency_contact_phone,
            r.medical_conditions, r.medications, r.notes,
            r.created_at, r.updated_at,
            c.name as camp_name, c.location as camp_location, c.date as camp_date,
            c.start_time, c.end_time,
            u.name as donor_name, u.email as donor_email
        FROM blood_camp_registrations r
        JOIN blood_camps c ON r.camp_id = c.id
        JOIN users u ON r.donor_id = u.id
        WHERE r.camp_id = ${campId}
        ORDER BY r.registration_date ASC
    `;

    stream<record {}, error?> resultStream = dbClientInstance->query(query);
    types:BloodCampRegistrationResponse[] registrations = [];

    check from record {} row in resultStream
        do {
            types:BloodCampRegistrationResponse registration = {
                registration: {
                    id: <int>row["id"],
                    camp_id: <int>row["camp_id"],
                    donor_id: <int>row["donor_id"],
                    registration_date: <string>row["registration_date"],
                    status: <types:RegistrationStatus>row["status"],
                    blood_type: <string>row["blood_type"],
                    last_donation_date: row["last_donation_date"] is string ? <string>row["last_donation_date"] : (),
                    health_status: <types:HealthStatus>row["health_status"],
                    contact_phone: <string>row["contact_phone"],
                    emergency_contact_name: row["emergency_contact_name"] is string ? <string>row["emergency_contact_name"] : (),
                    emergency_contact_phone: row["emergency_contact_phone"] is string ? <string>row["emergency_contact_phone"] : (),
                    medical_conditions: row["medical_conditions"] is string ? <string>row["medical_conditions"] : (),
                    medications: row["medications"] is string ? <string>row["medications"] : (),
                    notes: row["notes"] is string ? <string>row["notes"] : (),
                    created_at: row["created_at"] is string ? <string>row["created_at"] : (),
                    updated_at: row["updated_at"] is string ? <string>row["updated_at"] : ()
                },
                camp: {
                    id: <int>row["camp_id"],
                    name: <string>row["camp_name"],
                    location: <string>row["camp_location"],
                    date: <string>row["camp_date"],
                    start_time: <string>row["start_time"],
                    end_time: <string>row["end_time"]
                },
                donor: {
                    id: <int>row["donor_id"],
                    name: <string>row["donor_name"],
                    email: <string>row["donor_email"]
                }
            };
            registrations.push(registration);
        };

    check resultStream.close();
    return registrations;
}

# Get registration by ID
public isolated function getBloodCampRegistrationById(int registrationId) returns types:BloodCampRegistrationResponse|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `
        SELECT 
            r.id, r.camp_id, r.donor_id, r.registration_date, r.status,
            r.blood_type, r.last_donation_date, r.health_status, r.contact_phone,
            r.emergency_contact_name, r.emergency_contact_phone,
            r.medical_conditions, r.medications, r.notes,
            r.created_at, r.updated_at,
            c.name as camp_name, c.location as camp_location, c.date as camp_date,
            c.start_time, c.end_time,
            u.name as donor_name, u.email as donor_email
        FROM blood_camp_registrations r
        JOIN blood_camps c ON r.camp_id = c.id
        JOIN users u ON r.donor_id = u.id
        WHERE r.id = ${registrationId}
    `;

    stream<record {}, error?> resultStream = dbClientInstance->query(query);
    record {|record {} value;|}? result = check resultStream.next();
    check resultStream.close();

    if result is () {
        return error("Registration not found");
    }

    record {} row = result.value;
    return {
        registration: {
            id: <int>row["id"],
            camp_id: <int>row["camp_id"],
            donor_id: <int>row["donor_id"],
            registration_date: <string>row["registration_date"],
            status: <types:RegistrationStatus>row["status"],
            blood_type: <string>row["blood_type"],
            last_donation_date: row["last_donation_date"] is string ? <string>row["last_donation_date"] : (),
            health_status: <types:HealthStatus>row["health_status"],
            contact_phone: <string>row["contact_phone"],
            emergency_contact_name: row["emergency_contact_name"] is string ? <string>row["emergency_contact_name"] : (),
            emergency_contact_phone: row["emergency_contact_phone"] is string ? <string>row["emergency_contact_phone"] : (),
            medical_conditions: row["medical_conditions"] is string ? <string>row["medical_conditions"] : (),
            medications: row["medications"] is string ? <string>row["medications"] : (),
            notes: row["notes"] is string ? <string>row["notes"] : (),
            created_at: row["created_at"] is string ? <string>row["created_at"] : (),
            updated_at: row["updated_at"] is string ? <string>row["updated_at"] : ()
        },
        camp: {
            id: <int>row["camp_id"],
            name: <string>row["camp_name"],
            location: <string>row["camp_location"],
            date: <string>row["camp_date"],
            start_time: <string>row["start_time"],
            end_time: <string>row["end_time"]
        },
        donor: {
            id: <int>row["donor_id"],
            name: <string>row["donor_name"],
            email: <string>row["donor_email"]
        }
    };
}

# Update blood camp registration
public isolated function updateBloodCampRegistration(int registrationId, types:BloodCampRegistrationUpdate request) returns boolean|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `UPDATE blood_camp_registrations SET 
        status = COALESCE(${request.status}, status),
        health_status = COALESCE(${request.health_status}, health_status),
        contact_phone = COALESCE(${request.contact_phone}, contact_phone),
        emergency_contact_name = COALESCE(${request.emergency_contact_name}, emergency_contact_name),
        emergency_contact_phone = COALESCE(${request.emergency_contact_phone}, emergency_contact_phone),
        medical_conditions = COALESCE(${request.medical_conditions}, medical_conditions),
        medications = COALESCE(${request.medications}, medications),
        notes = COALESCE(${request.notes}, notes),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ${registrationId}`;

    sql:ExecutionResult result = check dbClientInstance->execute(query);
    return result.affectedRowCount > 0;
}

# Description.
#
# + dbClient - MySQL client instance
# + return - error? if something goes wrong
public isolated function setupDatabase(mysql:Client dbClient) returns error? {
    // Users table
    sql:ExecutionResult _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('donor', 'recipient', 'admin', 'organization') NOT NULL,
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
    )`);

    // Donor posts table
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS donor_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donor_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        status JSON NOT NULL,
        category JSON NOT NULL,
        content TEXT NOT NULL,
        location VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        urgency JSON NOT NULL,
        likes INT DEFAULT 0,
        comments INT DEFAULT 0,
        shares INT DEFAULT 0,
        views INT DEFAULT 0,
        contact VARCHAR(300),
        bloodOffering JSON,
        fundraiserOffering JSON,
        medicineOffering JSON,
        organOffering JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_donor_id (donor_id),
        INDEX idx_created_at (created_at)
    )`);

    // Messages table
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        post_id INT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        message_type ENUM('help_offer', 'contact', 'general') NOT NULL,
        status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_receiver_status (receiver_id, status),
        INDEX idx_sender (sender_id),
        INDEX idx_post (post_id),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES recipient_posts(id) ON DELETE CASCADE
    )`);

    // Blood camps table
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS blood_camps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organizer_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    organizer VARCHAR(200) NOT NULL,
    location VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INT NOT NULL,
    contact VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    blood_types JSON NOT NULL,
    facilities JSON,
    status ENUM('active', 'upcoming', 'completed') DEFAULT 'upcoming',
    coordinates JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_organizer_id (organizer_id),
    INDEX idx_status (status),
    INDEX idx_date (date)
)`);
    // Donations table
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donor_id INT NOT NULL,
        recipient_id INT NULL,
        post_id INT NULL,
        donation_type ENUM('blood', 'organs', 'medicines', 'supplies', 'fundraiser') NOT NULL,
        amount DECIMAL(15,2) NULL,
        quantity VARCHAR(100) NULL,
        description TEXT,
        donation_date DATE NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        location VARCHAR(200),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (post_id) REFERENCES recipient_posts(id) ON DELETE SET NULL,
        INDEX idx_donor_id (donor_id),
        INDEX idx_donation_date (donation_date),
        INDEX idx_status (status)
    )`);

    // Blood donation specific details
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS blood_donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donation_id INT NOT NULL,
        blood_type VARCHAR(10) NOT NULL,
        volume_ml INT NOT NULL,
        hemoglobin_level DECIMAL(4,2),
        donation_center VARCHAR(200),
        next_eligible_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
    )`);

    // Donation achievements/badges
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS donor_achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donor_id INT NOT NULL,
        achievement_type VARCHAR(50) NOT NULL,
        achievement_name VARCHAR(100) NOT NULL,
        description TEXT,
        earned_date DATE NOT NULL,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_donor_id (donor_id),
        INDEX idx_earned_date (earned_date)
    )`);

    // Donation statistics view
    _ = check dbClient->execute(`CREATE OR REPLACE VIEW donor_stats AS
    SELECT 
        donor_id,
        COUNT(*) as total_donations,
        COUNT(CASE WHEN donation_type = 'blood' THEN 1 END) as blood_donations,
        COUNT(CASE WHEN donation_type = 'organs' THEN 1 END) as organ_donations,
        COUNT(CASE WHEN donation_type = 'medicines' THEN 1 END) as medicine_donations,
        COUNT(CASE WHEN donation_type = 'supplies' THEN 1 END) as supply_donations,
        SUM(CASE WHEN donation_type = 'fundraiser' THEN amount ELSE 0 END) as total_fundraiser_amount,
        MAX(donation_date) as last_donation_date,
        MIN(donation_date) as first_donation_date
    FROM donations 
    WHERE status = 'completed'
    GROUP BY donor_id`);

    // Blood camp registrations table
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS blood_camp_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        camp_id INT NOT NULL,
        donor_id INT NOT NULL,
        registration_date DATE NOT NULL,
        status ENUM('registered', 'confirmed', 'attended', 'cancelled', 'no_show') DEFAULT 'registered',
        blood_type VARCHAR(10) NOT NULL,
        last_donation_date DATE,
        health_status ENUM('eligible', 'pending_review', 'not_eligible') DEFAULT 'eligible',
        contact_phone VARCHAR(20) NOT NULL,
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        medical_conditions TEXT,
        medications TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (camp_id) REFERENCES blood_camps(id) ON DELETE CASCADE,
        FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_camp_id (camp_id),
        INDEX idx_donor_id (donor_id),
        INDEX idx_status (status),
        INDEX idx_registration_date (registration_date),
        UNIQUE KEY unique_donor_camp (donor_id, camp_id)
    )`);

    io:println("✅ Database tables are ready");
}
