package com.ems.config;

import com.ems.model.Department;
import com.ems.model.User;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, DepartmentRepository departmentRepository,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE attendance MODIFY COLUMN status VARCHAR(50)");
            } catch (Exception e) {
                System.out.println("Could not alter attendance status column: " + e.getMessage());
            }

            // Ensure Admin exists and has encrypted password
            userRepository.findByUsername("admin").ifPresentOrElse(
                admin -> {
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    userRepository.save(admin);
                },
                () -> {
                    User admin = new User();
                    admin.setUsername("admin");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setRole(User.Role.ADMIN);
                    admin.setFullName("System Admin");
                    userRepository.save(admin);
                }
            );

            // Ensure Employee exists and has encrypted password
            userRepository.findByUsername("employee").ifPresentOrElse(
                emp -> {
                    emp.setPassword(passwordEncoder.encode("emp123"));
                    userRepository.save(emp);
                },
                () -> {
                    User emp = new User();
                    emp.setUsername("employee");
                    emp.setPassword(passwordEncoder.encode("emp123"));
                    emp.setRole(User.Role.EMPLOYEE);
                    emp.setFullName("John Doe");
                    userRepository.save(emp);
                }
            );

            if (departmentRepository.count() == 0) {
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
