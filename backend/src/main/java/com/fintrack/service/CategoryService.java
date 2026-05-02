package com.fintrack.service;

import com.fintrack.dto.CategoryRequest;
import com.fintrack.dto.CategoryResponse;
import com.fintrack.model.Category;
import com.fintrack.model.User;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.ExpenseRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final CurrentUserService currentUserService;

    public CategoryService(
        CategoryRepository categoryRepository,
        ExpenseRepository expenseRepository,
        BudgetRepository budgetRepository,
        CurrentUserService currentUserService
    ) {
        this.categoryRepository = categoryRepository;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        User user = currentUserService.getCurrentUser();
        return categoryRepository.findByUserIdOrderByNameAsc(user.getId())
            .stream()
            .map(DtoMapper::toCategoryResponse)
            .toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        User user = currentUserService.getCurrentUser();
        if (categoryRepository.existsByNameIgnoreCaseAndUserId(request.name().trim(), user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category already exists");
        }

        Category category = new Category();
        category.setUser(user);
        apply(category, request);
        return DtoMapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = findOwned(id, user);
        apply(category, request);
        return DtoMapper.toCategoryResponse(category);
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        Category category = findOwned(id, user);
        if (expenseRepository.existsByCategoryIdAndUserId(id, user.getId())
            || budgetRepository.existsByCategoryIdAndUserId(id, user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is in use by expenses or budgets");
        }
        categoryRepository.delete(category);
    }

    public Category findOwned(Long id, User user) {
        return categoryRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    private void apply(Category category, CategoryRequest request) {
        category.setName(request.name().trim());
        category.setColor(request.color().trim());
        category.setIcon(request.icon().trim());
    }
}
