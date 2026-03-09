CREATE DATABASE IF NOT EXISTS ems_db;
USE ems_db;

-- Table for Departments
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255)
);

-- Table for Users (Admins/Employees)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'EMPLOYEE') DEFAULT 'EMPLOYEE',
    full_name VARCHAR(255)
);

-- Table for Employees
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    salary DOUBLE,
    designation VARCHAR(100),
    department_id BIGINT,
    user_id BIGINT,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'PRESENT',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Table for Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Initial Data
INSERT IGNORE INTO users (username, password, role, full_name) VALUES ('admin', 'admin123', 'ADMIN', 'System Administrator');
INSERT IGNORE INTO departments (name, location) VALUES ('Human Resources', 'Building A'), ('Engineering', 'Building B'), ('Marketing', 'Building C');
