import ballerinax/mysql;
import ballerinax/mysql.driver as _; // Import MySQL driver
import ballerina/sql;
import ballerina/regex;
import backend.types;
import backend.storage;
import ballerina/io;
import ballerina/lang.'int;
import ballerina/lang.value;

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

public isolated function createDonorPost(types:DonorPostCreate post) returns (int|error) {
    mysql:Client dbClientInstance = check getDbClient();
    
    string? bloodOfferingJson = ();
    string? fundraiserOfferingJson = ();
    string? medicineOfferingJson = ();
    string? organOfferingJson = ();
    
    // Create the appropriate offering JSON based on the category
    match post.category {
        "blood" => {
            if post.bloodOffering is () {
                return error("Blood category requires blood offering details");
            }
            types:BloodOffering bloodOffering = <types:BloodOffering>post.bloodOffering;
            json bloodJson = {
                "bloodType": bloodOffering.bloodType,
                "availability": bloodOffering.availability,
                "lastDonation": bloodOffering.lastDonation
            };
            bloodOfferingJson = bloodJson.toJsonString();
        }
        "fundraiser" => {
            if post.fundraiserOffering is () {
                return error("Fundraiser category requires fundraiser offering details");
            }
            types:FundraiserOffering fundraiserOffering = <types:FundraiserOffering>post.fundraiserOffering;
            json fundraiserJson = {
                "maxAmount": fundraiserOffering.maxAmount,
                "preferredUse": fundraiserOffering.preferredUse,
                "requirements": fundraiserOffering.requirements
            };
            fundraiserOfferingJson = fundraiserJson.toJsonString();
        }
        "medicines" => {
            if post.medicineOffering is () {
                return error("Medicine category requires medicine offering details");
            }
            types:MedicineOffering medicineOffering = <types:MedicineOffering>post.medicineOffering;
            json medicineJson = {
                "medicineTypes": medicineOffering.medicineTypes,
                "quantity": medicineOffering.quantity,
                "expiry": medicineOffering.expiry
            };
            medicineOfferingJson = medicineJson.toJsonString();
        }
        "organs" => {
            if post.organOffering is () {
                return error("Organ category requires organ offering details");
            }
            types:OrganOffering organOffering = <types:OrganOffering>post.organOffering;
            json organJson = {
                "organType": organOffering.organType,
                "healthStatus": organOffering.healthStatus,
                "availability": organOffering.availability
            };
            organOfferingJson = organJson.toJsonString();
        }
        _ => {
            return error("Unsupported category: " + post.category.toString());
        }
    }

    // Convert enum values to JSON strings - wrapped in quotes for JSON format
    string statusJson = "\"" + post.status.toString() + "\"";
    string categoryJson = "\"" + post.category.toString() + "\"";
    string urgencyJson = "\"" + post.urgency.toString() + "\"";
    
    sql:ParameterizedQuery insertQuery = `INSERT INTO donor_posts
        (donor_id, title, status, category, content, location, urgency, contact,
         bloodOffering, fundraiserOffering, medicineOffering, organOffering)
        VALUES (${post.donor_id}, ${post.title}, ${statusJson},
                ${categoryJson}, ${post.content}, ${post.location},
                ${urgencyJson}, ${post.contact}, 
                ${bloodOfferingJson}, ${fundraiserOfferingJson}, ${medicineOfferingJson}, 
                ${organOfferingJson})`;

    sql:ExecutionResult result = check dbClientInstance->execute(insertQuery);
    return <int>result.lastInsertId;
}


