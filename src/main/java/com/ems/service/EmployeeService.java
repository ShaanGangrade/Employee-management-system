package com.ems.service;

import com.ems.model.Employee;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ProjectRepository;
import com.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void deleteEmployeeCompletely(Long id) {
        System.out.println("DEBUG: Starting deletion process for Employee ID: " + id);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));

        Long userId = (employee.getUser() != null) ? employee.getUser().getId() : null;

        // 1. Delete associated projects
        projectRepository.deleteByEmployeeId(id);
        System.out.println("DEBUG: Projects cleared");

        // 2. Delete associated attendance
        if (userId != null) {
            attendanceRepository.deleteByUser(employee.getUser());
            System.out.println("DEBUG: Attendance cleared");
        }

        // 3. Break relationship and delete Employee
        employee.setUser(null);
        employee.setDepartment(null);
        employeeRepository.saveAndFlush(employee);

        employeeRepository.delete(employee);
        employeeRepository.flush();
        System.out.println("DEBUG: Employee cleared");

        // 4. Delete User account if exists
        if (userId != null) {
            userRepository.deleteById(userId);
            userRepository.flush();
            System.out.println("DEBUG: User Account cleared");
        }
    }
}
