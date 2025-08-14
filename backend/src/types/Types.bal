// Type definitions for Vytal Authentication API

// User role enumeration
public enum Role {
    DONOR = "donor",
    RECEIVER = "receiver"
}

// Category enumeration for user interests
public enum Category {
    ORGANIC = "Organic",
    MEDICINES = "Medicines", 
    BLOOD = "Blood"
}

// Complete user record with all fields
public type User record {
    string name;
    string phone_number;
    string email;
    string password;
    Role role;
    Category[] categories;
};

// User response without sensitive data (password excluded)
public type UserResponse record {
    string name;
    string phone_number;
    string email;
    Role role;
    Category[] categories;
};

// Request payload for user registration
public type RegisterRequest record {
    string name;
    string phone_number;
    string email;
    string password;
    Role role;
    Category[] categories;
};

// Request payload for user login
public type LoginRequest record {
    string email;
    string password;
};

// Response payload for successful login
public type LoginResponse record {
    string token;
    UserResponse user;
};
