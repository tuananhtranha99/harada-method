package com.harada.quest.service;

import com.harada.quest.dto.request.LoginRequest;
import com.harada.quest.dto.request.RegisterRequest;
import com.harada.quest.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}

