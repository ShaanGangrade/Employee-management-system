package com.ems.controller;

import com.ems.model.Employee;
import com.ems.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.transaction.annotation.Transactional;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private com.ems.service.EmployeeService employeeService;

    @Autowired
    private com.ems.repository.DepartmentRepository departmentRepository;

    @GetMapping
    @Transactional
    public List<Employee> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        for (Employee emp : employees) {
            if (emp.getUser() == null) {
                com.ems.model.User user = new com.ems.model.User();
                user.setUsername(emp.getEmail());
                user.setPassword("password123");
                user.setRole(com.ems.model.User.Role.EMPLOYEE);
                user.setFullName(emp.getFirstName() + " " + emp.getLastName());
                emp.setUser(user);
                employeeRepository.save(emp);
                System.out.println("Auto-created user for employee: " + emp.getFirstName());
            }
        }
        return employees;
    }

    private final String UPLOAD_DIR = System.getProperty("user.dir").replace("\\", "/") + "/uploads/";

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> addEmployee(
            @RequestPart("employee") String employeeJson,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Employee employee = mapper.readValue(employeeJson, Employee.class);

            if (photo != null && !photo.isEmpty()) {
                File dir = new File(UPLOAD_DIR);
                if (!dir.exists())
                    dir.mkdirs();

                String fileName = UUID.randomUUID().toString() + "_" + photo.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + fileName);
                Files.write(path, photo.getBytes());
                employee.setPhotoUrl("/uploads/" + fileName);
            }

            if (employee.getUser() == null) {
                com.ems.model.User user = new com.ems.model.User();
                user.setUsername(employee.getEmail());
                user.setPassword("password123");
                user.setRole(com.ems.model.User.Role.EMPLOYEE);
                user.setFullName(employee.getFirstName() + " " + employee.getLastName());
                employee.setUser(user);
            }

            if (employee.getDepartment() != null && employee.getDepartment().getId() != null) {
                com.ems.model.Department dept = departmentRepository.findById(employee.getDepartment().getId())
                        .orElse(null);
                if (dept != null && dept.getMaxSalary() != null && employee.getSalary() != null) {
                    if (employee.getSalary() > dept.getMaxSalary()) {
                        return ResponseEntity.badRequest()
                                .body("Error: Salary exceeds department's maximum limit of ₹" + dept.getMaxSalary());
                    }
                }
            }

            return ResponseEntity.ok(employeeRepository.save(employee));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long id,
            @RequestPart("employee") String employeeJson,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            Employee employee = employeeRepository.findById(id).orElseThrow();
            ObjectMapper mapper = new ObjectMapper();
            Employee employeeDetails = mapper.readValue(employeeJson, Employee.class);

            if (photo != null && !photo.isEmpty()) {
                File dir = new File(UPLOAD_DIR);
                if (!dir.exists())
                    dir.mkdirs();
                String fileName = UUID.randomUUID().toString() + "_" + photo.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + fileName);
                Files.write(path, photo.getBytes());
                employee.setPhotoUrl("/uploads/" + fileName);
            }

            if (employeeDetails.getDepartment() != null && employeeDetails.getDepartment().getId() != null) {
                com.ems.model.Department dept = departmentRepository.findById(employeeDetails.getDepartment().getId())
                        .orElse(null);
                if (dept != null && dept.getMaxSalary() != null && employeeDetails.getSalary() != null) {
                    if (employeeDetails.getSalary() > dept.getMaxSalary()) {
                        return ResponseEntity.badRequest()
                                .body("Error: Salary exceeds department's maximum limit of ₹" + dept.getMaxSalary());
                    }
                }
            } else if (employeeDetails.getDepartment() != null && employeeDetails.getDepartment().getId() == null) {
                employeeDetails.setDepartment(null);
            }

            employee.setFirstName(employeeDetails.getFirstName());
            employee.setLastName(employeeDetails.getLastName());
            employee.setEmail(employeeDetails.getEmail());
            employee.setPhoneNumber(employeeDetails.getPhoneNumber());
            employee.setAddress(employeeDetails.getAddress());
            employee.setSalary(employeeDetails.getSalary());
            employee.setDesignation(employeeDetails.getDesignation());
            employee.setDepartment(employeeDetails.getDepartment());

            return ResponseEntity.ok(employeeRepository.save(employee));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        try {
            employeeService.deleteEmployeeCompletely(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
