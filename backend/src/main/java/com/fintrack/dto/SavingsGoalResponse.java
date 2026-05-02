package com.fintrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingsGoalResponse(
    Long id,
    String name,
    BigDecimal targetAmount,
    BigDecimal currentAmount,
    LocalDate targetDate,
    double percentComplete
) {
}
