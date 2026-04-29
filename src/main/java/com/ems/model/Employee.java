package com.ems.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Data
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(min = 10, max = 15, message = "Phone number should be between 10 and 15 characters")
    private String phoneNumber;

    private String address;
    private String photoUrl;

    @NotNull(message = "Salary is required")
    @PositiveOrZero(message = "Salary cannot be negative")
    private Double salary;

    @NotBlank(message = "Designation is required")
    private String designation;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    private User user;
}
