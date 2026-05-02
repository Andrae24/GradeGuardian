package com.example.gradeguardian_backend.features.courses;

import java.util.ArrayList;
import java.util.List;

import com.example.gradeguardian_backend.features.assessments.Assessment;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "courses")
@Getter
@Setter // Replaced @Data to prevent StackOverflow recursion with the assessments list
public class Course {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String courseCode; 
    private String title;      
    
    // CHANGED to Integer to handle database NULLs safely
    private Integer units;         
    
    private String color;
    private String bg;
    
    private Double progress;      
    private Double midtermGrade;  
    private Double finalGrade;    
    
    private Boolean isGwaEligible = false;
    private String userEmail; 

    // CHANGED to Integer to prevent 500 crashes on legacy DB rows
    @Column(name = "midterm_weight")
    private Integer midtermWeight = 50; 

    // CHANGED to Integer
    @Column(name = "final_weight")
    private Integer finalWeight = 50; 

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Assessment> assessments = new ArrayList<>();
}