package com.ems.repository;

import com.ems.model.Attendance;
import com.ems.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByUserAndDate(User user, LocalDate date);

    List<Attendance> findByUserOrderByDateDesc(User user);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Attendance a WHERE a.user = ?1")
    void deleteByUser(User user);
}
