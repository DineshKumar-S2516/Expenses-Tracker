package com.fintrack.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingsGoalRequest(
    @NotBlank String name,
    @NotNull @DecimalMin("0.01") BigDecimal targetAmount,
    @NotNull @DecimalMin("0.00") BigDecimal currentAmount,
    LocalDate targetDate
) {
}
