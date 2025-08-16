-- Vytal Database Setup Script
-- Run once or let Ballerina auto-create

CREATE DATABASE IF NOT EXISTS vytal_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE vytal_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('donor', 'receiver') NOT NULL,
    categories JSON NOT NULL, -- multiple categories allowed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);

-- Health Records table (future use)
CREATE TABLE IF NOT EXISTS health_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_record_type (record_type),
    INDEX idx_created_at (created_at)
);

-- Appointments table (future use)
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status ENUM('scheduled', 'confirmed', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status)
);

-- Insert sample users (with JSON categories)
INSERT IGNORE INTO users (name, phone_number, email, password, role, categories) 
VALUES (
    'John Donor',
    '+1234567890',
    'donor@vytal.com',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- SHA256 of 'donor123'
    'donor',
    '["Blood"]'
);

INSERT IGNORE INTO users (name, phone_number, email, password, role, categories) 
VALUES (
    'Sarah Receiver',
    '+1234567891',
    'receiver@vytal.com',
    '8b2c2e9a7e9e9e5f3e9b6a9f8e3c4d5f6789abc123def456ghi789jkl012mno345', -- fake hash
    'receiver',
    '["Organs"]'
);

INSERT IGNORE INTO users (name, phone_number, email, password, role, categories) 
VALUES (
    'Medicine Donor',
    '+1234567892',
    'medicine@vytal.com',
    'f8f7e9e9e6d5c4b3a29182736454859687776665544332211009988776655443', -- fake hash
    'donor',
    '["Medicines"]'
);
