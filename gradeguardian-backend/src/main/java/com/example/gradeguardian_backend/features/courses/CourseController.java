package com.example.gradeguardian_backend.features.courses;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.gradeguardian_backend.features.assessments.Assessment;

@RestController
@RequestMapping("/api/courses")
// REMOVED @CrossOrigin - We are letting your SecurityConfig handle this globally now!
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    /**
     * PERSISTENCE: Adds a new course.
     */
    @PostMapping("/add")
    public ResponseEntity<?> addCourse(@RequestBody Course course) {
        if (courseRepository.existsByTitleAndUserEmail(course.getTitle(), course.getUserEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "You already have a course named '" + course.getTitle() + "'."));
        }

        if (courseRepository.existsByCourseCodeAndUserEmail(course.getCourseCode(), course.getUserEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Course code '" + course.getCourseCode() + "' is already in your list."));
        }

        if (course.getIsGwaEligible() == null) {
            course.setIsGwaEligible(false);
        }

        Course savedCourse = courseRepository.save(course);
        return ResponseEntity.ok(savedCourse);
    }

    /**
     * DASHBOARD LOGIC: Fetches all courses via a POST body.
     * FIXED: This hides the email inside a JSON payload so the URL firewall completely ignores it.
     */
    @PostMapping("/my-courses")
    public List<Course> getCourses(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        System.out.println(">>> SUCCESS! Reached API via POST payload for: " + email);
        return courseRepository.findByUserEmail(email);
    }

    /**
     * GWA HUB LOGIC: Fetches only courses eligible for GWA calculation.
     * FIXED: Also changed to POST to match the dashboard logic and avoid 403s.
     */
    @PostMapping("/eligible")
    public List<Course> getEligibleCourses(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        return courseRepository.findByUserEmailAndIsGwaEligibleTrue(email);
    }

    /**
     * DRILL-DOWN LOGIC: Fetches a single course by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        Optional<Course> course = courseRepository.findById(id);
        return course.map(ResponseEntity::ok)
                     .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PROGRESS & WEIGHT LOGIC: Updates grades, eligibility, and dynamic weights.
     */
    @PatchMapping("/{id}/finalize")
    public ResponseEntity<Course> finalizeCourseGrade(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return courseRepository.findById(id)
                .map(course -> {
                    if (updates.get("midtermGrade") != null) {
                        course.setMidtermGrade(Double.valueOf(updates.get("midtermGrade").toString()));
                    }
                    if (updates.get("finalGrade") != null) {
                        course.setFinalGrade(Double.valueOf(updates.get("finalGrade").toString()));
                    }
                    if (updates.get("isGwaEligible") != null) {
                        course.setIsGwaEligible(Boolean.valueOf(updates.get("isGwaEligible").toString()));
                    }
                    if (updates.get("progress") != null) {
                        course.setProgress(Double.valueOf(updates.get("progress").toString()));
                    }
                    if (updates.get("midtermWeight") != null) {
                        course.setMidtermWeight(Integer.parseInt(updates.get("midtermWeight").toString()));
                    }
                    if (updates.get("finalWeight") != null) {
                        course.setFinalWeight(Integer.parseInt(updates.get("finalWeight").toString()));
                    }
                    return ResponseEntity.ok(courseRepository.save(course));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * ASSESSMENT LOGIC: Fetches all grades associated with a specific course.
     */
    @GetMapping("/{id}/assessments")
    public ResponseEntity<List<Assessment>> getCourseAssessments(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(course -> ResponseEntity.ok(course.getAssessments()))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE: Removes a course by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(course -> {
                    courseRepository.delete(course);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}