import { Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import api, { extractError } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { formatCurrency, formatDate, today } from "../utils/formatters.js";

const initialForm = { amount: "", source: "", date: today(), notes: "" };

export default function Income() {
  const [income, setIncome] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  const loadIncome = useCallback(async () => {
    const { data } = await api.get("/income");
    setIncome(data);
  }, []);

  useEffect(() => {
    loadIncome().catch((error) => toast.error(extractError(error)));
  }, [loadIncome, toast]);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (Number(form.amount) <= 0 || !form.source.trim()) {
      toast.error("Amount and source are required");
      return;
    }
    const payload = { ...form, amount: Number(form.amount) };
    try {
      if (editingId) {
        await api.put(`/income/${editingId}`, payload);
        toast.success("Income updated");
      } else {
        await api.post("/income", payload);
        toast.success("Income added");
      }
      setForm(initialForm);
      setEditingId(null);
      await loadIncome();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm({ amount: item.amount, source: item.source, date: item.date, notes: item.notes || "" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this income record?")) return;
    try {
      await api.delete(`/income/${id}`);
      toast.success("Income deleted");
      await loadIncome();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <div className="page-stack">
      <section className="module-header">
        <div>
          <span className="eyebrow">Income streams</span>
          <h2>Track salary, freelance, investments, and other sources</h2>
        </div>
      </section>

      <section className="split-grid">
        <form className="panel form" onSubmit={submit}>
          <div className="panel-heading">
            <h2>{editingId ? "Edit income" : "Add income"}</h2>
          </div>
          <label className="field">
            <span>Amount</span>
            <input name="amount" type="number" min="0.01" step="0.01" required value={form.amount} onChange={updateForm} />
          </label>
          <label className="field">
            <span>Source</span>
            <input name="source" required value={form.source} onChange={updateForm} placeholder="Salary, freelance, rental" />
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
            <button className="primary-button" type="submit"><Plus size={18} /> {editingId ? "Save income" : "Add income"}</button>
            {editingId ? <button className="ghost-button" type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancel</button> : null}
          </div>
        </form>

        <article className="panel highlight-panel">
          <TrendingUp size={34} />
          <span className="eyebrow">Tracked income</span>
          <strong>{formatCurrency(income.reduce((sum, item) => sum + Number(item.amount), 0))}</strong>
          <p>Multiple income sources feed the dashboard balance and savings calculations automatically.</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Income history</h2>
          <strong>{income.length} records</strong>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {income.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.source}</strong></td>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.notes || "-"}</td>
                  <td className="amount-positive">{formatCurrency(item.amount)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-button" type="button" onClick={() => edit(item)} aria-label="Edit income"><Pencil size={16} /></button>
                      <button className="icon-button danger" type="button" onClick={() => remove(item.id)} aria-label="Delete income"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!income.length ? <div className="empty-state">No income records yet.</div> : null}
        </div>
      </section>
    </div>
  );
}
