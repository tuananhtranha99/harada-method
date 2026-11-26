package com.harada.quest.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePillarRequest(
        @NotBlank(message = "Pillar title is required")
        @Size(max = 120, message = "Pillar title must be at most 120 characters")
        String title
) {
}

