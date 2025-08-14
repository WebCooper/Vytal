// Database configuration and connection management
import ballerina/sql;
import ballerinax/mysql;

// Database configuration
configurable string DB_HOST = "localhost";
configurable int DB_PORT = 3306;
configurable string DB_NAME = "vytal_db";
configurable string DB_USER = "root";
configurable string DB_PASSWORD = "1010";

// Database connection
public mysql:Client dbClient = check new (
    host = DB_HOST,
    port = DB_PORT,
    database = DB_NAME,
    user = DB_USER,
    password = DB_PASSWORD
);

// Database initialization
public function initDatabase() returns error? {
    // Create users table if it doesn't exist
    sql:ExecutionResult result = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('donor', 'receiver') NOT NULL,
            category ENUM('Organs', 'Medicines', 'Blood') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            INDEX idx_email (email),
            INDEX idx_role (role),
            INDEX idx_category (category),
            INDEX idx_created_at (created_at)
        )
    `);
    
    return;
}
