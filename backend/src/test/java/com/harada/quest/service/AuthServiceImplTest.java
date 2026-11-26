package com.harada.quest.service;

import com.harada.quest.config.JwtService;
import com.harada.quest.dto.request.LoginRequest;
import com.harada.quest.dto.request.RegisterRequest;
import com.harada.quest.dto.response.AuthResponse;
import com.harada.quest.dto.response.UserProfileResponse;
import com.harada.quest.entity.User;
import com.harada.quest.exception.BusinessException;
import com.harada.quest.mapper.UserMapper;
import com.harada.quest.repository.UserRepository;
import com.harada.quest.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    private static final String TEST_SECRET = "ZGV2LW9ubHktc2VjcmV0LWtleS1jaGFuZ2UtaW4tcHJvZHVjdGlvbi0yNTYtYml0cw==";

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserMapper userMapper;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        JwtService jwtService = new JwtService(TEST_SECRET, 900_000L, 604_800_000L);
        authService = new AuthServiceImpl(userRepository, passwordEncoder, jwtService, userMapper);
    }

    @Test
    void register_createsUserAndReturnsTokens() {
        UUID userId = UUID.randomUUID();
        RegisterRequest request = new RegisterRequest("Hero@Example.com", "password123", "PixelHero");
        User saved = User.builder()
                .email("hero@example.com")
                .passwordHash("hashed")
                .characterName("PixelHero")
                .build();
        saved.setId(userId);
        UserProfileResponse profile = new UserProfileResponse(
                userId, "hero@example.com", "PixelHero", 1, 0, 100, 100, 0, 0);

        when(userRepository.existsByEmail("hero@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(userMapper.toProfileResponse(saved)).thenReturn(profile);

        AuthResponse response = authService.register(request);

        assertNotNull(response.accessToken());
        assertNotNull(response.refreshToken());
        assertEquals("PixelHero", response.user().characterName());
    }

    @Test
    void register_throwsConflictWhenEmailExists() {
        RegisterRequest request = new RegisterRequest("hero@example.com", "password123", "PixelHero");
        when(userRepository.existsByEmail("hero@example.com")).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> authService.register(request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void login_throwsUnauthorizedOnWrongPassword() {
        User user = User.builder()
                .email("hero@example.com")
                .passwordHash("hashed")
                .characterName("PixelHero")
                .build();
        when(userRepository.findByEmail("hero@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "hashed")).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> authService.login(new LoginRequest("hero@example.com", "wrongpass")));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }
}

