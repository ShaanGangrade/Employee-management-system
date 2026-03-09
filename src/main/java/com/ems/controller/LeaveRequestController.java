package com.ems.controller;

import com.ems.model.LeaveRequest;
import com.ems.model.User;
import com.ems.repository.LeaveRequestRepository;
import com.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(@RequestBody LeaveRequest leaveRequest) {
        if (leaveRequest.getUser() == null || leaveRequest.getUser().getId() == null) {
            return ResponseEntity.badRequest().body("User ID is required");
        }
        User user = userRepository.findById(leaveRequest.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        leaveRequest.setUser(user);
        leaveRequest.setStatus(LeaveRequest.Status.PENDING);

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/all")
    public List<LeaveRequest> getAllLeaves() {
        return leaveRequestRepository.findAllByOrderByStartDateDesc();
    }

    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @PathVariable String status) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LeaveRequest not found"));
        leaveRequest.setStatus(LeaveRequest.Status.valueOf(status.toUpperCase()));
        return ResponseEntity.ok(leaveRequestRepository.save(leaveRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeave(@PathVariable Long id) {
        if (!leaveRequestRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        leaveRequestRepository.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}
