package com.ems.service;

import com.ems.model.Attendance;
import com.ems.model.User;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    // Runs every day at 11:59 PM
    @Scheduled(cron = "0 59 23 * * ?")
    public void markAutomaticAbsence() {
        LocalDate today = LocalDate.now();
        List<User> allUsers = userRepository.findAll();

        for (User user : allUsers) {
            // Only mark absence for Employees, not Admins
            if (user.getRole() == User.Role.EMPLOYEE && attendanceRepository.findByUserAndDate(user, today).isEmpty()) {
                Attendance absence = new Attendance();
                absence.setUser(user);
                absence.setDate(today);
                absence.setStatus(Attendance.Status.ABSENT);
                attendanceRepository.save(absence);
            }
        }
        System.out.println("Automatic absence marking completed for " + today);
    }
}
