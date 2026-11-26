package com.harada.quest.exception;

import java.time.Instant;
import java.util.Map;

/**
 * Standardized error payload returned by {@link GlobalExceptionHandler}.
 */
public record ErrorResponse(
        int status,
        String error,
        String message,
        Map<String, String> fieldErrors,
        Instant timestamp
) {
}

