package com.example.gradeguardian_backend.features.profile.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProfileUpdateRequest {
    private String name;

    @JsonProperty("currentPassword") // Matches Android key
    private String currentPassword;

    @JsonProperty("newPassword")     // Matches Android key
    private String newPassword;

    // Getters and Setters are MANDATORY
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}