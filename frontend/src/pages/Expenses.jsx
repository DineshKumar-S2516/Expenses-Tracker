import { Eraser, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import api, { extractError } from "../api/client.js";
import IconRenderer from "../components/IconRenderer.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatCurrency, formatDate, today } from "../utils/formatters.js";

const initialForm = { amount: "", categoryId: "", date: today(), notes: "" };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState({ date: "", categoryId: "" });
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  const loadExpenses = useCallback(async () => {
    const params = {};
    if (filters.date) params.date = filters.date;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    const { data } = await api.get("/expenses", { params });
    setExpenses(data);
  }, [filters]);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: categoryData }] = await Promise.all([api.get("/categories")]);
        setCategories(categoryData);
        await loadExpenses();
      } catch (error) {
        toast.error(extractError(error));
      }
    };
    load();
  }, [loadExpenses, toast]);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.categoryId || Number(form.amount) <= 0) {
      toast.error("Amount and category are required");
      return;
    }
    const payload = { ...form, amount: Number(form.amount), categoryId: Number(form.categoryId) };
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
        toast.success("Expense updated");
      } else {
        await api.post("/expenses", payload);
        toast.success("Expense added");
      }
      setForm(initialForm);
      setEditingId(null);
      await loadExpenses();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const edit = (expense) => {
    setEditingId(expense.id);
    setForm({
      amount: expense.amount,
      categoryId: String(expense.category.id),
      date: expense.date,
      notes: expense.notes || ""
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted");
      await loadExpenses();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  return (
    <div className="page-stack">
      <section className="module-header">
        <div>
          <span className="eyebrow">Expense control</span>
          <h2>Add, edit, filter, and audit spending</h2>
        </div>
      </section>

      <section className="split-grid">
        <form className="panel form" onSubmit={submit}>
          <div className="panel-heading">
            <h2>{editingId ? "Edit expense" : "Add expense"}</h2>
          </div>
          <label className="field">
            <span>Amount</span>
            <input name="amount" type="number" min="0.01" step="0.01" required value={form.amount} onChange={updateForm} />
          </label>
          <label className="field">
            <span>Category</span>
            <select name="categoryId" required value={form.categoryId} onChange={updateForm}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Date</span>
            <input name="date" type="date" required value={form.date} onChange={updateForm} />
          </label>
          <label className="field">
            <span>Notes</span>
            <textarea name="notes" value={form.notes} onChange={updateForm} rows="3" />
          </label>
          <div className="button-row">
            <button className="primary-button" type="submit"><Plus size={18} /> {editingId ? "Save changes" : "Add expense"}</button>
            {editingId ? <button className="ghost-button" type="button" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>

        <div className="panel">
          <div className="panel-heading">
            <h2>Filters</h2>
          </div>
          <div className="filter-grid">
            <label className="field">
              <span>Date</span>
              <input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <label className="field">
              <span>Category</span>
              <select value={filters.categoryId} onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}>
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="button-row">
            <button className="secondary-button" type="button" onClick={loadExpenses}><Search size={18} /> Apply filters</button>
            <button className="ghost-button" type="button" onClick={() => setFilters({ date: "", categoryId: "" })}><Eraser size={18} /> Clear</button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Expense ledger</h2>
          <strong>{formatCurrency(expenses.reduce((sum, item) => sum + Number(item.amount), 0))}</strong>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>
                    <span className="category-pill" style={{ "--pill": expense.category.color }}>
                      <IconRenderer name={expense.category.icon} />
                      {expense.category.name}
                    </span>
                  </td>
                  <td>{formatDate(expense.date)}</td>
                  <td>{expense.notes || "-"}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-button" type="button" onClick={() => edit(expense)} aria-label="Edit expense"><Pencil size={16} /></button>
                      <button className="icon-button danger" type="button" onClick={() => remove(expense.id)} aria-label="Delete expense"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!expenses.length ? <div className="empty-state">No expenses match the current filters.</div> : null}
        </div>
      </section>
    </div>
  );
}
