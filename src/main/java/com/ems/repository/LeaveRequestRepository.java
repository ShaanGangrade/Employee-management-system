package com.ems.repository;

import com.ems.model.LeaveRequest;
import com.ems.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByUserOrderByStartDateDesc(User user);

    List<LeaveRequest> findAllByOrderByStartDateDesc();
}
