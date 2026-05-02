package com.example.gradeguardian_backend.features.assessments;
import com.example.gradeguardian_backend.features.courses.Course;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "Quiz 1", "Prelim Exam"

    @Column(nullable = false)
    private Double weight; // e.g., 20.0 (for 20%)

    @Column(nullable = false)
    private Double score; // e.g., 45.0

    @Column(nullable = false)
    private Double total; // e.g., 50.0

    @Column(nullable = false)
    private String period; // "MIDTERM" or "FINALS"

    private LocalDate date = LocalDate.now(); // Automatically sets the date added

    // --- RELATIONSHIP LOGIC ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore // CRITICAL: Prevents infinite loops when converting to JSON
    private Course course;
}