import { ArrowDownRight, ArrowUpRight, PiggyBank, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import api, { extractError } from "../api/client.js";
import StatCard from "../components/StatCard.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { enumLabel, formatCurrency, formatDate } from "../utils/formatters.js";

const emptyDashboard = {
  totalIncome: 0,
  totalExpense: 0,
  totalBalance: 0,
  savings: 0,
  monthlySpending: [],
  recentTransactions: []
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/dashboard");
        setDashboard(data);
      } catch (error) {
        toast.error(extractError(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const chartData = dashboard.monthlySpending.length
    ? dashboard.monthlySpending.map((item) => ({ ...item, amount: Number(item.amount) }))
    : [{ category: "No spending", color: "#475569", amount: 1 }];

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <StatCard title="Total Balance" value={formatCurrency(dashboard.totalBalance)} subtitle="Income minus expense" icon={WalletCards} tone="blue" />
        <StatCard title="Total Income" value={formatCurrency(dashboard.totalIncome)} subtitle="All income tracked" icon={ArrowUpRight} tone="emerald" />
        <StatCard title="Total Expense" value={formatCurrency(dashboard.totalExpense)} subtitle="All expenses tracked" icon={ArrowDownRight} tone="rose" />
        <StatCard title="Savings" value={formatCurrency(dashboard.savings)} subtitle="Positive remaining balance" icon={PiggyBank} tone="amber" />
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Current month</span>
              <h2>Spending by category</h2>
            </div>
            <strong>{loading ? "Loading" : formatCurrency(dashboard.monthlySpending.reduce((sum, item) => sum + Number(item.amount), 0))}</strong>
          </div>
          <div className="ring-chart">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={chartData} dataKey="amount" nameKey="category" innerRadius={72} outerRadius={108} paddingAngle={4}>
                  {chartData.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: "#111827", border: "1px solid #263244", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-grid">
            {dashboard.monthlySpending.length ? (
              dashboard.monthlySpending.map((item) => (
                <span className="legend-item" key={item.category}>
                  <i style={{ backgroundColor: item.color }} />
                  {item.category}
                </span>
              ))
            ) : (
              <span className="muted">No expenses recorded this month</span>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Latest activity</span>
              <h2>Recent transactions</h2>
            </div>
          </div>
          <div className="transaction-list">
            {dashboard.recentTransactions.length ? (
              dashboard.recentTransactions.map((item) => (
                <div className="transaction-row" key={`${item.type}-${item.id}`}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{enumLabel(item.type)} • {formatDate(item.date)}</span>
                  </div>
                  <div className={item.type === "INCOME" ? "amount-positive" : "amount-negative"}>
                    {item.type === "INCOME" ? "+" : "-"}{formatCurrency(item.amount)}
                    <small>{enumLabel(item.status)}</small>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">Transactions will appear here as soon as you add income, expenses, or payments.</div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
