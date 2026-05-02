package com.example.gradeguardian_backend.features.courses;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    
    // Standard fetch for the Dashboard
    List<Course> findByUserEmail(String email);
    
    // NEW: Logic for GWA Hub Modal
    // This will only return courses where the user has clicked "YES" on the Finals target
    List<Course> findByUserEmailAndIsGwaEligibleTrue(String email);
    
    // Checks if a course exists for a specific user based on Name OR Code
    boolean existsByTitleAndUserEmail(String title, String userEmail);
    boolean existsByCourseCodeAndUserEmail(String courseCode, String userEmail);
}