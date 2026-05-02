package com.fintrack.service;

import com.fintrack.dto.SavingsGoalRequest;
import com.fintrack.dto.SavingsGoalResponse;
import com.fintrack.model.SavingsGoal;
import com.fintrack.model.User;
import com.fintrack.repository.SavingsGoalRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SavingsGoalService {
    private final SavingsGoalRepository savingsGoalRepository;
    private final CurrentUserService currentUserService;

    public SavingsGoalService(SavingsGoalRepository savingsGoalRepository, CurrentUserService currentUserService) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<SavingsGoalResponse> list() {
        User user = currentUserService.getCurrentUser();
        return savingsGoalRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(DtoMapper::toSavingsGoalResponse)
            .toList();
    }

    @Transactional
    public SavingsGoalResponse create(SavingsGoalRequest request) {
        User user = currentUserService.getCurrentUser();
        SavingsGoal goal = new SavingsGoal();
        goal.setUser(user);
        apply(goal, request);
        return DtoMapper.toSavingsGoalResponse(savingsGoalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse update(Long id, SavingsGoalRequest request) {
        User user = currentUserService.getCurrentUser();
        SavingsGoal goal = findOwned(id, user);
        apply(goal, request);
        return DtoMapper.toSavingsGoalResponse(goal);
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        savingsGoalRepository.delete(findOwned(id, user));
    }

    private SavingsGoal findOwned(Long id, User user) {
        return savingsGoalRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Savings goal not found"));
    }

    private void apply(SavingsGoal goal, SavingsGoalRequest request) {
        goal.setName(request.name().trim());
        goal.setTargetAmount(request.targetAmount());
        goal.setCurrentAmount(request.currentAmount());
        goal.setTargetDate(request.targetDate());
    }
}
