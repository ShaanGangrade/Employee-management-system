package com.ems.service;

import com.ems.model.Employee;
import com.ems.model.User;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ProjectRepository;
import com.ems.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EmployeeService employeeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testDeleteEmployeeCompletely_Success() {
        // Arrange
        Long empId = 1L;
        Employee employee = new Employee();
        employee.setId(empId);
        User user = new User();
        user.setId(10L);
        employee.setUser(user);

        when(employeeRepository.findById(empId)).thenReturn(Optional.of(employee));

        // Act
        employeeService.deleteEmployeeCompletely(empId);

        // Assert
        verify(projectRepository, times(1)).deleteByEmployeeId(empId);
        verify(attendanceRepository, times(1)).deleteByUser(user);
        verify(employeeRepository, times(1)).delete(employee);
        verify(userRepository, times(1)).deleteById(10L);
    }

    @Test
    void testDeleteEmployeeCompletely_NotFound() {
        // Arrange
        Long empId = 1L;
        when(employeeRepository.findById(empId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            employeeService.deleteEmployeeCompletely(empId);
        });
    }
}
