package com.ems.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Data
@Table(name = "departments")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Department name is required")
    @Column(nullable = false, unique = true)
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @PositiveOrZero(message = "Max average salary cannot be negative")
    private Double maxSalary;
}
