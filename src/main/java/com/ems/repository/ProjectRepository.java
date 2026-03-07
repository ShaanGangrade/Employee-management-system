package com.ems.repository;

import com.ems.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByEmployeeId(Long employeeId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Project p WHERE p.employee.id = ?1")
    void deleteByEmployeeId(Long employeeId);
}
