// User data models for Vytal application

public type User record {|
    int id?;
    string name;
    string phone;
    string email;
    string password_hash?;
    string role; // "donor" or "receiver"
    string category; // "Organs", "Medicines", or "Blood"
    string created_at?;
    string updated_at?;
|};

public type UserCreateRequest record {|
    string name;
    string phone;
    string email;
    string password;
    string role; // "donor" or "receiver"
    string category; // "Organs", "Medicines", or "Blood"
|};

public type UserLoginRequest record {|
    string email;
    string password;
|};

public type AuthResponse record {|
    boolean success;
    string message;
    string? token;
    User? user;
|};

public type ApiResponse record {|
    boolean success;
    string message;
    anydata? data;
|};

public enum UserRole {
    DONOR = "donor",
    RECEIVER = "receiver"
}

public enum CategoryType {
    ORGANS = "Organs",
    MEDICINES = "Medicines",
    BLOOD = "Blood"
}
