import { Pencil, PiggyBank, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api, { extractError } from "../api/client.js";
import IconRenderer from "../components/IconRenderer.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatCurrency, formatDate } from "../utils/formatters.js";

const now = new Date();
const budgetInitial = {
  categoryId: "",
  monthlyLimit: "",
  month: String(now.getMonth() + 1),
  year: String(now.getFullYear())
};
const goalInitial = { name: "", targetAmount: "", currentAmount: "0", targetDate: "" };

export default function BudgetSavings() {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgetForm, setBudgetForm] = useState(budgetInitial);
  const [goalForm, setGoalForm] = useState(goalInitial);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const toast = useToast();

  const loadAll = useCallback(async () => {
    const [{ data: categoryData }, { data: budgetData }, { data: goalData }] = await Promise.all([
      api.get("/categories"),
      api.get("/budgets"),
      api.get("/savings-goals")
    ]);
    setCategories(categoryData);
    setBudgets(budgetData);
    setGoals(goalData);
  }, []);

  useEffect(() => {
    loadAll().catch((error) => toast.error(extractError(error)));
  }, [loadAll, toast]);

  const budgetTotal = useMemo(
    () => budgets.reduce((sum, budget) => sum + Number(budget.monthlyLimit), 0),
    [budgets]
  );

  const submitBudget = async (event) => {
    event.preventDefault();
    if (!budgetForm.categoryId || Number(budgetForm.monthlyLimit) <= 0) {
      toast.error("Category and monthly limit are required");
      return;
    }
    const payload = {
      categoryId: Number(budgetForm.categoryId),
      monthlyLimit: Number(budgetForm.monthlyLimit),
      month: Number(budgetForm.month),
      year: Number(budgetForm.year)
    };
    try {
      if (editingBudgetId) {
        await api.put(`/budgets/${editingBudgetId}`, payload);
        toast.success("Budget updated");
      } else {
        await api.post("/budgets", payload);
        toast.success("Budget saved");
      }
      setBudgetForm(budgetInitial);
      setEditingBudgetId(null);
      await loadAll();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const submitGoal = async (event) => {
    event.preventDefault();
    if (!goalForm.name.trim() || Number(goalForm.targetAmount) <= 0) {
      toast.error("Goal name and target amount are required");
      return;
    }
    const payload = {
      ...goalForm,
      targetAmount: Number(goalForm.targetAmount),
      currentAmount: Number(goalForm.currentAmount || 0),
      targetDate: goalForm.targetDate || null
    };
    try {
      if (editingGoalId) {
        await api.put(`/savings-goals/${editingGoalId}`, payload);
        toast.success("Savings goal updated");
      } else {
        await api.post("/savings-goals", payload);
        toast.success("Savings goal created");
      }
      setGoalForm(goalInitial);
      setEditingGoalId(null);
      await loadAll();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const editBudget = (budget) => {
    setEditingBudgetId(budget.id);
    setBudgetForm({
      categoryId: String(budget.category.id),
      monthlyLimit: budget.monthlyLimit,
      month: String(budget.month),
      year: String(budget.year)
    });
  };

  const editGoal = (goal) => {
    setEditingGoalId(goal.id);
    setGoalForm({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate || ""
    });
  };

  const remove = async (path, id, message) => {
    if (!window.confirm(message)) return;
    try {
      await api.delete(`/${path}/${id}`);
      toast.success("Deleted");
      await loadAll();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <div className="page-stack">
      <section className="module-header">
        <div>
          <span className="eyebrow">Plan and progress</span>
          <h2>Monthly category budgets and savings goals</h2>
        </div>
        <strong>{formatCurrency(budgetTotal)} planned</strong>
      </section>

      <section className="split-grid">
        <form className="panel form" onSubmit={submitBudget}>
          <div className="panel-heading">
            <h2>{editingBudgetId ? "Edit budget" : "Set category budget"}</h2>
          </div>
          <label className="field">
            <span>Category</span>
            <select value={budgetForm.categoryId} required onChange={(event) => setBudgetForm((current) => ({ ...current, categoryId: event.target.value }))}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Monthly limit</span>
            <input type="number" min="0.01" step="0.01" required value={budgetForm.monthlyLimit} onChange={(event) => setBudgetForm((current) => ({ ...current, monthlyLimit: event.target.value }))} />
          </label>
          <div className="inline-fields">
            <label className="field">
              <span>Month</span>
              <input type="number" min="1" max="12" required value={budgetForm.month} onChange={(event) => setBudgetForm((current) => ({ ...current, month: event.target.value }))} />
            </label>
            <label className="field">
              <span>Year</span>
              <input type="number" min="2000" required value={budgetForm.year} onChange={(event) => setBudgetForm((current) => ({ ...current, year: event.target.value }))} />
            </label>
          </div>
          <div className="button-row">
            <button className="primary-button" type="submit"><Plus size={18} /> {editingBudgetId ? "Save budget" : "Set budget"}</button>
            {editingBudgetId ? <button className="ghost-button" type="button" onClick={() => { setEditingBudgetId(null); setBudgetForm(budgetInitial); }}>Cancel</button> : null}
          </div>
        </form>

        <form className="panel form" onSubmit={submitGoal}>
          <div className="panel-heading">
            <h2>{editingGoalId ? "Edit savings goal" : "Create savings goal"}</h2>
          </div>
          <label className="field">
            <span>Goal name</span>
            <input required value={goalForm.name} onChange={(event) => setGoalForm((current) => ({ ...current, name: event.target.value }))} placeholder="Emergency fund, home deposit" />
          </label>
          <div className="inline-fields">
            <label className="field">
              <span>Target</span>
              <input type="number" min="0.01" step="0.01" required value={goalForm.targetAmount} onChange={(event) => setGoalForm((current) => ({ ...current, targetAmount: event.target.value }))} />
            </label>
            <label className="field">
              <span>Saved</span>
              <input type="number" min="0" step="0.01" required value={goalForm.currentAmount} onChange={(event) => setGoalForm((current) => ({ ...current, currentAmount: event.target.value }))} />
            </label>
          </div>
          <label className="field">
            <span>Target date</span>
            <input type="date" value={goalForm.targetDate} onChange={(event) => setGoalForm((current) => ({ ...current, targetDate: event.target.value }))} />
          </label>
          <div className="button-row">
            <button className="primary-button" type="submit"><PiggyBank size={18} /> {editingGoalId ? "Save goal" : "Create goal"}</button>
            {editingGoalId ? <button className="ghost-button" type="button" onClick={() => { setEditingGoalId(null); setGoalForm(goalInitial); }}>Cancel</button> : null}
          </div>
        </form>
      </section>

      <section className="card-grid">
        {budgets.map((budget) => (
          <article className="progress-card" key={budget.id}>
            <div className="card-title-row">
              <span className="category-pill" style={{ "--pill": budget.category.color }}>
                <IconRenderer name={budget.category.icon} />
                {budget.category.name}
              </span>
              <div className="row-actions">
                <button className="icon-button" type="button" onClick={() => editBudget(budget)} aria-label="Edit budget"><Pencil size={16} /></button>
                <button className="icon-button danger" type="button" onClick={() => remove("budgets", budget.id, "Delete this budget?")} aria-label="Delete budget"><Trash2 size={16} /></button>
              </div>
            </div>
            <strong>{formatCurrency(budget.spent)} / {formatCurrency(budget.monthlyLimit)}</strong>
            <div className="progress-track">
              <span style={{ width: `${Math.min(budget.percentUsed, 100)}%` }} />
            </div>
            <div className="progress-meta">
              <span>{budget.percentUsed.toFixed(1)}% used</span>
              <span>{formatCurrency(budget.remaining)} remaining</span>
            </div>
          </article>
        ))}
        {!budgets.length ? <div className="empty-state wide">No budgets yet. Set one per category to track monthly spend.</div> : null}
      </section>

      <section className="card-grid">
        {goals.map((goal) => (
          <article className="progress-card savings-card" key={goal.id}>
            <div className="card-title-row">
              <div>
                <span className="eyebrow">Savings goal</span>
                <h3>{goal.name}</h3>
              </div>
              <div className="row-actions">
                <button className="icon-button" type="button" onClick={() => editGoal(goal)} aria-label="Edit savings goal"><Pencil size={16} /></button>
                <button className="icon-button danger" type="button" onClick={() => remove("savings-goals", goal.id, "Delete this savings goal?")} aria-label="Delete savings goal"><Trash2 size={16} /></button>
              </div>
            </div>
            <strong>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</strong>
            <div className="progress-track success">
              <span style={{ width: `${Math.min(goal.percentComplete, 100)}%` }} />
            </div>
            <div className="progress-meta">
              <span>{goal.percentComplete.toFixed(1)}% completed</span>
              <span>{goal.targetDate ? formatDate(goal.targetDate) : "No target date"}</span>
            </div>
          </article>
        ))}
        {!goals.length ? <div className="empty-state wide">No savings goals yet.</div> : null}
      </section>
    </div>
  );
}
