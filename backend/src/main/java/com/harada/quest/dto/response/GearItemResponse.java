package com.harada.quest.dto.response;

import java.util.UUID;

public record GearItemResponse(
        UUID id,
        String code,
        String name,
        String category,
        Integer requiredLevel,
        String spriteKey,
        Boolean equipped
) {
}

