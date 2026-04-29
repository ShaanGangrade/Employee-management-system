# 🚀 Employee Management System (EMS Pro)

Professional, secure, and robust Employee Management System built with **Spring Boot**, **MySQL**, and **Modern UI**.

## ✨ Key Enhancements & Features

### 🛡️ 1. Security (Spring Security)
- **BCrypt Encryption**: Passwords are no longer stored in plain text.
- **Role-Based Access**: Support for `ADMIN` and `EMPLOYEE` roles.
- **Secure API**: Integrated Spring Security for backend protection.

### ✅ 2. Advanced Validation
- **Model Validation**: Strict checks for email format, required fields, and non-negative salary using JSR-303 annotations.
- **Frontend Validation**: Instant feedback in the UI for incorrect data entry.

### 📊 3. Interactive Dashboard (Game Changer)
- **Real-time Stats**: Total Employees, Present Today, Absent Today, and Department Count.
- **Graphical Analytics**: Doughnut charts for department distribution using Chart.js.

### 🛠️ 4. Professional API & Design
- **RESTful Architecture**: Clean GET, POST, PUT, and DELETE mappings.
- **Global Error Handling**: Centralized exception handling for clean, consistent JSON error responses.
- **Logging**: Integrated SLF4J logging for production-ready debugging.

### 🎨 5. Premium UI
- **Bootstrap 5**: Modern, responsive layout with clean tables and aligned buttons.
- **Toast Notifications**: Smooth animations for success/error feedback.

## 🛠️ Tech Stack
- **Backend**: Java 17, Spring Boot 3.1, Spring Security, Data JPA.
- **Database**: MySQL.
- **Frontend**: HTML5, CSS3 (Custom + Bootstrap 5), JS (Fetch API), Chart.js.

## 🚀 How to Run
1.  **Database**: Create a MySQL database named `ems_db`.
    - Update `src/main/resources/application.properties` with your MySQL credentials.
2.  **Backend**: Run the project:
    ```bash
    mvn spring-boot:run
    ```
3.  **Access**: Open `http://localhost:8080/index.html` in your browser.

## 🔑 Default Credentials
- **Admin**: `admin` / `admin123`
- **Employee**: `employee` / `emp123`

---
*Developed with ❤️ and focus on Best Practices.*
