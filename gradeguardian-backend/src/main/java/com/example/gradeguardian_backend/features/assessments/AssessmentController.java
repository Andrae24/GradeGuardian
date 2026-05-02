package com.example.gradeguardian_backend.features.assessments;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.gradeguardian_backend.features.courses.CourseRepository;

@RestController
@RequestMapping("/api/assessments")
@CrossOrigin(origins = "http://localhost:5173")
public class AssessmentController {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    // SAVE: POST http://localhost:8080/api/assessments/course/11
    @PostMapping("/course/{courseId}")
    public ResponseEntity<Assessment> addAssessment(@PathVariable Long courseId, @RequestBody Assessment assessment) {
        return courseRepository.findById(courseId).map(course -> {
            assessment.setCourse(course);
            return ResponseEntity.ok(assessmentRepository.save(assessment));
        }).orElse(ResponseEntity.notFound().build());
    }

    // FETCH: GET http://localhost:8080/api/assessments/course/11
    @GetMapping("/course/{courseId}")
    public List<Assessment> getAssessmentsByCourse(@PathVariable Long courseId) { // Fixed: matched name to path variable
        return assessmentRepository.findByCourseId(courseId);
    }

    @DeleteMapping("/{id}")
        public ResponseEntity<?> deleteAssessment(@PathVariable Long id) {
            return assessmentRepository.findById(id)
                    .map(assessment -> {
                        assessmentRepository.delete(assessment);
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        }

}
