package com.ems.config;

import com.ems.model.Department;
import com.ems.model.User;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, DepartmentRepository departmentRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword("admin123");
                admin.setRole(User.Role.ADMIN);
                admin.setFullName("System Admin");
                userRepository.save(admin);

                User emp = new User();
                emp.setUsername("employee");
                emp.setPassword("emp123");
                emp.setRole(User.Role.EMPLOYEE);
                emp.setFullName("John Doe");
                userRepository.save(emp);

                Department hr = new Department();
                hr.setName("Human Resources");
                hr.setLocation("Building A");
                departmentRepository.save(hr);

                Department eng = new Department();
                eng.setName("Engineering");
                eng.setLocation("Building B");
                departmentRepository.save(eng);
            }
        };
    }
}
