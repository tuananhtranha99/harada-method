package com.harada.quest.controller;

import com.harada.quest.common.ApiResponse;
import com.harada.quest.dto.request.CreateActionRequest;
import com.harada.quest.dto.request.UpdateGoalRequest;
import com.harada.quest.dto.request.UpdatePillarRequest;
import com.harada.quest.dto.response.DashboardResponse;
import com.harada.quest.service.HaradaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/harada")
@RequiredArgsConstructor
@Tag(name = "Harada Quest", description = "Endpoints for Open Window 64 goals, pillars, and daily actions")
@SecurityRequirement(name = "bearerAuth")
public class HaradaController {

    private final HaradaService haradaService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get current user Harada dashboard (goal, 8 pillars, gear, streaks)")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        DashboardResponse response = haradaService.getDashboard(userId);
        return ResponseEntity.ok(ApiResponse.ok("Dashboard loaded", response));
    }

    @PutMapping("/goal")
    @Operation(summary = "Update center Harada goal title or purpose")
    public ResponseEntity<ApiResponse<DashboardResponse>> updateGoal(
            Authentication authentication,
            @Valid @RequestBody UpdateGoalRequest request) {
        UUID userId = extractUserId(authentication);
        DashboardResponse response = haradaService.updateGoal(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Goal updated", response));
    }

    @PutMapping("/pillars/{slotIndex}")
    @Operation(summary = "Update pillar title by slot index (1 to 8)")
    public ResponseEntity<ApiResponse<DashboardResponse>> updatePillar(
            Authentication authentication,
            @PathVariable Short slotIndex,
            @Valid @RequestBody UpdatePillarRequest request) {
        UUID userId = extractUserId(authentication);
        DashboardResponse response = haradaService.updatePillar(userId, slotIndex, request);
        return ResponseEntity.ok(ApiResponse.ok("Pillar updated", response));
    }

    @PostMapping("/pillars/{slotIndex}/actions")
    @Operation(summary = "Add an action to a pillar (max 8 per pillar)")
    public ResponseEntity<ApiResponse<DashboardResponse>> addAction(
            Authentication authentication,
            @PathVariable Short slotIndex,
            @Valid @RequestBody CreateActionRequest request) {
        UUID userId = extractUserId(authentication);
        DashboardResponse response = haradaService.addAction(userId, slotIndex, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Action added", response));
    }

    @PostMapping("/actions/{actionId}/toggle")
    @Operation(summary = "Toggle today's completion for an action (awards/deducts XP and updates streak)")
    public ResponseEntity<ApiResponse<DashboardResponse>> toggleActionToday(
            Authentication authentication,
            @PathVariable UUID actionId) {
        UUID userId = extractUserId(authentication);
        DashboardResponse response = haradaService.toggleActionToday(userId, actionId);
        return ResponseEntity.ok(ApiResponse.ok("Action toggled", response));
    }

    private UUID extractUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
