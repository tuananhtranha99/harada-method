package com.harada.quest.dto.response;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserProfileResponse user
) {
}

