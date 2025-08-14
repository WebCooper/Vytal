// In-memory storage for users and tokens

public map<record {
    string name;
    string phone_number;
    string email;
    string password;
    string role; // "donor" or "receiver"
    string[] categories; // Array of categories
}> userStore = {};

public map<string> tokenStore = {};

// Utility function to convert User to UserResponse
public function userToUserResponse(record {
    string name;
    string phone_number;
    string email;
    string password;
    string role;
    string[] categories;
} user) returns record {
    string name;
    string phone_number;
    string email;
    string role;
    string[] categories;
} {
    return {
        name: user.name,
        phone_number: user.phone_number,
        email: user.email,
        role: user.role,
        categories: user.categories
    };
}
