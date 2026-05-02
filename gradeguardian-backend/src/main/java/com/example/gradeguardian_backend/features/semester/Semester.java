package com.example.gradeguardian_backend.features.semester;

import java.util.List;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "semesters")
@Data // <--- CRITICAL: This generates the getters/setters so Jackson can map the JSON
public class Semester {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    
    private String yearLevel;
    
    private String term;
    
    private Double gwa;

    private Integer courseCount;

    @ElementCollection
    private List<String> courseCodes;
}