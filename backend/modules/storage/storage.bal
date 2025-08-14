import backend.types;

// In-memory storage for users and tokens with thread safety
isolated map<types:User> userStore = {};
isolated map<string> tokenStore = {};

public isolated function getUserStore() returns map<types:User> {
    lock {
        return userStore.clone();
    }
}

public isolated function getTokenStore() returns map<string> {
    lock {
        return tokenStore.clone();
    }
}

public isolated function addUser(string email, types:User user) {
    lock {
        userStore[email] = user.clone();
    }
}

public isolated function getUser(string email) returns types:User? {
    lock {
        types:User? user = userStore[email];
        return user is () ? () : user.clone();
    }
}

public isolated function userExists(string email) returns boolean {
    lock {
        return userStore.hasKey(email);
    }
}

public isolated function addToken(string token, string email) {
    lock {
        tokenStore[token] = email;
    }
}

public isolated function getEmailByToken(string token) returns string? {
    lock {
        return tokenStore[token];
    }
}

public isolated function removeToken(string token) returns string? {
    lock {
        return tokenStore.remove(token);
    }
}

public isolated function tokenExists(string token) returns boolean {
    lock {
        return tokenStore.hasKey(token);
    }
}