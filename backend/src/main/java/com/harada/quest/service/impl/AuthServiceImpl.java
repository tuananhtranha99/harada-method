package com.harada.quest.service.impl;

import com.harada.quest.config.JwtService;
import com.harada.quest.dto.request.LoginRequest;
import com.harada.quest.dto.request.RegisterRequest;
import com.harada.quest.dto.response.AuthResponse;
import com.harada.quest.entity.User;
import com.harada.quest.exception.BusinessException;
import com.harada.quest.mapper.UserMapper;
import com.harada.quest.repository.UserRepository;
import com.harada.quest.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("Email is already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .characterName(request.characterName().trim())
                .build();

        User saved = userRepository.save(user);
        log.info("Registered new Harada character userId={}", saved.getId());
        return buildAuthResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());
        return new AuthResponse(accessToken, refreshToken, userMapper.toProfileResponse(user));
    }
}

