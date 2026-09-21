package com.app.moviematcher.auth.service;

import com.app.moviematcher.auth.dto.AuthRequest;
import com.app.moviematcher.auth.dto.AuthResponse;

public interface AuthService {

    AuthResponse register(AuthRequest request);

    AuthResponse login(AuthRequest request);
}