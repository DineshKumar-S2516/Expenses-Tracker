package com.fintrack.dto;

import com.fintrack.model.LinkedType;
import com.fintrack.model.PaymentMethod;
import com.fintrack.model.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentRequest(
    @NotNull @DecimalMin("0.01") BigDecimal amount,
    @NotNull PaymentMethod paymentMethod,
    @NotNull PaymentStatus status,
    @NotNull LinkedType linkedType,
    @NotNull Long linkedId,
    @NotNull LocalDate paymentDate,
    String note
) {
}
