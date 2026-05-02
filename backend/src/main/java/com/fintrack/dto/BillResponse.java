package com.fintrack.dto;

import com.fintrack.model.BillFrequency;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record BillResponse(
    Long id,
    String name,
    BigDecimal amount,
    LocalDate dueDate,
    BillFrequency frequency,
    boolean paid,
    Instant paidAt,
    boolean overdue,
    String notes
) {
}
