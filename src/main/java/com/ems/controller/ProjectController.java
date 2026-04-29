package com.ems.controller;

import com.ems.model.Project;
import com.ems.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
@Slf4j
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping
    public List<Project> getAllProjects() {
        log.info("Fetching all projects");
        return projectRepository.findAll();
    }

    @PostMapping
    public Project addProject(@Valid @RequestBody Project project) {
        log.info("Adding new project: {}", project.getTitle());
        return projectRepository.save(project);
    }

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id, @Valid @RequestBody Project projectDetails) {
        log.info("Updating project with ID {}: {}", id, projectDetails.getTitle());
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        project.setTitle(projectDetails.getTitle());
        project.setDescription(projectDetails.getDescription());
        project.setStatus(projectDetails.getStatus());
        project.setDeadline(projectDetails.getDeadline());
        project.setEmployee(projectDetails.getEmployee());
        return projectRepository.save(project);
    }

    @PatchMapping("/{id}/status/{status}")
    public Project updateProjectStatus(@PathVariable Long id, @PathVariable String status) {
        log.info("Updating project status for ID {}: {}", id, status);
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        project.setStatus(Project.Status.valueOf(status.toUpperCase()));
        return projectRepository.save(project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        log.info("Deleting project with ID: {}", id);
        projectRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
