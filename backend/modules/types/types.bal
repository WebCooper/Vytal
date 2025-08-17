import ballerina/sql;

public enum Role {
    RECIPIENT = "recipient",
    DONOR = "donor",
    ORGANIZATION = "organization",
    ADMIN = "admin"
}

# Description.
public enum Category {
    ORGANS = "organs",
    BLOOD = "blood",
    FUNDRAISER = "fundraiser",
    MEDICINES = "medicines",
    SUPPLIES = "supplies"
}

public enum Status {
    PENDING = "pending",
    OPEN = "open",
    FULFILLED = "fulfilled",
    CANCELLED = "cancelled"
}

public enum Urgency {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
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
    int id;
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
# Engagement metrics for posts
#
# + likes - field description  
# + comments - field description  
# + shares - field description  
# + views - field description
public type Engagement record {|
    int likes;
    int comments;
    int shares;
    int views;
|};

# Fundraiser details for posts
#
# + goal - field description  
# + received - field description
public type FundraiserDetails record {|
    decimal goal;
    decimal received;
|};

# Recipient Post (DB-facing model - normalized)
#
# + id - field description  
# + recipient_id - field description  
# + title - field description  
# + content - field description  
# + category - field description  
# + status - field description  
# + location - field description  
# + urgency - field description  
# + contact - field description  
# + created_at - field description  
# + updated_at - field description  
# + likes - field description  
# + comments - field description  
# + shares - field description  
# + views - field description  
# + goal - field description  
# + received - field description
public type RecipientPost record {|
    int id;
    int recipient_id;
    string title;
    string content;
    Category category;
    Status status;        
    string location?;
    Urgency urgency?;      
    string contact?;
    string created_at?;
    string updated_at?;
    int likes = 0;
    int comments = 0;
    int shares = 0;
    int views = 0;
    decimal? goal = ();
    decimal? received = ();
|};

# Create post (input)
#
# + recipient_id - field description  
# + title - field description  
# + content - field description  
# + category - field description  
# + status - field description  
# + location - field description  
# + urgency - field description  
# + contact - field description  
# + goal - field description
public type RecipientPostCreate record {|
    int recipient_id;
    string title;
    string content;
    Category category;
    Status status = "pending";
    string location?;
    Urgency urgency?;
    string contact?;
    decimal? goal = ();
|};

# Update post (partial update)
#
# + title - field description  
# + content - field description  
# + category - field description  
# + status - field description  
# + location - field description  
# + urgency - field description  
# + contact - field description  
# + goal - field description  
# + received - field description
public type RecipientPostUpdate record {|
    string? title;
    string? content;
    Category? category;
    Status? status;
    string? location;
    Urgency? urgency;
    string? contact;
    decimal? goal;
    decimal? received;
|};

# Response type (frontend-ready)
#
# + id - field description  
# + user - field description  
# + title - field description  
# + content - field description  
# + category - field description  
# + status - field description  
# + location - field description  
# + urgency - field description  
# + createdAt - field description  
# + engagement - field description  
# + contact - field description  
# + fundraiserDetails - field description
public type RecipientPostResponse record {|
    int id;
    UserResponse user;
    string title;
    string content;
    Category category;
    Status status;
    string? location;
    Urgency? urgency;
    string createdAt;
    Engagement engagement;
    string? contact;
    FundraiserDetails? fundraiserDetails;
|};
