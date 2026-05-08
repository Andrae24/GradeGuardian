package com.example.gradeguardian_backend.features.profile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // Import this
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

    @Autowired
    private PasswordEncoder passwordEncoder; // Inject the encoder used by your Web app

    @PutMapping("/{email}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String email, 
            @RequestBody ProfileUpdateRequest request) {
        
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        System.out.println("\n=== PROFILE UPDATE ATTEMPT ===");
        System.out.println("Target Email: " + email);
        
        // 1. Handle Name Update
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        
        // 2. Handle Password Change Logic
        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            
            String rawCurrentPassword = (request.getCurrentPassword() != null) ? request.getCurrentPassword().trim() : "";
            String encodedDbPassword = user.getPassword();

            // CRITICAL: Use passwordEncoder.matches() for BCrypt comparison
            if (passwordEncoder.matches(rawCurrentPassword, encodedDbPassword)) {
                
                // Encode the NEW password before saving so it remains compatible with Web login
                String hashedNewPassword = passwordEncoder.encode(request.getNewPassword().trim());
                user.setPassword(hashedNewPassword);
                
                System.out.println("RESULT: Password validated with BCrypt. Updating to new hash.");
            } else {
                System.out.println("RESULT: Password mismatch! BCrypt verification failed.");
                return ResponseEntity.badRequest().body("Incorrect current password.");
            }
        }

        // 3. Commit to Database
        userRepository.save(user);
        System.out.println("STATUS: Profile saved successfully to Database.");
        System.out.println("==============================\n");

        return ResponseEntity.ok("Profile updated successfully");
    }
}