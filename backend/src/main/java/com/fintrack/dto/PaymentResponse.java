package com.fintrack.dto;

import com.fintrack.model.LinkedType;
import com.fintrack.model.PaymentMethod;
import com.fintrack.model.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record PaymentResponse(
    Long id,
    BigDecimal amount,
    PaymentMethod paymentMethod,
    PaymentStatus status,
    LinkedType linkedType,
    Long linkedId,
    LocalDate paymentDate,
    String note,
    Instant createdAt
) {
}
