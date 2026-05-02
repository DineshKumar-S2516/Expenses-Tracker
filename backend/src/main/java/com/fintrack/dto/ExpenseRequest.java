package com.fintrack.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
    @NotNull @DecimalMin("0.01") BigDecimal amount,
    @NotNull Long categoryId,
    @NotNull LocalDate date,
    String notes
) {
}
