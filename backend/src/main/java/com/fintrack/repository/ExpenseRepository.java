package com.fintrack.repository;

import com.fintrack.model.Expense;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserIdOrderByDateDescCreatedAtDesc(Long userId);

    List<Expense> findTop5ByUserIdOrderByDateDescCreatedAtDesc(Long userId);

    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    List<Expense> findByUserIdAndDateOrderByDateDescCreatedAtDesc(Long userId, LocalDate date);

    List<Expense> findByUserIdAndCategoryIdOrderByDateDescCreatedAtDesc(Long userId, Long categoryId);

    List<Expense> findByUserIdAndDateAndCategoryIdOrderByDateDescCreatedAtDesc(
        Long userId,
        LocalDate date,
        Long categoryId
    );

    boolean existsByCategoryIdAndUserId(Long categoryId, Long userId);

    @Query("select coalesce(sum(e.amount), 0) from Expense e where e.user.id = :userId")
    BigDecimal totalByUserId(@Param("userId") Long userId);

    @Query("""
        select coalesce(sum(e.amount), 0)
        from Expense e
        where e.user.id = :userId and e.date between :start and :end
        """)
    BigDecimal totalByUserIdBetween(
        @Param("userId") Long userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    @Query("""
        select coalesce(sum(e.amount), 0)
        from Expense e
        where e.user.id = :userId
          and e.category.id = :categoryId
          and e.date between :start and :end
        """)
    BigDecimal totalByUserIdAndCategoryBetween(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    @Query("""
        select e.category.name, e.category.color, coalesce(sum(e.amount), 0)
        from Expense e
        where e.user.id = :userId and e.date between :start and :end
        group by e.category.name, e.category.color
        order by sum(e.amount) desc
        """)
    List<Object[]> categorySpendBetween(
        @Param("userId") Long userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );
}
