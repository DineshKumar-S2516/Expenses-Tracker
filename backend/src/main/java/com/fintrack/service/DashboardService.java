package com.fintrack.service;

import com.fintrack.dto.CategorySpending;
import com.fintrack.dto.DashboardResponse;
import com.fintrack.dto.TransactionItem;
import com.fintrack.model.Expense;
import com.fintrack.model.Income;
import com.fintrack.model.Payment;
import com.fintrack.model.User;
import com.fintrack.repository.ExpenseRepository;
import com.fintrack.repository.IncomeRepository;
import com.fintrack.repository.PaymentRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final PaymentRepository paymentRepository;
    private final CurrentUserService currentUserService;

    public DashboardService(
        ExpenseRepository expenseRepository,
        IncomeRepository incomeRepository,
        PaymentRepository paymentRepository,
        CurrentUserService currentUserService
    ) {
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
        this.paymentRepository = paymentRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        User user = currentUserService.getCurrentUser();
        BigDecimal totalIncome = incomeRepository.totalByUserId(user.getId());
        BigDecimal totalExpense = expenseRepository.totalByUserId(user.getId());
        BigDecimal balance = totalIncome.subtract(totalExpense);
        BigDecimal savings = balance.max(BigDecimal.ZERO);

        YearMonth currentMonth = YearMonth.now();
        LocalDate start = currentMonth.atDay(1);
        LocalDate end = currentMonth.atEndOfMonth();
        List<CategorySpending> monthlySpending = expenseRepository
            .categorySpendBetween(user.getId(), start, end)
            .stream()
            .map(row -> new CategorySpending(
                (String) row[0],
                (String) row[1],
                (BigDecimal) row[2]
            ))
            .toList();

        List<TransactionItem> recentTransactions = recentTransactions(user.getId());

        return new DashboardResponse(
            totalIncome,
            totalExpense,
            balance,
            savings,
            monthlySpending,
            recentTransactions
        );
    }

    private List<TransactionItem> recentTransactions(Long userId) {
        Stream<TransactionItem> expenses = expenseRepository.findTop5ByUserIdOrderByDateDescCreatedAtDesc(userId)
            .stream()
            .map(this::expenseItem);
        Stream<TransactionItem> income = incomeRepository.findTop5ByUserIdOrderByDateDescCreatedAtDesc(userId)
            .stream()
            .map(this::incomeItem);
        Stream<TransactionItem> payments = paymentRepository.findTop5ByUserIdOrderByPaymentDateDescCreatedAtDesc(userId)
            .stream()
            .map(this::paymentItem);

        return Stream.concat(Stream.concat(expenses, income), payments)
            .sorted(Comparator.comparing(TransactionItem::date).reversed())
            .limit(8)
            .toList();
    }

    private TransactionItem expenseItem(Expense expense) {
        return new TransactionItem(
            expense.getId(),
            "EXPENSE",
            expense.getCategory().getName(),
            expense.getAmount(),
            expense.getDate(),
            "POSTED"
        );
    }

    private TransactionItem incomeItem(Income income) {
        return new TransactionItem(
            income.getId(),
            "INCOME",
            income.getSource(),
            income.getAmount(),
            income.getDate(),
            "RECEIVED"
        );
    }

    private TransactionItem paymentItem(Payment payment) {
        return new TransactionItem(
            payment.getId(),
            "PAYMENT",
            payment.getPaymentMethod().name(),
            payment.getAmount(),
            payment.getPaymentDate(),
            payment.getStatus().name()
        );
    }
}
