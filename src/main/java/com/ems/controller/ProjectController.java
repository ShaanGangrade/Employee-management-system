package com.ems.controller;

import com.ems.model.Project;
import com.ems.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @PostMapping
    public Project addProject(@RequestBody Project project) {
        return projectRepository.save(project);
    }

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
        Project project = projectRepository.findById(id).orElseThrow();
        project.setTitle(projectDetails.getTitle());
        project.setDescription(projectDetails.getDescription());
        project.setStatus(projectDetails.getStatus());
        project.setDeadline(projectDetails.getDeadline());
        project.setEmployee(projectDetails.getEmployee());
        return projectRepository.save(project);
    }

    @PatchMapping("/{id}/status/{status}")
    public Project updateProjectStatus(@PathVariable Long id, @PathVariable String status) {
        Project project = projectRepository.findById(id).orElseThrow();
        project.setStatus(Project.Status.valueOf(status.toUpperCase()));
        return projectRepository.save(project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
