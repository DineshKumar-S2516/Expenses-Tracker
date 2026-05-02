package com.fintrack.service;

import com.fintrack.dto.IncomeRequest;
import com.fintrack.dto.IncomeResponse;
import com.fintrack.model.Income;
import com.fintrack.model.User;
import com.fintrack.repository.IncomeRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class IncomeService {
    private final IncomeRepository incomeRepository;
    private final CurrentUserService currentUserService;

    public IncomeService(IncomeRepository incomeRepository, CurrentUserService currentUserService) {
        this.incomeRepository = incomeRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<IncomeResponse> list() {
        User user = currentUserService.getCurrentUser();
        return incomeRepository.findByUserIdOrderByDateDescCreatedAtDesc(user.getId())
            .stream()
            .map(DtoMapper::toIncomeResponse)
            .toList();
    }

    @Transactional
    public IncomeResponse create(IncomeRequest request) {
        User user = currentUserService.getCurrentUser();
        Income income = new Income();
        income.setUser(user);
        apply(income, request);
        return DtoMapper.toIncomeResponse(incomeRepository.save(income));
    }

    @Transactional
    public IncomeResponse update(Long id, IncomeRequest request) {
        User user = currentUserService.getCurrentUser();
        Income income = findOwned(id, user);
        apply(income, request);
        return DtoMapper.toIncomeResponse(income);
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        incomeRepository.delete(findOwned(id, user));
    }

    private Income findOwned(Long id, User user) {
        return incomeRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Income not found"));
    }

    private void apply(Income income, IncomeRequest request) {
        income.setAmount(request.amount());
        income.setSource(request.source().trim());
        income.setDate(request.date());
        income.setNotes(request.notes());
    }
}
