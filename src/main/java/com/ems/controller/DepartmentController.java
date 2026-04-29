package com.ems.controller;

import com.ems.model.Department;
import com.ems.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
@Slf4j
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping
    public List<Department> getAllDepartments() {
        log.info("Fetching all departments");
        return departmentRepository.findAll();
    }

    @PostMapping
    public Department addDepartment(@Valid @RequestBody Department department) {
        log.info("Adding new department: {}", department.getName());
        return departmentRepository.save(department);
    }

    @PutMapping("/{id}")
    public Department updateDepartment(@PathVariable Long id, @Valid @RequestBody Department departmentDetails) {
        log.info("Updating department with ID {}: {}", id, departmentDetails.getName());
        Department department = departmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Department not found"));
        department.setName(departmentDetails.getName());
        department.setLocation(departmentDetails.getLocation());
        department.setMaxSalary(departmentDetails.getMaxSalary());
        return departmentRepository.save(department);
    }

    @DeleteMapping("/{id}")
    public void deleteDepartment(@PathVariable Long id) {
        log.info("Deleting department with ID: {}", id);
        departmentRepository.deleteById(id);
    }
}
