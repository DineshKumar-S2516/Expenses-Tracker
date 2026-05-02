package com.fintrack.repository;

import com.fintrack.model.Payment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserIdOrderByPaymentDateDescCreatedAtDesc(Long userId);

    List<Payment> findTop5ByUserIdOrderByPaymentDateDescCreatedAtDesc(Long userId);

    Optional<Payment> findByIdAndUserId(Long id, Long userId);
}
