package com.harada.quest.dto.response;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String characterName,
        Integer characterLevel,
        Integer totalXp,
        Integer hp,
        Integer maxHp,
        Integer currentStreak,
        Integer consecutiveMissedDays
) {
}

