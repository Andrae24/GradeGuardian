package com.example.gradeguardian_backend.features.auth;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") 
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    // Temporary storage for recovery codes (Email -> OTP)
    // For production, consider using Redis or a dedicated DB table with expiration
    private static final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    // --- SIGNUP ---
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> registerUser(@RequestBody AuthRequests.SignUpRequest request) {
        Map<String, String> response = new HashMap<>();
        
        if (isInvalid(request.name) || isInvalid(request.email) || isInvalid(request.password)) {
            response.put("error", "All fields are strictly required!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (request.password.length() < 6) {
            response.put("error", "Password must be at least 6 characters long!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (userRepository.existsByEmail(request.email)) {
            response.put("error", "Email is already taken!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        User newUser = new User();
        newUser.setName(request.name);
        newUser.setEmail(request.email);
        newUser.setPassword(passwordEncoder.encode(request.password));
        userRepository.save(newUser);

        response.put("message", "Registration successful!");
        return ResponseEntity.ok(response);
    }

    // --- LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> authenticateUser(@RequestBody AuthRequests.LoginRequest request) {
        Map<String, String> response = new HashMap<>();

        if (isInvalid(request.email) || isInvalid(request.password)) {
            response.put("error", "Email and password cannot be empty!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(request.email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(request.password, user.getPassword())) {
                response.put("message", "Login successful!");
                response.put("id", String.valueOf(user.getId()));
                response.put("name", user.getName()); 
                response.put("email", user.getEmail());
                response.put("photoUrl", user.getPhotoUrl() != null ? user.getPhotoUrl() : ""); 
                
                return ResponseEntity.ok(response);
            }
        }

        response.put("error", "Invalid email or password!");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // --- FORGOT PASSWORD: REQUEST CODE ---
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        String email = request.get("email");

        if (isInvalid(email)) {
            response.put("error", "Email is required!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("error", "No account found with this email.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Grade Guardian Recovery Code");
            message.setText("Your Night Owl recovery code is: " + otp + "\n\nThis code will expire shortly.");
            mailSender.send(message);

            response.put("message", "Recovery code sent to email.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Failed to send email. Please try again later.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // --- FORGOT PASSWORD: VERIFY CODE ---
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        String email = request.get("email");
        String otp = request.get("otp");

        if (otpStorage.containsKey(email) && otpStorage.get(email).equals(otp)) {
            response.put("message", "OTP Verified.");
            return ResponseEntity.ok(response);
        }

        response.put("error", "Invalid or expired recovery code.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // --- FORGOT PASSWORD: RESET PASSWORD ---
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (isInvalid(email) || isInvalid(newPassword)) {
            response.put("error", "Missing required fields!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            // Important: Clear the OTP so it can't be used again
            otpStorage.remove(email);

            response.put("message", "Password reset successful!");
            return ResponseEntity.ok(response);
        }

        response.put("error", "User not found.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // --- UPLOAD PHOTO ---
    @PostMapping("/upload-photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {
        
        Map<String, String> response = new HashMap<>();
        try {
            byte[] fileContent = file.getBytes();
            String encodedString = Base64.getEncoder().encodeToString(fileContent);
            String base64Image = "data:" + file.getContentType() + ";base64," + encodedString;

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setPhotoUrl(base64Image); 
                userRepository.save(user);

                response.put("photoUrl", base64Image);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            response.put("error", "Conversion failed");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // --- UPDATE PROFILE NAME ---
    @PostMapping("/update-profile")
    public ResponseEntity<Map<String, String>> updateProfile(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        
        String email = request.get("email");
        String newName = request.get("newName");

        if (isInvalid(email) || isInvalid(newName)) {
            response.put("error", "Email and name are required!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setName(newName);
            userRepository.save(user);

            response.put("message", "Profile updated successfully!");
            response.put("newName", user.getName());
            return ResponseEntity.ok(response);
        }

        response.put("error", "User not found!");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // --- CHANGE PASSWORD (LOGGED IN) ---
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        
        String email = request.get("email");
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (isInvalid(email) || isInvalid(currentPassword) || isInvalid(newPassword)) {
            response.put("error", "Missing required fields!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(currentPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);

                response.put("message", "Password updated successfully!");
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Current password is incorrect!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        }

        response.put("error", "User not found!");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    private boolean isInvalid(String str) {
        return str == null || str.trim().isEmpty();
    }
}