package com.app.moviematcher.auth.controller;

import com.app.moviematcher.auth.dto.AuthRequest;
import com.app.moviematcher.auth.dto.AuthResponse;
import com.app.moviematcher.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller managing authentication operations (registration and login).
 * Routes mapped under '/api/v1/auth/**' are publicly accessible as defined in SecurityConfig.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    // Program to interface: inject AuthService interface rather than its concrete implementation
    private final AuthService authService;

    /**
     * Explicit constructor injection without Lombok to adhere to project constraints.
     * Spring automatically injects the AuthService implementation bean.
     */
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Registers a new user account with default role USER and generates a JWT token.
     *
     * @param request AuthRequest containing email and raw password.
     *                The @Valid annotation triggers Jakarta validation before executing method logic.
     * @return ResponseEntity with HTTP 201 Created and the AuthResponse payload (token, email, role).
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        // Delegate user creation, password hashing, and token issuance to the service layer
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticates existing user credentials and generates a JWT token.
     *
     * @param request AuthRequest containing credentials.
     * @return ResponseEntity with HTTP 200 OK and the AuthResponse payload (token, email, role).
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        // Authenticate via AuthenticationManager and issue token
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}