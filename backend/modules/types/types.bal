public enum Role {
    DONOR = "donor",
    RECEIVER = "receiver"
}

public enum Category {
    ORGANIC = "Organic",
    MEDICINES = "Medicines", 
    BLOOD = "Blood"
}

public type User record {
    string name;
    string phone_number;
    string email;
    string password;
    Role role;
    Category[] categories;
};

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