package com.fintrack.service;

import com.fintrack.dto.PaymentRequest;
import com.fintrack.dto.PaymentResponse;
import com.fintrack.model.Bill;
import com.fintrack.model.LinkedType;
import com.fintrack.model.Payment;
import com.fintrack.model.PaymentStatus;
import com.fintrack.model.User;
import com.fintrack.repository.ExpenseRepository;
import com.fintrack.repository.PaymentRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final BillService billService;
    private final CurrentUserService currentUserService;

    public PaymentService(
        PaymentRepository paymentRepository,
        ExpenseRepository expenseRepository,
        BillService billService,
        CurrentUserService currentUserService
    ) {
        this.paymentRepository = paymentRepository;
        this.expenseRepository = expenseRepository;
        this.billService = billService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> list() {
        User user = currentUserService.getCurrentUser();
        return paymentRepository.findByUserIdOrderByPaymentDateDescCreatedAtDesc(user.getId())
            .stream()
            .map(DtoMapper::toPaymentResponse)
            .toList();
    }

    @Transactional
    public PaymentResponse create(PaymentRequest request) {
        User user = currentUserService.getCurrentUser();
        validateLink(request, user);
        Payment payment = new Payment();
        payment.setUser(user);
        apply(payment, request);
        syncBillPaymentStatus(request, user);
        return DtoMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentResponse update(Long id, PaymentRequest request) {
        User user = currentUserService.getCurrentUser();
        validateLink(request, user);
        Payment payment = findOwned(id, user);
        apply(payment, request);
        syncBillPaymentStatus(request, user);
        return DtoMapper.toPaymentResponse(payment);
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        paymentRepository.delete(findOwned(id, user));
    }

    private Payment findOwned(Long id, User user) {
        return paymentRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
    }

    private void apply(Payment payment, PaymentRequest request) {
        payment.setAmount(request.amount());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setStatus(request.status());
        payment.setLinkedType(request.linkedType());
        payment.setLinkedId(request.linkedId());
        payment.setPaymentDate(request.paymentDate());
        payment.setNote(request.note());
    }

    private void validateLink(PaymentRequest request, User user) {
        if (request.linkedType() == LinkedType.EXPENSE) {
            expenseRepository.findByIdAndUserId(request.linkedId(), user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Linked expense not found"));
            return;
        }
        billService.findOwned(request.linkedId(), user);
    }

    private void syncBillPaymentStatus(PaymentRequest request, User user) {
        if (request.linkedType() == LinkedType.BILL && request.status() == PaymentStatus.COMPLETED) {
            Bill bill = billService.findOwned(request.linkedId(), user);
            bill.setPaid(true);
            bill.setPaidAt(Instant.now());
        }
    }
}
