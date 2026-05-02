package com.fintrack.service;

import com.fintrack.dto.BillRequest;
import com.fintrack.dto.BillResponse;
import com.fintrack.model.Bill;
import com.fintrack.model.User;
import com.fintrack.repository.BillRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BillService {
    private final BillRepository billRepository;
    private final CurrentUserService currentUserService;

    public BillService(BillRepository billRepository, CurrentUserService currentUserService) {
        this.billRepository = billRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<BillResponse> list() {
        User user = currentUserService.getCurrentUser();
        return billRepository.findByUserIdOrderByDueDateAsc(user.getId())
            .stream()
            .map(DtoMapper::toBillResponse)
            .toList();
    }

    @Transactional
    public BillResponse create(BillRequest request) {
        User user = currentUserService.getCurrentUser();
        Bill bill = new Bill();
        bill.setUser(user);
        apply(bill, request);
        return DtoMapper.toBillResponse(billRepository.save(bill));
    }

    @Transactional
    public BillResponse update(Long id, BillRequest request) {
        User user = currentUserService.getCurrentUser();
        Bill bill = findOwned(id, user);
        apply(bill, request);
        return DtoMapper.toBillResponse(bill);
    }

    @Transactional
    public BillResponse markPaid(Long id) {
        User user = currentUserService.getCurrentUser();
        Bill bill = findOwned(id, user);
        bill.setPaid(true);
        bill.setPaidAt(Instant.now());
        return DtoMapper.toBillResponse(bill);
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        billRepository.delete(findOwned(id, user));
    }

    public Bill findOwned(Long id, User user) {
        return billRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bill not found"));
    }

    private void apply(Bill bill, BillRequest request) {
        bill.setName(request.name().trim());
        bill.setAmount(request.amount());
        bill.setDueDate(request.dueDate());
        bill.setFrequency(request.frequency());
        bill.setNotes(request.notes());
    }
}