# Get all donor posts from the database
# + return - Array of donor posts or error if operation fails
public isolated function getDonorPosts() returns types:DonorPost[]|error {
    mysql:Client dbClientInstance = check getDbClient();

    sql:ParameterizedQuery query = `SELECT * FROM donor_posts ORDER BY created_at DESC`;
    stream<record {}, sql:Error?> resultStream = dbClientInstance->query(query);

    types:DonorPost[] posts = [];

    while (true) {
        record {|record {} value;|}|sql:Error? result = resultStream.next();
        if result is sql:Error {
            return error("Error retrieving donor posts: " + result.message());
        } else if result is () {
            break;
        } else {
            record {} row = result.value;
            
            // Clean enum JSON strings
            string categoryStr = <string>(row["category"] ?: "\"unknown\"");
            string categoryClean = regex:replaceAll(categoryStr, "\"", "");
            
            string statusStr = <string>(row["status"] ?: "\"pending\"");
            string statusClean = regex:replaceAll(statusStr, "\"", "");
            
            string urgencyStr = <string>(row["urgency"] ?: "\"low\"");
            string urgencyClean = regex:replaceAll(urgencyStr, "\"", "");
            
            // Build donor post
            types:DonorPost post = {
                id: row["id"] is () ? 0 : <int>row["id"],
                donor_id: row["donor_id"] is () ? 0 : <int>row["donor_id"],
                title: <string>(row["title"] ?: ""),
                status: <types:Status>statusClean,
                category: <types:Category>categoryClean,
                content: <string>(row["content"] ?: ""),
                location: <string>(row["location"] ?: ""),
                createdAt: <string>(row["created_at"] ?: ""),
                urgency: <types:Urgency>urgencyClean,
                contact: <string>(row["contact"] ?: ""),
                engagement: {
                    likes: row["likes"] is () ? 0 : <int>row["likes"],
                    comments: row["comments"] is () ? 0 : <int>row["comments"],
                    shares: row["shares"] is () ? 0 : <int>row["shares"],
                    views: row["views"] is () ? 0 : <int>row["views"]
                },
                bloodOffering: (),
                fundraiserOffering: (),
                medicineOffering: (),
                organOffering: ()
            };
            
            // Parse offerings based on category
            string category = categoryClean;
            match category {
                "blood" => {
                    any bloodOfferingValue = row["bloodOffering"];
                    if bloodOfferingValue is string && bloodOfferingValue != "" {
                        json|error bloodJson = value:fromJsonString(bloodOfferingValue);
                        if bloodJson is json {
                            types:BloodOffering|error parsedOffering = value:fromJsonWithType(bloodJson, types:BloodOffering);
                            if parsedOffering is types:BloodOffering {
                                post.bloodOffering = parsedOffering;
                            }
                        }
                    }
                }
                "fundraiser" => {
                    any fundraiserOfferingValue = row["fundraiserOffering"];
                    if fundraiserOfferingValue is string && fundraiserOfferingValue != "" {
                        json|error fundraiserJson = value:fromJsonString(fundraiserOfferingValue);
                        if fundraiserJson is json {
                            types:FundraiserOffering|error parsedOffering = value:fromJsonWithType(fundraiserJson, types:FundraiserOffering);
                            if parsedOffering is types:FundraiserOffering {
                                post.fundraiserOffering = parsedOffering;
                            }
                        }
                    }
                }
                "medicines" => {
                    any medicineOfferingValue = row["medicineOffering"];
                    if medicineOfferingValue is string && medicineOfferingValue != "" {
                        json|error medicineJson = value:fromJsonString(medicineOfferingValue);
                        if medicineJson is json {
                            types:MedicineOffering|error parsedOffering = value:fromJsonWithType(medicineJson, types:MedicineOffering);
                            if parsedOffering is types:MedicineOffering {
                                post.medicineOffering = parsedOffering;
                            }
                        }
                    }
                }
                "organs" => {
                    any organOfferingValue = row["organOffering"];
                    if organOfferingValue is string && organOfferingValue != "" {
                        json|error organJson = value:fromJsonString(organOfferingValue);
                        if organJson is json {
                            types:OrganOffering|error parsedOffering = value:fromJsonWithType(organJson, types:OrganOffering);
                            if parsedOffering is types:OrganOffering {
                                post.organOffering = parsedOffering;
                            }
                        }
                    }
                }
            }
            
            posts.push(post);
        }
    }
    
    check resultStream.close();
    return posts;
}

