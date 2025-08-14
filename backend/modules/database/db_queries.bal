import ballerina/sql;
import backend.types;

# Query to get all users from database
# + return - SQL query to select all users
public function getUsersQuery() returns sql:ParameterizedQuery => `
    SELECT 
        id,
        name,
        phone_number,
        email,
        password,
        role,
        categories,
        created_at,
        updated_at
    FROM 
        users;
`;

# Query to get user by email
# + email - Email address to search for
# + return - SQL query to select user by email
public function getUserByEmailQuery(string email) returns sql:ParameterizedQuery => `
    SELECT 
        id,
        name,
        phone_number,
        email,
        password,
        role,
        categories,
        created_at,
        updated_at
    FROM 
        users 
    WHERE 
        email = ${email};
`;

# Query to get user by ID
# + id - User ID to search for
# + return - SQL query to select user by ID
public function getUserByIdQuery(int id) returns sql:ParameterizedQuery => `
    SELECT 
        id,
        name,
        phone_number,
        email,
        password,
        role,
        categories,
        created_at,
        updated_at
    FROM 
        users 
    WHERE 
        id = ${id};
`;

# Query to insert a new user
# + user - User data to insert
# + categoriesJson - JSON string containing user categories
# + return - SQL query to insert a new user
public function insertUserQuery(types:UserCreate user, string categoriesJson) returns sql:ParameterizedQuery => `
    INSERT INTO users
        (
            name,
            phone_number,
            email,
            password,
            role,
            categories
        )
    VALUES
        (
            ${user.name},
            ${user.phone_number},
            ${user.email},
            ${user.password},
            ${user.role},
            ${categoriesJson}
        );
`;

# Query to update user
# + id - User ID to update
# + user - User data to update
# + categoriesJson - JSON string containing user categories (optional)
# + return - SQL query to update a user
public function updateUserQuery(int id, types:UserUpdate user, string? categoriesJson) returns sql:ParameterizedQuery => `
    UPDATE users
        SET 
            name = COALESCE(${user.name}, name),
            phone_number = COALESCE(${user.phone_number}, phone_number),
            role = COALESCE(${user.role}, role),
            categories = COALESCE(${categoriesJson}, categories),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id};
`;

# Query to delete user
# + id - User ID to delete
# + return - SQL query to delete a user
public function deleteUserQuery(int id) returns sql:ParameterizedQuery => `
    DELETE FROM users WHERE id = ${id};
`;

# Query to check if user exists by email
# + email - Email address to check
# + return - SQL query to check if user exists by email
public function userExistsByEmailQuery(string email) returns sql:ParameterizedQuery => `
    SELECT COUNT(*) as count FROM users WHERE email = ${email};
`;
