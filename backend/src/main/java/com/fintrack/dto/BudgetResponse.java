package com.fintrack.dto;

import java.math.BigDecimal;

public record BudgetResponse(
    Long id,
    CategoryResponse category,
    BigDecimal monthlyLimit,
    Integer month,
    Integer year,
    BigDecimal spent,
    BigDecimal remaining,
    double percentUsed
) {
}
