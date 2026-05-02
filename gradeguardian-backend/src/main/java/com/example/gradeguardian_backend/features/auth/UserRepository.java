package com.example.gradeguardian_backend.features.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Transactional(readOnly = true)
    Optional<User> findByEmail(String email);
    
    /**
     * Used during registration to prevent duplicate accounts.
     */
    boolean existsByEmail(String email);
}