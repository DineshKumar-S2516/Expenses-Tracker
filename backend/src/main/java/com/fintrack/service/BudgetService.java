package com.fintrack.service;

import com.fintrack.dto.BudgetRequest;
import com.fintrack.dto.BudgetResponse;
import com.fintrack.model.Budget;
import com.fintrack.model.Category;
import com.fintrack.model.User;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.ExpenseRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryService categoryService;
    private final CurrentUserService currentUserService;

    public BudgetService(
        BudgetRepository budgetRepository,
        ExpenseRepository expenseRepository,
        CategoryService categoryService,
        CurrentUserService currentUserService
    ) {
        this.budgetRepository = budgetRepository;
        this.expenseRepository = expenseRepository;
        this.categoryService = categoryService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> list() {
        User user = currentUserService.getCurrentUser();
        return budgetRepository.findByUserIdOrderByYearDescMonthDesc(user.getId())
            .stream()
            .map(budget -> DtoMapper.toBudgetResponse(budget, spentForBudget(user.getId(), budget)))
            .toList();
    }

    @Transactional
    public BudgetResponse create(BudgetRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = categoryService.findOwned(request.categoryId(), user);
        Budget budget = budgetRepository
            .findByUserIdAndCategoryIdAndMonthAndYear(
                user.getId(),
                category.getId(),
                request.month(),
                request.year()
            )
            .orElseGet(Budget::new);
        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonth(request.month());
        budget.setYear(request.year());
        budget.setMonthlyLimit(request.monthlyLimit());
        Budget saved = budgetRepository.save(budget);
        return DtoMapper.toBudgetResponse(saved, spentForBudget(user.getId(), saved));
    }

    @Transactional
    public BudgetResponse update(Long id, BudgetRequest request) {
        User user = currentUserService.getCurrentUser();
        Budget budget = findOwned(id, user);
        budget.setCategory(categoryService.findOwned(request.categoryId(), user));
        budget.setMonth(request.month());
        budget.setYear(request.year());
        budget.setMonthlyLimit(request.monthlyLimit());
        return DtoMapper.toBudgetResponse(budget, spentForBudget(user.getId(), budget));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        budgetRepository.delete(findOwned(id, user));
    }

    private Budget findOwned(Long id, User user) {
        return budgetRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));
    }

    private BigDecimal spentForBudget(Long userId, Budget budget) {
        YearMonth period = YearMonth.of(budget.getYear(), budget.getMonth());
        LocalDate start = period.atDay(1);
        LocalDate end = period.atEndOfMonth();
        return expenseRepository.totalByUserIdAndCategoryBetween(
            userId,
            budget.getCategory().getId(),
            start,
            end
        );
    }
}
