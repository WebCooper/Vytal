-- Create Vytal Database
CREATE DATABASE IF NOT EXISTS vytal_db;
USE vytal_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('donor', 'receiver') NOT NULL,
    categories JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, phone_number, email, password, role, categories) VALUES 
('John Doe', '+1234567890', 'john@example.com', 'hashedpassword123', 'donor', '["Organic", "Medicines"]'),
('Jane Smith', '+0987654321', 'jane@example.com', 'hashedpassword456', 'receiver', '["Blood", "Medicines"]');

-- Create tokens table for session management
CREATE TABLE IF NOT EXISTS tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);
