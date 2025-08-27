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
    # Unique identifier for the donation
    int id;
    # ID of the donor making the donation
    int donor_id;
    # ID of the recipient (optional)
    int? recipient_id;
    # ID of the related post (optional)
    int? post_id;
    # Type of donation being made
    DonationType donation_type;
    # Monetary amount for fundraiser donations
    decimal? amount;
    # Quantity description for physical donations
    string? quantity;
    # Additional description of the donation
    string? description;
    # Date when donation was made
    string donation_date;
    # Current status of the donation
    DonationStatus status;
    # Location where donation was made
    string? location;
    # Additional notes about the donation
    string? notes;
    # Timestamp when record was created
    string? created_at;
    # Timestamp when record was last updated
    string? updated_at;
|};

# Blood donation specific details
public type BloodDonation record {|
    # Unique identifier for the blood donation record
    int id;
    # Reference to the main donation record
    int donation_id;
    # Blood type (A+, B+, O-, etc.)
    string blood_type;
    # Volume of blood donated in milliliters
    int volume_ml;
    # Hemoglobin level at time of donation
    decimal? hemoglobin_level;
    # Name or location of the donation center
    string? donation_center;
    # Date when donor becomes eligible for next donation
    string? next_eligible_date;
    # Timestamp when record was created
    string? created_at;
|};

# Donation create request
public type DonationCreate record {|
    # ID of the recipient receiving the donation
    int? recipient_id;
    # ID of the related post that prompted the donation
    int? post_id;
    # Type of donation being made
    DonationType donation_type;
    # Monetary amount for fundraiser donations
    decimal? amount;
    # Quantity description for physical donations
    string? quantity;
    # Additional description of the donation
    string? description;
    # Date when donation was made
    string donation_date;
    # Location where donation was made
    string? location;
    # Additional notes about the donation
    string? notes;
    # Blood type for blood donations
    string? blood_type;
    # Volume of blood donated in milliliters
    int? volume_ml;
    # Hemoglobin level at time of donation
    decimal? hemoglobin_level;
    # Name or location of the donation center
    string? donation_center;
|};

# Donation update request
public type DonationUpdate record {|
    # Updated status of the donation
    DonationStatus? status;
    # Updated monetary amount
    decimal? amount;
    # Updated quantity description
    string? quantity;
    # Updated description
    string? description;
    # Updated location
    string? location;
    # Updated notes
    string? notes;
|};

# Achievement record
public type Achievement record {|
    # Unique identifier for the achievement
    int id;
    # ID of the donor who earned the achievement
    int donor_id;
    # Type or category of achievement
    string achievement_type;
    # Display name of the achievement
    string achievement_name;
    # Description of what the achievement represents
    string? description;
    # Date when the achievement was earned
    string earned_date;
    # Additional metadata about the achievement in JSON format
    json? metadata;
    # Timestamp when record was created
    string? created_at;
|};

# Donor statistics
public type DonorStats record {|
    # ID of the donor these statistics belong to
    int donor_id;
    # Total number of donations made
    int total_donations;
    # Number of blood donations made
    int blood_donations;
    # Number of organ donations made
    int organ_donations;
    # Number of medicine donations made
    int medicine_donations;
    # Number of supply donations made
    int supply_donations;
    # Total amount raised through fundraiser donations
    decimal total_fundraiser_amount;
    # Date of the most recent donation
    string? last_donation_date;
    # Date of the first donation
    string? first_donation_date;
|};

# Donation response with related data
public type DonationResponse record {|
    # Unique identifier for the donation
    int id;
    # ID of the donor making the donation
    int donor_id;
    # ID of the recipient receiving the donation
    int? recipient_id;
    # ID of the related post
    int? post_id;
    # Type of donation made
    DonationType donation_type;
    # Monetary amount for fundraiser donations
    decimal? amount;
    # Quantity description for physical donations
    string? quantity;
    # Additional description of the donation
    string? description;
    # Date when donation was made
    string donation_date;
    # Current status of the donation
    DonationStatus status;
    # Location where donation was made
    string? location;
    # Additional notes about the donation
    string? notes;
    # Timestamp when record was created
    string created_at;
    # Timestamp when record was last updated
    string updated_at;
    # Preview information about the recipient
    UserPreview? recipient;
    # Information about the related post
    record {int id; string title; string category;}? post;
    # Blood donation specific details if applicable
    BloodDonation? blood_details;
|};

# Dashboard summary data
public type DonorDashboard record {|
    # Donor's overall statistics
    DonorStats stats;
    # List of recent donations made by the donor
    DonationResponse[] recent_donations;
    # List of achievements earned by the donor
    Achievement[] achievements;
    # Information about donor's availability for blood donations
    record {|
        # Whether the donor can currently donate blood
        boolean can_donate_blood;
        # Date when donor becomes eligible for next blood donation
        string? next_eligible_date;
        # Date of the last blood donation
        string? last_donation_date;
    |} availability;
|};

