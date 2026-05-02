package com.fintrack.dto;

import com.fintrack.model.BillFrequency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record BillRequest(
    @NotBlank String name,
    @NotNull @DecimalMin("0.01") BigDecimal amount,
    @NotNull LocalDate dueDate,
    @NotNull BillFrequency frequency,
    String notes
) {
}
