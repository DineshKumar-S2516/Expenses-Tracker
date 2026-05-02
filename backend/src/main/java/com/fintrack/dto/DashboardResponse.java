package com.fintrack.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal totalBalance,
    BigDecimal savings,
    List<CategorySpending> monthlySpending,
    List<TransactionItem> recentTransactions
) {
}
