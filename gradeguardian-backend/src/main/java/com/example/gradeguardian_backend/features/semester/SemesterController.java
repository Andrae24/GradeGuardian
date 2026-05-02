package com.example.gradeguardian_backend.features.semester;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/semesters")
// No @CrossOrigin here—let SecurityConfig handle it globally!
public class SemesterController {

    @Autowired
    private SemesterRepository semesterRepository;

    /**
     * SECURE SEMESTER FETCH: Used by GWA Hub.
     * Fixed the 405 error by adding the PostMapping that React is expecting.
     */
    @PostMapping("/my-semesters")
    public List<Semester> getSemesters(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        System.out.println(">>> Fetching semesters via POST for: " + email);
        return semesterRepository.findByUserEmail(email);
    }

    /**
     * DRILL-DOWN: Fetches details for a specific semester card.
     */
    @GetMapping("/{id}")
    public Semester getSemesterById(@PathVariable Long id) {
        return semesterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Semester not found with id: " + id));
    }

    /**
     * LEGACY GET: Keeping this for now but POST is preferred for email-based lookups.
     */
    @GetMapping("/user/{email}")
    public List<Semester> getSemestersByUser(@PathVariable String email) {
        return semesterRepository.findByUserEmail(email);
    }

    /**
     * PERSISTENCE: Saves a new Semester GWA card.
     */
    @PostMapping
    public Semester saveSemester(@RequestBody Semester semester) {
        return semesterRepository.save(semester);
    }

    /**
     * DELETE: Removes a semester record.
     */
    @DeleteMapping("/{id}")
    public void deleteSemester(@PathVariable Long id) {
        semesterRepository.deleteById(id);
    }
}