# Blood Camp Registration Types for Ballerina Backend

public enum RegistrationStatus {
    REGISTERED = "registered",
    CONFIRMED = "confirmed", 
    ATTENDED = "attended",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
}

public enum HealthStatus {
    ELIGIBLE = "eligible",
    PENDING_REVIEW = "pending_review",
    NOT_ELIGIBLE = "not_eligible"
}

# Blood Camp Registration record
public type BloodCampRegistration record {|
    # Unique registration ID
    int id;
    # ID of the blood camp
    int camp_id;
    # ID of the donor
    int donor_id;
    # Date when registration was made
    string registration_date;
    # Current status of registration
    RegistrationStatus status;
    # Donor's blood type
    string blood_type;
    # Last blood donation date (optional)
    string? last_donation_date;
    # Current health status for donation
    HealthStatus health_status;
    # Contact phone number
    string contact_phone;
    # Emergency contact name (optional)
    string? emergency_contact_name;
    # Emergency contact phone (optional)
    string? emergency_contact_phone;
    # Medical conditions (optional)
    string? medical_conditions;
    # Current medications (optional)
    string? medications;
    # Additional notes (optional)
    string? notes;
    # Timestamp when record was created
    string? created_at;
    # Timestamp when record was last updated
    string? updated_at;
|};

# Registration create request
public type BloodCampRegistrationCreate record {|
    # ID of the blood camp to register for
    int camp_id;
    # Donor's blood type
    string blood_type;
    # Last blood donation date (optional)
    string? last_donation_date;
    # Contact phone number
    string contact_phone;
    # Emergency contact name (optional)
    string? emergency_contact_name;
    # Emergency contact phone (optional)
    string? emergency_contact_phone;
    # Medical conditions (optional)
    string? medical_conditions;
    # Current medications (optional)
    string? medications;
    # Additional notes (optional)
    string? notes;
|};

# Registration update request
public type BloodCampRegistrationUpdate record {|
    # Updated registration status
    RegistrationStatus? status;
    # Updated health status
    HealthStatus? health_status;
    # Updated contact phone
    string? contact_phone;
    # Updated emergency contact name
    string? emergency_contact_name;
    # Updated emergency contact phone
    string? emergency_contact_phone;
    # Updated medical conditions
    string? medical_conditions;
    # Updated medications
    string? medications;
    # Updated notes
    string? notes;
|};

# Registration response with related data
public type BloodCampRegistrationResponse record {|
    # Registration record
    BloodCampRegistration registration;
    # Related blood camp information
    record {|
        int id;
        string name;
        string location;
        string date;
        string start_time;
        string end_time;
    |} camp;
    # Related donor information
    record {|
        int id;
        string name;
        string email;
    |} donor;
|};

# Eligibility check response
public type EligibilityResponse record {|
    # Whether donor is eligible to donate
    boolean eligible;
    # Reason for eligibility status
    string? reason;
    # Next eligible donation date
    string? next_eligible_date;
    # Last donation date
    string? last_donation_date;
    # Blood type from last donation
    string? blood_type;
|};

# Registration statistics for camps
public type RegistrationStats record {|
    # Blood camp ID
    int camp_id;
    # Total registrations
    int total_registrations;
    # Confirmed registrations
    int confirmed_registrations;
    # Attended registrations
    int attended_registrations;
    # Cancelled registrations
    int cancelled_registrations;
    # No-show registrations
    int no_show_registrations;
|};

# Donor registration history
public type DonorRegistrationHistory record {|
    # Donor ID
    int donor_id;
    # List of all registrations
    BloodCampRegistrationResponse[] registrations;
    # Total camps registered
    int total_registered;
    # Total camps attended
    int total_attended;
    # Cancellation rate
    decimal cancellation_rate;
|};

# Registration notification data
public type RegistrationNotification record {|
    # Registration ID
    int registration_id;
    # Notification type
    string notification_type; # reminder, confirmation, cancellation
    # Message to send
    string message;
    # Recipient contact info
    string contact_info;
    # Scheduled send time
    string scheduled_time;
    # Whether notification was sent
    boolean sent;
|};

# Blood camp capacity check
public type CampCapacityInfo record {|
    # Camp ID
    int camp_id;
    # Maximum capacity
    int max_capacity;
    # Current registrations
    int current_registrations;
    # Available spots
    int available_spots;
    # Whether camp is full
    boolean is_full;
    # Waiting list size
    int waiting_list_size;
|};