public isolated function getDonorPostById(int id) returns (types:DonorPost|error?) {
    mysql:Client dbClientInstance = check getDbClient();
    
    sql:ParameterizedQuery selectQuery = `SELECT * FROM donor_posts WHERE id = ${id}`;
    stream<record {}, error?> resultStream = dbClientInstance->query(selectQuery);

    record {}? row = check resultStream.next();
    check resultStream.close();
    
    if row is () {
        return ();
    }

    // Get and clean category JSON string
    string categoryStr = <string>(row["category"] ?: "\"unknown\"");
    string categoryClean = regex:replaceAll(categoryStr, "\"", "");
    
    // Get and clean status JSON string
    string statusStr = <string>(row["status"] ?: "\"pending\"");
    string statusClean = regex:replaceAll(statusStr, "\"", "");
    
    // Get and clean urgency JSON string
    string urgencyStr = <string>(row["urgency"] ?: "\"low\"");
    string urgencyClean = regex:replaceAll(urgencyStr, "\"", "");

    // Build donor post safely, handling nullable fields with default values
    types:DonorPost donorPost = {
        id: row["id"] is () ? 0 : <int>row["id"],
        donor_id: row["donor_id"] is () ? 0 : <int>row["donor_id"],
        title: <string>(row["title"] ?: ""),
        status: <types:Status>statusClean,
        category: <types:Category>categoryClean,
        content: <string>(row["content"] ?: ""),
        location: <string>(row["location"] ?: ""),
        createdAt: <string>(row["created_at"] ?: ""),
        urgency: <types:Urgency>urgencyClean,
        contact: <string>(row["contact"] ?: ""),
        engagement: {
            likes: row["likes"] is () ? 0 : <int>row["likes"],
            comments: row["comments"] is () ? 0 : <int>row["comments"],
            shares: row["shares"] is () ? 0 : <int>row["shares"],
            views: row["views"] is () ? 0 : <int>row["views"]
        },
        bloodOffering: (),
        fundraiserOffering: (),
        medicineOffering: (),
        organOffering: ()
    };

    // Set the appropriate offering details based on category
    match categoryStr {
        "blood" => {
            any bloodOfferingValue = row["bloodOffering"];
            if bloodOfferingValue is string && bloodOfferingValue != "" {
                json|error bloodJson = value:fromJsonString(bloodOfferingValue);
                if bloodJson is json {
                    types:BloodOffering|error parsedOffering = value:fromJsonWithType(bloodJson, types:BloodOffering);
                    if parsedOffering is types:BloodOffering {
                        donorPost.bloodOffering = parsedOffering;
                    }
                }
            }
        }
        "fundraiser" => {
            any fundraiserOfferingValue = row["fundraiserOffering"];
            if fundraiserOfferingValue is string && fundraiserOfferingValue != "" {
                json|error fundraiserJson = value:fromJsonString(fundraiserOfferingValue);
                if fundraiserJson is json {
                    types:FundraiserOffering|error parsedOffering = value:fromJsonWithType(fundraiserJson, types:FundraiserOffering);
                    if parsedOffering is types:FundraiserOffering {
                        donorPost.fundraiserOffering = parsedOffering;
                    }
                }
            }
        }
        "medicines" => {
            any medicineOfferingValue = row["medicineOffering"];
            if medicineOfferingValue is string && medicineOfferingValue != "" {
                json|error medicineJson = value:fromJsonString(medicineOfferingValue);
                if medicineJson is json {
                    types:MedicineOffering|error parsedOffering = value:fromJsonWithType(medicineJson, types:MedicineOffering);
                    if parsedOffering is types:MedicineOffering {
                        donorPost.medicineOffering = parsedOffering;
                    }
                }
            }
        }
        "organs" => {
            any organOfferingValue = row["organOffering"];
            if organOfferingValue is string && organOfferingValue != "" {
                json|error organJson = value:fromJsonString(organOfferingValue);
                if organJson is json {
                    types:OrganOffering|error parsedOffering = value:fromJsonWithType(organJson, types:OrganOffering);
                    if parsedOffering is types:OrganOffering {
                        donorPost.organOffering = parsedOffering;
                    }
                }
            }
        }
        _ => {
            // Unsupported or missing category - leave offerings empty
        }
    }

    return donorPost;
}

