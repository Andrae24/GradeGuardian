package com.example.gradeguardian_backend.features.semester;

import java.util.List; 

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {

    /**
     * Finds all semester records associated with a specific user email.
     * This is used to populate the GWA Hub list.
     */
    List<Semester> findByUserEmail(String userEmail);
    
}