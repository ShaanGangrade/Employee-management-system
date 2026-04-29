package com.ems.controller;

import com.ems.repository.EmployeeRepository;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.AttendanceRepository;
import com.ems.model.Attendance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalEmployees = employeeRepository.count();
        long totalDepartments = departmentRepository.count();
        
        List<Attendance> todayAttendance = attendanceRepository.findByDate(LocalDate.now());
        long presentCount = todayAttendance.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus().toString()) || "HALF_DAY".equalsIgnoreCase(a.getStatus().toString()))
                .count();
        long absentCount = totalEmployees - presentCount;

        stats.put("totalEmployees", totalEmployees);
        stats.put("totalDepartments", totalDepartments);
        stats.put("presentToday", presentCount);
        stats.put("absentToday", absentCount);
        
        return stats;
    }
}
