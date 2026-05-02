package com.fintrack.controller;

import com.fintrack.dto.SavingsGoalRequest;
import com.fintrack.dto.SavingsGoalResponse;
import com.fintrack.service.SavingsGoalService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/savings-goals")
public class SavingsGoalController {
    private final SavingsGoalService savingsGoalService;

    public SavingsGoalController(SavingsGoalService savingsGoalService) {
        this.savingsGoalService = savingsGoalService;
    }

    @GetMapping
    public List<SavingsGoalResponse> list() {
        return savingsGoalService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SavingsGoalResponse create(@Valid @RequestBody SavingsGoalRequest request) {
        return savingsGoalService.create(request);
    }

    @PutMapping("/{id}")
    public SavingsGoalResponse update(@PathVariable Long id, @Valid @RequestBody SavingsGoalRequest request) {
        return savingsGoalService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        savingsGoalService.delete(id);
    }
}
