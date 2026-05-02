package com.fintrack.repository;

import com.fintrack.model.Income;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByUserIdOrderByDateDescCreatedAtDesc(Long userId);

    List<Income> findTop5ByUserIdOrderByDateDescCreatedAtDesc(Long userId);

    Optional<Income> findByIdAndUserId(Long id, Long userId);

    @Query("select coalesce(sum(i.amount), 0) from Income i where i.user.id = :userId")
    BigDecimal totalByUserId(@Param("userId") Long userId);
}
