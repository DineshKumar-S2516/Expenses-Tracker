package com.fintrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionItem(
    Long id,
    String type,
    String title,
    BigDecimal amount,
    LocalDate date,
    String status
) {
}
