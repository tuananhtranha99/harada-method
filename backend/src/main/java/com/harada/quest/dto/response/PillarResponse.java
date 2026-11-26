package com.harada.quest.dto.response;

import java.util.List;
import java.util.UUID;

public record PillarResponse(
        UUID id,
        Short slotIndex,
        String title,
        String statCode,
        Integer statLevel,
        Integer statXp,
        boolean litToday,
        List<ActionResponse> actions
) {
}

