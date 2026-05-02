package com.example.gradeguardian_backend.features.assessments;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    // This helps fetch grades for a specific course
    List<Assessment> findByCourseId(Long courseId);
}