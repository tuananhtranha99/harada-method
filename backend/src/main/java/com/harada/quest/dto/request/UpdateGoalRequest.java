package com.harada.quest.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateGoalRequest(
        @NotBlank(message = "Goal title is required")
        @Size(max = 200, message = "Goal title must be at most 200 characters")
        String title,

        String purpose
) {
}

