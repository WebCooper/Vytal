import ballerina/sql;

public enum Role {
    DONOR = "donor",
    RECEIVER = "receiver"
}

public enum Category {
    ORGANIC = "Organs",
    MEDICINES = "Medicines", 
    BLOOD = "Blood"
}

# Database Configuration record type
public type DatabaseConfig record {|
    # User of the database
    string user;
    # Password of the database
    string password;
    # Name of the database
    string database;
    # Host of the database
    string host;
    # Port
    int port;
|};

# User record type for database operations
public type User record {|
    # User ID
    @sql:Column {name: "id"}
    readonly int? id;
    
    # User name
    @sql:Column {name: "name"}
    string name;
    
    # User phone number
    @sql:Column {name: "phone_number"}
    string phone_number;
    
    # User email
    @sql:Column {name: "email"}
    string email;
    
    # User password (hashed)
    @sql:Column {name: "password"}
    string password;
    
    # User role
    @sql:Column {name: "role"}
    Role role;
    
    # User categories (stored as JSON string in DB)
    @sql:Column {name: "categories"}
    string categories;
    
    # Created timestamp
    @sql:Column {name: "created_at"}
    string? created_at;
    
    # Updated timestamp
    @sql:Column {name: "updated_at"}
    string? updated_at;
|};

# User create record type
public type UserCreate record {|
    # User name
    string name;
    # User phone number
    string phone_number;
    # User email
    string email;
    # User password
    string password;
    # User role
    Role role;
    # User categories
    Category[] categories;
|};

# User update record type
public type UserUpdate record {|
    # User name
    string? name = ();
    # User phone number
    string? phone_number = ();
    # User role
    Role? role = ();
    # User categories
    Category[]? categories = ();
|};

public type UserResponse record {
    string name;
    string phone_number;
    string email;
    Role role;
    Category[] categories;
};

public type RegisterRequest record {
    string name;
    string phone_number;
    string email;
    string password;
    Role role;
    Category[] categories;
};

public type LoginRequest record {
    string email;
    string password;
};

public type LoginResponse record {
    string token;
    UserResponse user;
};