package com.harada.quest.dto.response;

import java.util.List;
import java.util.UUID;

public record DashboardResponse(
        UserProfileResponse user,
        UUID goalId,
        String goalTitle,
        String goalPurpose,
        List<PillarResponse> pillars,
        List<GearItemResponse> unlockedGear
) {
}
