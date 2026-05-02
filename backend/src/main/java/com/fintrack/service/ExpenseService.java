package com.fintrack.service;

import com.fintrack.dto.ExpenseRequest;
import com.fintrack.dto.ExpenseResponse;
import com.fintrack.model.Category;
import com.fintrack.model.Expense;
import com.fintrack.model.User;
import com.fintrack.repository.ExpenseRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final CategoryService categoryService;
    private final CurrentUserService currentUserService;

    public ExpenseService(
        ExpenseRepository expenseRepository,
        CategoryService categoryService,
        CurrentUserService currentUserService
    ) {
        this.expenseRepository = expenseRepository;
        this.categoryService = categoryService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> list(LocalDate date, Long categoryId) {
        User user = currentUserService.getCurrentUser();
        List<Expense> expenses;
        if (date != null && categoryId != null) {
            expenses = expenseRepository.findByUserIdAndDateAndCategoryIdOrderByDateDescCreatedAtDesc(
                user.getId(),
                date,
                categoryId
            );
        } else if (date != null) {
            expenses = expenseRepository.findByUserIdAndDateOrderByDateDescCreatedAtDesc(user.getId(), date);
        } else if (categoryId != null) {
            expenses = expenseRepository.findByUserIdAndCategoryIdOrderByDateDescCreatedAtDesc(user.getId(), categoryId);
        } else {
            expenses = expenseRepository.findByUserIdOrderByDateDescCreatedAtDesc(user.getId());
        }
        return expenses.stream().map(DtoMapper::toExpenseResponse).toList();
    }

    @Transactional
    public ExpenseResponse create(ExpenseRequest request) {
        User user = currentUserService.getCurrentUser();
        Expense expense = new Expense();
        expense.setUser(user);
        apply(expense, request, user);
        return DtoMapper.toExpenseResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse update(Long id, ExpenseRequest request) {
        User user = currentUserService.getCurrentUser();
        Expense expense = findOwned(id, user);
        apply(expense, request, user);
        return DtoMapper.toExpenseResponse(expense);
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        expenseRepository.delete(findOwned(id, user));
    }

    public Expense findOwned(Long id, User user) {
        return expenseRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
    }

    private void apply(Expense expense, ExpenseRequest request, User user) {
        Category category = categoryService.findOwned(request.categoryId(), user);
        expense.setCategory(category);
        expense.setAmount(request.amount());
        expense.setDate(request.date());
        expense.setNotes(request.notes());
    }
}
