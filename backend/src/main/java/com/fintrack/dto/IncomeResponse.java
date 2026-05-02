package com.fintrack.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record IncomeResponse(
    Long id,
    BigDecimal amount,
    String source,
    LocalDate date,
    String notes,
    Instant createdAt
) {
}
