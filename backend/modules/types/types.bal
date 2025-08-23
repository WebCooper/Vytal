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

public type BloodOffering record {|
    string bloodType;
    string availability;
    string lastDonation;
|};


public type FundraiserOffering record {|
    int maxAmount;
    string preferredUse;
    string requirements;
|};


public type MedicineOffering record {|
    string[] medicineTypes;
    string quantity;
    string expiry;
|};


public type OrganOffering record {|
    string organType;
    string healthStatus;
    string availability;
|};


# Donor Post (DB-facing / response type)
#
# + id - field description  
# + donor_id - field description  
# + title - field description  
# + status - field description  
# + category - field description  
# + content - field description  
# + location - field description  
# + createdAt - field description  
# + urgency - field description  
# + engagement - field description  
# + contact - field description  
# + bloodOffering - field description  
# + fundraiserOffering - field description  
# + medicineOffering - field description  
# + organOffering - field description
public type DonorPost record {|  
    int id;  
    int donor_id;  
    string title;  
    Status status;   
    Category category;  
    string content;  
    string location;  
    string createdAt;   
    Urgency urgency;   
    Engagement engagement;  
    string contact;  

    BloodOffering? bloodOffering = ();  
    FundraiserOffering? fundraiserOffering = ();  
    MedicineOffering? medicineOffering = ();  
    OrganOffering? organOffering = ();  
|};  

# Create donor post (input)
#
# + donor_id - ID of the donor creating the post  
# + title - Title of the post  
# + category - Category of the offering  
# + status - status of the post  
# + content - Content/description of the post  
# + location - Location information  
# + urgency - Urgency level of the offering  
# + contact - Contact information  
# + bloodOffering - Blood donation specific details  
# + fundraiserOffering - Fundraiser specific details  
# + medicineOffering - Medicine donation details  
# + organOffering - Organ donation details
public type DonorPostCreate record {|  
    int donor_id;  
    string title;  
    Category category;  
    string content;  
    string location;  
    Status status = "pending";  
    Urgency urgency;  
    string contact;  

    BloodOffering? bloodOffering = ();  
    FundraiserOffering? fundraiserOffering = ();  
    MedicineOffering? medicineOffering = ();  
    OrganOffering? organOffering = ();  
|};  

# Update donor post (partial update)
#
# + title - Title of the post  
# + category - Category of the offering  
# + content - Content/description of the post  
# + status - Status of the post  
# + location - Location information  
# + urgency - Urgency level of the offering  
# + contact - Contact information  
# + bloodOffering - Blood donation specific details  
# + fundraiserOffering - Fundraiser specific details  
# + medicineOffering - Medicine donation details  
# + organOffering - Organ donation details
public type DonorPostUpdate record {|  
    string? title = ();  
    Category? category = ();  
    string? content = ();  
    Status? status = ();  
    string? location = ();  
    Urgency? urgency = ();  
    string? contact = ();  

    BloodOffering? bloodOffering = ();  
    FundraiserOffering? fundraiserOffering = ();  
    MedicineOffering? medicineOffering = ();  
    OrganOffering? organOffering = ();  
|};  
public type UserPreview record {
    int id;
    string name;
    string email;
    string role;
};
public type BloodCamp record {
    int id;
    int organizer_id;
    string name;
    string organizer;
    string location;
    string address;
    string date;
    string start_time;
    string end_time;
    int capacity;
    string contact;
    string description;
    string? requirements;
    string[] blood_types;
    string[]? facilities;
    string status;
    decimal[] coordinates; // [latitude, longitude]
    string? created_at;
    string? updated_at;
};

public type BloodCampCreate record {
    string name;
    string organizer;
    string location;
    string address;
    string date;
    string start_time;
    string end_time;
    int capacity;
    string contact;
    string description;
    string? requirements;
    string[] blood_types;
    string[]? facilities;
    decimal[] coordinates;
};

public enum DonationType {
    BLOOD = "blood",
    ORGANS = "organs",
    MEDICINES = "medicines",
    SUPPLIES = "supplies",
    FUNDRAISER = "fundraiser"
}

public enum DonationStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}

# Donation record type
public type Donation record {|
    int id;
    int donor_id;
    int? recipient_id;
    int? post_id;
    DonationType donation_type;
    decimal? amount;
    string? quantity;
    string? description;
    string donation_date;
    DonationStatus status;
    string? location;
    string? notes;
    string? created_at;
    string? updated_at;
|};

# Blood donation specific details
public type BloodDonation record {|
    int id;
    int donation_id;
    string blood_type;
    int volume_ml;
    decimal? hemoglobin_level;
    string? donation_center;
    string? next_eligible_date;
    string? created_at;
|};

# Donation create request
public type DonationCreate record {|
    int? recipient_id;
    int? post_id;
    DonationType donation_type;
    decimal? amount;
    string? quantity;
    string? description;
    string donation_date;
    string? location;
    string? notes;
    # Blood donation specific (optional)
    string? blood_type;
    int? volume_ml;
    decimal? hemoglobin_level;
    string? donation_center;
|};

# Donation update request
public type DonationUpdate record {|
    DonationStatus? status;
    decimal? amount;
    string? quantity;
    string? description;
    string? location;
    string? notes;
|};

# Achievement record
public type Achievement record {|
    int id;
    int donor_id;
    string achievement_type;
    string achievement_name;
    string? description;
    string earned_date;
    json? metadata;
    string? created_at;
|};

# Donor statistics
public type DonorStats record {|
    int donor_id;
    int total_donations;
    int blood_donations;
    int organ_donations;
    int medicine_donations;
    int supply_donations;
    decimal total_fundraiser_amount;
    string? last_donation_date;
    string? first_donation_date;
|};

# Donation response with related data
public type DonationResponse record {|
    int id;
    int donor_id;
    int? recipient_id;
    int? post_id;
    DonationType donation_type;
    decimal? amount;
    string? quantity;
    string? description;
    string donation_date;
    DonationStatus status;
    string? location;
    string? notes;
    string created_at;
    string updated_at;
    UserPreview? recipient;
    record {int id; string title; string category;}? post;
    BloodDonation? blood_details;
|};

# Dashboard summary data
public type DonorDashboard record {|
    DonorStats stats;
    DonationResponse[] recent_donations;
    Achievement[] achievements;
    record {|
        boolean can_donate_blood;
        string? next_eligible_date;
        string? last_donation_date;
    |} availability;
|};