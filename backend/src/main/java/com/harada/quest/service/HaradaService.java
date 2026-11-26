package com.harada.quest.service;

import com.harada.quest.dto.request.CreateActionRequest;
import com.harada.quest.dto.request.UpdateGoalRequest;
import com.harada.quest.dto.request.UpdatePillarRequest;
import com.harada.quest.dto.response.DashboardResponse;

import java.util.UUID;

public interface HaradaService {
    DashboardResponse getDashboard(UUID userId);
    DashboardResponse updateGoal(UUID userId, UpdateGoalRequest request);
    DashboardResponse updatePillar(UUID userId, Short slotIndex, UpdatePillarRequest request);
    DashboardResponse addAction(UUID userId, Short slotIndex, CreateActionRequest request);
    DashboardResponse toggleActionToday(UUID userId, UUID actionId);
}

