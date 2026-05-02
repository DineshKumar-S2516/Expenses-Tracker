import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api, { extractError } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { enumLabel, formatCurrency, formatDate, today } from "../utils/formatters.js";

const initialForm = { name: "", amount: "", dueDate: today(), frequency: "MONTHLY", notes: "" };

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  const loadBills = useCallback(async () => {
    const { data } = await api.get("/bills");
    setBills(data);
  }, []);

  useEffect(() => {
    loadBills().catch((error) => toast.error(extractError(error)));
  }, [loadBills, toast]);

  const upcoming = useMemo(
    () => bills.filter((bill) => !bill.paid).slice(0, 5),
    [bills]
  );

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || Number(form.amount) <= 0) {
      toast.error("Bill name and amount are required");
      return;
    }
    const payload = { ...form, amount: Number(form.amount) };
    try {
      if (editingId) {
        await api.put(`/bills/${editingId}`, payload);
        toast.success("Bill updated");
      } else {
        await api.post("/bills", payload);
        toast.success("Bill added");
      }
      setForm(initialForm);
      setEditingId(null);
      await loadBills();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const edit = (bill) => {
    setEditingId(bill.id);
    setForm({
      name: bill.name,
      amount: bill.amount,
      dueDate: bill.dueDate,
      frequency: bill.frequency,
      notes: bill.notes || ""
    });
  };

  const markPaid = async (id) => {
    try {
      await api.patch(`/bills/${id}/paid`);
      toast.success("Bill marked as paid");
      await loadBills();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await api.delete(`/bills/${id}`);
      toast.success("Bill deleted");
      await loadBills();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <div className="page-stack">
      <section className="module-header">
        <div>
          <span className="eyebrow">Recurring obligations</span>
          <h2>Upcoming bills, payment status, and overdue signals</h2>
        </div>
      </section>

      <section className="split-grid">
        <form className="panel form" onSubmit={submit}>
          <div className="panel-heading">
            <h2>{editingId ? "Edit bill" : "Add recurring bill"}</h2>
          </div>
          <label className="field">
            <span>Name</span>
            <input name="name" required value={form.name} onChange={update} placeholder="Rent, Electricity, Internet" />
          </label>
          <label className="field">
            <span>Amount</span>
            <input name="amount" type="number" min="0.01" step="0.01" required value={form.amount} onChange={update} />
          </label>
          <div className="inline-fields">
            <label className="field">
              <span>Due date</span>
              <input name="dueDate" type="date" required value={form.dueDate} onChange={update} />
            </label>
            <label className="field">
              <span>Frequency</span>
              <select name="frequency" value={form.frequency} onChange={update}>
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>Notes</span>
            <textarea name="notes" rows="3" value={form.notes} onChange={update} />
          </label>
          <div className="button-row">
            <button className="primary-button" type="submit"><Plus size={18} /> {editingId ? "Save bill" : "Add bill"}</button>
            {editingId ? <button className="ghost-button" type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancel</button> : null}
          </div>
        </form>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Next due</span>
              <h2>Upcoming bills</h2>
            </div>
          </div>
          <div className="bill-list">
            {upcoming.map((bill) => (
              <div className={`bill-item ${bill.overdue ? "overdue" : ""}`} key={bill.id}>
                <div>
                  <strong>{bill.name}</strong>
                  <span>{formatDate(bill.dueDate)} • {enumLabel(bill.frequency)}</span>
                </div>
                <strong>{formatCurrency(bill.amount)}</strong>
              </div>
            ))}
            {!upcoming.length ? <div className="empty-state">No upcoming unpaid bills.</div> : null}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Bill register</h2>
          <strong>{bills.length} bills</strong>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Bill</th>
                <th>Due</th>
                <th>Frequency</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id}>
                  <td><strong>{bill.name}</strong></td>
                  <td>{formatDate(bill.dueDate)}</td>
                  <td>{enumLabel(bill.frequency)}</td>
                  <td><span className={`status-badge ${bill.paid ? "success" : bill.overdue ? "danger" : "pending"}`}>{bill.paid ? "Paid" : bill.overdue ? "Overdue" : "Upcoming"}</span></td>
                  <td>{formatCurrency(bill.amount)}</td>
                  <td>
                    <div className="row-actions">
                      {!bill.paid ? <button className="icon-button success" type="button" onClick={() => markPaid(bill.id)} aria-label="Mark bill paid"><CheckCircle2 size={16} /></button> : null}
                      <button className="icon-button" type="button" onClick={() => edit(bill)} aria-label="Edit bill"><Pencil size={16} /></button>
                      <button className="icon-button danger" type="button" onClick={() => remove(bill.id)} aria-label="Delete bill"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!bills.length ? <div className="empty-state">No bills added yet.</div> : null}
        </div>
      </section>
    </div>
  );
}
