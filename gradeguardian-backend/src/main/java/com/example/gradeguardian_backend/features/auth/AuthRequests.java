package com.example.gradeguardian_backend.features.auth;

public class AuthRequests {
    public static class SignUpRequest {
        public String name;
        public String email;
        public String password;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }
}