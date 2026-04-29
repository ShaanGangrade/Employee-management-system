package com.ems.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Project title is required")
    private String title;

    private String description;
    private LocalDate startDate = LocalDate.now();

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    public enum Status {
        PENDING, IN_PROGRESS, COMPLETED
    }
}
