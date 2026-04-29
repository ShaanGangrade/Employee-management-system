package com.ems.controller;

import com.ems.model.LeaveRequest;
import com.ems.model.User;
import com.ems.repository.LeaveRequestRepository;
import com.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
@Slf4j
public class LeaveRequestController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(@Valid @RequestBody LeaveRequest leaveRequest) {
        log.info("Applying leave for user ID: {}", leaveRequest.getUser() != null ? leaveRequest.getUser().getId() : "null");
        if (leaveRequest.getUser() == null || leaveRequest.getUser().getId() == null) {
            log.warn("Leave application failed: User ID is required");
            return ResponseEntity.badRequest().body("User ID is required");
        }
        User user = userRepository.findById(leaveRequest.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        leaveRequest.setUser(user);
        leaveRequest.setStatus(LeaveRequest.Status.PENDING);

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        log.info("Leave applied successfully with ID: {}", saved.getId());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/all")
    public List<LeaveRequest> getAllLeaves() {
        log.info("Fetching all leave requests");
        return leaveRequestRepository.findAllByOrderByStartDateDesc();
    }

    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @PathVariable String status) {
        log.info("Updating leave status for ID {}: {}", id, status);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LeaveRequest not found"));
        leaveRequest.setStatus(LeaveRequest.Status.valueOf(status.toUpperCase()));
        return ResponseEntity.ok(leaveRequestRepository.save(leaveRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeave(@PathVariable Long id) {
        log.info("Deleting leave request with ID: {}", id);
        if (!leaveRequestRepository.existsById(id)) {
            log.warn("Delete failed: LeaveRequest not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
        leaveRequestRepository.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}
