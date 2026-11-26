package com.harada.quest.dto.response;

import java.util.UUID;

public record ActionResponse(
        UUID id,
        Short slotIndex,
        String title,
        Integer xpReward,
        boolean completedToday
) {
}

