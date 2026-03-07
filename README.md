# Employee Management System (EMS Pro)

Professional, classic, and robust Employee Management System built with **Spring Boot**, **MySQL**, and **Modern Frontend (HTML/CSS/JS)**.

## Features
- **Secure Login**: Authentication system for Admins.
- **Employee Directory**: Full CRUD (Create, Read, Update, Delete) for employees.
- **Department Management**: Categorize employees into departments.
- **Analytics Dashboard**: Real-time stats for Total Employees, Departments, and Payroll.
- **Premium UI**: Glassmorphism design and smooth animations.

## Tech Stack
- **Backend**: Java 17, Spring Boot 3, Spring Data JPA.
- **Database**: MySQL.
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (Fetch API).

## How to Run
1.  **Database**: Create a MySQL database named `ems_db`.
    - Update `src/main/resources/application.properties` with your MySQL username and password.
2.  **Backend**: Run the project using Maven:
    ```bash
    mvn spring-boot:run
    ```
3.  **Frontend**: Once the backend is running, open `http://localhost:8080/index.html` in your browser.

## Default Credentials
- **Username**: `admin`
- **Password**: `admin123`
