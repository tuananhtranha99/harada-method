package com.harada.quest.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateActionRequest(
        @NotBlank(message = "Action title is required")
        @Size(max = 200, message = "Action title must be at most 200 characters")
        String title
) {
}

