package com.example.gradeguardian_backend.features.profile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.gradeguardian_backend.features.auth.User;
import com.example.gradeguardian_backend.features.auth.UserRepository;
import com.example.gradeguardian_backend.features.profile.dto.ProfileUpdateRequest;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/{email}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String email, 
            @RequestBody ProfileUpdateRequest request) {
        
        // 1. Find User by email (using trim to avoid trailing spaces in URL)
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // DEBUGGING: Very important! Check your VS Code terminal output after you click "Save"
        System.out.println("\n=== PROFILE UPDATE ATTEMPT ===");
        System.out.println("Target Email: " + email);
        System.out.println("Name from App: " + request.getName());
        System.out.println("Current Pass from App: [" + request.getCurrentPassword() + "]");
        System.out.println("Database Password:     [" + user.getPassword() + "]");

        // 2. Handle Name Update
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        
        // 3. Handle Password Change Logic
        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            
            // Validate that we have a database password and an input password to compare
            String dbPassword = (user.getPassword() != null) ? user.getPassword().trim() : "";
            String inputPassword = (request.getCurrentPassword() != null) ? request.getCurrentPassword().trim() : "";

            // The Core Security Check
            if (inputPassword.equals(dbPassword)) {
                user.setPassword(request.getNewPassword().trim());
                System.out.println("RESULT: Password validated. Updating to new password.");
            } else {
                System.out.println("RESULT: Password mismatch! Denying update.");
                // This 400 Bad Request triggers the error toast in Android
                return ResponseEntity.badRequest().body("Incorrect current password.");
            }
        }

        // 4. Commit to Database
        userRepository.save(user);
        System.out.println("STATUS: Profile saved successfully to MySQL.");
        System.out.println("==============================\n");

        return ResponseEntity.ok("Profile updated successfully");
    }
}