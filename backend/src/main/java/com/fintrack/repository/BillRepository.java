package com.fintrack.repository;

import com.fintrack.model.Bill;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUserIdOrderByDueDateAsc(Long userId);

    Optional<Bill> findByIdAndUserId(Long id, Long userId);
}
