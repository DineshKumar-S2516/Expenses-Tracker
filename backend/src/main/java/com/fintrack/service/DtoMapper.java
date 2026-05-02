package com.fintrack.service;

import com.fintrack.dto.BillResponse;
import com.fintrack.dto.BudgetResponse;
import com.fintrack.dto.CategoryResponse;
import com.fintrack.dto.ExpenseResponse;
import com.fintrack.dto.IncomeResponse;
import com.fintrack.dto.PaymentResponse;
import com.fintrack.dto.SavingsGoalResponse;
import com.fintrack.dto.UserResponse;
import com.fintrack.model.Bill;
import com.fintrack.model.Budget;
import com.fintrack.model.Category;
import com.fintrack.model.Expense;
import com.fintrack.model.Income;
import com.fintrack.model.Payment;
import com.fintrack.model.SavingsGoal;
import com.fintrack.model.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

public final class DtoMapper {
    private DtoMapper() {
    }

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }

    public static CategoryResponse toCategoryResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getColor(), category.getIcon());
    }

    public static ExpenseResponse toExpenseResponse(Expense expense) {
        return new ExpenseResponse(
            expense.getId(),
            expense.getAmount(),
            toCategoryResponse(expense.getCategory()),
            expense.getDate(),
            expense.getNotes(),
            expense.getCreatedAt()
        );
    }

    public static IncomeResponse toIncomeResponse(Income income) {
        return new IncomeResponse(
            income.getId(),
            income.getAmount(),
            income.getSource(),
            income.getDate(),
            income.getNotes(),
            income.getCreatedAt()
        );
    }

    public static BudgetResponse toBudgetResponse(Budget budget, BigDecimal spent) {
        BigDecimal remaining = budget.getMonthlyLimit().subtract(spent);
        return new BudgetResponse(
            budget.getId(),
            toCategoryResponse(budget.getCategory()),
            budget.getMonthlyLimit(),
            budget.getMonth(),
            budget.getYear(),
            spent,
            remaining,
            percent(spent, budget.getMonthlyLimit())
        );
    }

    public static SavingsGoalResponse toSavingsGoalResponse(SavingsGoal goal) {
        return new SavingsGoalResponse(
            goal.getId(),
            goal.getName(),
            goal.getTargetAmount(),
            goal.getCurrentAmount(),
            goal.getTargetDate(),
            percent(goal.getCurrentAmount(), goal.getTargetAmount())
        );
    }

    public static BillResponse toBillResponse(Bill bill) {
        boolean overdue = !bill.isPaid() && bill.getDueDate().isBefore(LocalDate.now());
        return new BillResponse(
            bill.getId(),
            bill.getName(),
            bill.getAmount(),
            bill.getDueDate(),
            bill.getFrequency(),
            bill.isPaid(),
            bill.getPaidAt(),
            overdue,
            bill.getNotes()
        );
    }

    public static PaymentResponse toPaymentResponse(Payment payment) {
        return new PaymentResponse(
            payment.getId(),
            payment.getAmount(),
            payment.getPaymentMethod(),
            payment.getStatus(),
            payment.getLinkedType(),
            payment.getLinkedId(),
            payment.getPaymentDate(),
            payment.getNote(),
            payment.getCreatedAt()
        );
    }

    private static double percent(BigDecimal value, BigDecimal target) {
        if (target == null || target.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        return value
            .multiply(BigDecimal.valueOf(100))
            .divide(target, 2, RoundingMode.HALF_UP)
            .doubleValue();
    }
}