public isolated function deleteDonorPost(int id) returns sql:ExecutionResult|error {
    mysql:Client dbClientInstance = check getDbClient();
    sql:ParameterizedQuery query = `DELETE FROM donor_posts WHERE id = ${id}`;
    return dbClientInstance->execute(query);
}

public isolated function updateDonorPost(int id, types:DonorPostUpdate post) returns sql:ExecutionResult|error {
    mysql:Client dbClientInstance = check getDbClient();
    
    // Convert enum values to JSON strings if they exist
    string? categoryJson = post.category is () ? () : "\"" + post.category.toString() + "\"";
    string? statusJson = post.status is () ? () : "\"" + post.status.toString() + "\"";
    string? urgencyJson = post.urgency is () ? () : "\"" + post.urgency.toString() + "\"";
    
    // Handle each type of offering JSON if provided
    string? bloodOfferingJson = ();
    string? fundraiserOfferingJson = ();
    string? medicineOfferingJson = ();
    string? organOfferingJson = ();
    
    if post.bloodOffering is types:BloodOffering {
        json bloodJson = {
            "bloodType": (<types:BloodOffering>post.bloodOffering).bloodType,
            "availability": (<types:BloodOffering>post.bloodOffering).availability,
            "lastDonation": (<types:BloodOffering>post.bloodOffering).lastDonation
        };
        bloodOfferingJson = bloodJson.toJsonString();
    }
    
    if post.fundraiserOffering is types:FundraiserOffering {
        json fundraiserJson = {
            "maxAmount": (<types:FundraiserOffering>post.fundraiserOffering).maxAmount,
            "preferredUse": (<types:FundraiserOffering>post.fundraiserOffering).preferredUse,
            "requirements": (<types:FundraiserOffering>post.fundraiserOffering).requirements
        };
        fundraiserOfferingJson = fundraiserJson.toJsonString();
    }
    
    if post.medicineOffering is types:MedicineOffering {
        json medicineJson = {
            "medicineTypes": (<types:MedicineOffering>post.medicineOffering).medicineTypes,
            "quantity": (<types:MedicineOffering>post.medicineOffering).quantity,
            "expiry": (<types:MedicineOffering>post.medicineOffering).expiry
        };
        medicineOfferingJson = medicineJson.toJsonString();
    }
    
    if post.organOffering is types:OrganOffering {
        json organJson = {
            "organType": (<types:OrganOffering>post.organOffering).organType,
            "healthStatus": (<types:OrganOffering>post.organOffering).healthStatus,
            "availability": (<types:OrganOffering>post.organOffering).availability
        };
        organOfferingJson = organJson.toJsonString();
    }
    
    sql:ParameterizedQuery query = `
        UPDATE donor_posts 
        SET 
            title = COALESCE(${post.title}, title),
            content = COALESCE(${post.content}, content),
            category = COALESCE(${categoryJson}, category),
            status = COALESCE(${statusJson}, status),
            location = COALESCE(${post.location}, location),
            urgency = COALESCE(${urgencyJson}, urgency),
            contact = COALESCE(${post.contact}, contact),
            bloodOffering = COALESCE(${bloodOfferingJson}, bloodOffering),
            fundraiserOffering = COALESCE(${fundraiserOfferingJson}, fundraiserOffering),
            medicineOffering = COALESCE(${medicineOfferingJson}, medicineOffering),
            organOffering = COALESCE(${organOfferingJson}, organOffering),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
    `;
    return dbClientInstance->execute(query);
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

    io:println("✅ Database tables are ready");
}
