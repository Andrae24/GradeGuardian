package com.example.gradeguardian_backend.features.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(unique = true) // Good practice for emails
    private String email;
    
    private String password;

    // --- CRITICAL FIX FOR PHOTO UPLOAD ---
    // @Lob tells JPA this is a Large Object. 
    // columnDefinition = "TEXT" ensures Supabase uses the TEXT type (unlimited length).
    @Lob
    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    // Getters and Setters
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}