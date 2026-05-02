package com.fintrack.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ExpenseResponse(
    Long id,
    BigDecimal amount,
    CategoryResponse category,
    LocalDate date,
    String notes,
    Instant createdAt
) {
}
