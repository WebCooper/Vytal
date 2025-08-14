-- Reset Database Script
-- Drop existing users table and create new one with updated schema

USE vytal_db;

-- Drop existing users table
DROP TABLE IF EXISTS users;

-- Create new users table with updated attributes
CREATE TABLE users (
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
);

-- Insert sample users with SHA2 hashed passwords
INSERT INTO users (name, phone, email, password_hash, role, category) VALUES
('John Donor', '+1234567890', 'john.donor@vytal.com', SHA2('donor123', 256), 'donor', 'Blood'),
('Jane Receiver', '+1234567891', 'jane.receiver@vytal.com', SHA2('receiver123', 256), 'receiver', 'Blood'),
('Dr. Michael Smith', '+1234567892', 'dr.smith@vytal.com', SHA2('doctor123', 256), 'donor', 'Organs'),
('Mary Patient', '+1234567893', 'mary.patient@vytal.com', SHA2('patient123', 256), 'receiver', 'Organs'),
('Alex Pharmacy', '+1234567894', 'alex.pharmacy@vytal.com', SHA2('pharmacy123', 256), 'donor', 'Medicines'),
('Emma User', '+1234567895', 'emma.user@vytal.com', SHA2('user123', 256), 'receiver', 'Medicines');

-- Display table structure
DESCRIBE users;

-- Display all users
SELECT id, name, phone, email, role, category, created_at FROM users ORDER BY id;

-- Test login functionality with one user
SELECT 'Login Test Result:' as test_description;
SELECT id, name, email, role, category 
FROM users 
WHERE email = 'john.donor@vytal.com' AND password_hash = SHA2('donor123', 256);
