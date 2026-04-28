package com.ems.controller;

import com.ems.model.Attendance;
import com.ems.model.Employee;
import com.ems.model.User;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/mark/{employeeId}/{status}")
    public ResponseEntity<?> markAttendance(@PathVariable Long employeeId, @PathVariable String status) {
        try {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

            User user = employee.getUser();
            if (user == null) {
                // Auto-create user if missing
                user = new User();
                user.setUsername(employee.getEmail());
                user.setPassword("password123");
                user.setRole(User.Role.EMPLOYEE);
                user.setFullName(employee.getFirstName() + " " + employee.getLastName());
                employee.setUser(user);
                employeeRepository.save(employee);
                user = employee.getUser();
            }

            LocalDate today = LocalDate.now();
            Optional<Attendance> existing = attendanceRepository.findByUserAndDate(user, today);

            Attendance attendance = existing.orElse(new Attendance());
            attendance.setUser(user);
            attendance.setDate(today);

            if (attendance.getCheckInTime() == null) {
                attendance.setCheckInTime(LocalTime.now());
            }

            // Validate status
            String statusUpper = status.toUpperCase();
            attendance.setStatus(Attendance.Status.valueOf(statusUpper));

            Attendance saved = attendanceRepository.save(attendance);
            System.out.println("Attendance saved for employee " + employeeId + " with status " + statusUpper);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to mark attendance: " + e.getMessage());
        }
    }

    @PostMapping("/punch-face/{employeeId}")
    public ResponseEntity<?> punchFaceAttendance(@PathVariable Long employeeId) {
        try {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

            User user = employee.getUser();
            if (user == null) {
                user = new User();
                user.setUsername(employee.getEmail());
                user.setPassword("password123");
                user.setRole(User.Role.EMPLOYEE);
                user.setFullName(employee.getFirstName() + " " + employee.getLastName());
                employee.setUser(user);
                employeeRepository.save(employee);
                user = employee.getUser();
            }

            LocalDate today = LocalDate.now();
            Optional<Attendance> existing = attendanceRepository.findByUserAndDate(user, today);

            Attendance attendance;
            if (existing.isPresent()) {
                attendance = existing.get();
                if (attendance.getCheckOutTime() == null) {
                    attendance.setCheckOutTime(LocalTime.now());

                    // Simple duration logic for Half Day vs Full Day
                    java.time.Duration duration = java.time.Duration.between(attendance.getCheckInTime(),
                            attendance.getCheckOutTime());
                    long hours = duration.toHours();

                    if (hours >= 8) {
                        attendance.setStatus(Attendance.Status.PRESENT);
                    } else {
                        // Less than 8 hours -> Half Day automatically
                        attendance.setStatus(Attendance.Status.HALF_DAY);
                    }
                } else {
                    return ResponseEntity.ok("Already punched out for today.");
                }
            } else {
                attendance = new Attendance();
                attendance.setUser(user);
                attendance.setDate(today);
                attendance.setCheckInTime(LocalTime.now());
                attendance.setStatus(Attendance.Status.PRESENT);
            }

            Attendance saved = attendanceRepository.save(attendance);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to punch attendance: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public List<Attendance> getUserAttendance(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return attendanceRepository.findByUserOrderByDateDesc(user);
    }

    @GetMapping("/all")
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }
}
