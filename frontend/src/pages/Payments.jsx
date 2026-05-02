import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api, { extractError } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { enumLabel, formatCurrency, formatDate, today } from "../utils/formatters.js";

const initialForm = {
  amount: "",
  paymentMethod: "UPI",
  status: "COMPLETED",
  linkedType: "EXPENSE",
  linkedId: "",
  paymentDate: today(),
  note: ""
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  const loadAll = useCallback(async () => {
    const [{ data: paymentData }, { data: expenseData }, { data: billData }] = await Promise.all([
      api.get("/payments"),
      api.get("/expenses"),
      api.get("/bills")
    ]);
    setPayments(paymentData);
    setExpenses(expenseData);
    setBills(billData);
  }, []);

  useEffect(() => {
    loadAll().catch((error) => toast.error(extractError(error)));
  }, [loadAll, toast]);

  const linkOptions = useMemo(() => (form.linkedType === "EXPENSE" ? expenses : bills), [form.linkedType, expenses, bills]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const changeLinkedType = (event) => {
    setForm((current) => ({ ...current, linkedType: event.target.value, linkedId: "", amount: "" }));
  };

  const changeLinkedItem = (event) => {
    const linkedId = event.target.value;
    const item = linkOptions.find((entry) => String(entry.id) === linkedId);
    setForm((current) => ({ ...current, linkedId, amount: item?.amount || current.amount }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.linkedId || Number(form.amount) <= 0) {
      toast.error("Select a linked item and amount");
      return;
    }
    const payload = { ...form, amount: Number(form.amount), linkedId: Number(form.linkedId) };
    try {
      if (editingId) {
        await api.put(`/payments/${editingId}`, payload);
        toast.success("Payment updated");
      } else {
        await api.post("/payments", payload);
        toast.success("Payment recorded");
      }
      setForm(initialForm);
      setEditingId(null);
      await loadAll();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const edit = (payment) => {
    setEditingId(payment.id);
    setForm({
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      linkedType: payment.linkedType,
      linkedId: String(payment.linkedId),
      paymentDate: payment.paymentDate,
      note: payment.note || ""
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this payment?")) return;
    try {
      await api.delete(`/payments/${id}`);
      toast.success("Payment deleted");
      await loadAll();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const linkLabel = (payment) => {
    if (payment.linkedType === "EXPENSE") {
      const expense = expenses.find((item) => item.id === payment.linkedId);
      return expense ? `${expense.category.name} on ${formatDate(expense.date)}` : `Expense #${payment.linkedId}`;
    }
    const bill = bills.find((item) => item.id === payment.linkedId);
    return bill ? `${bill.name} due ${formatDate(bill.dueDate)}` : `Bill #${payment.linkedId}`;
  };

  return (
    <div className="page-stack">
      <section className="module-header">
        <div>
          <span className="eyebrow">Settlement history</span>
          <h2>Payments linked to expenses or bills</h2>
        </div>
      </section>

      <section className="split-grid">
        <form className="panel form" onSubmit={submit}>
          <div className="panel-heading">
            <h2>{editingId ? "Edit payment" : "Record payment"}</h2>
          </div>
          <div className="inline-fields">
            <label className="field">
              <span>Linked to</span>
              <select name="linkedType" value={form.linkedType} onChange={changeLinkedType}>
                <option value="EXPENSE">Expense</option>
                <option value="BILL">Bill</option>
              </select>
            </label>
            <label className="field">
              <span>Item</span>
              <select name="linkedId" required value={form.linkedId} onChange={changeLinkedItem}>
                <option value="">Select item</option>
                {linkOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {form.linkedType === "EXPENSE" ? `${item.category.name} - ${formatCurrency(item.amount)}` : `${item.name} - ${formatCurrency(item.amount)}`}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>Amount</span>
            <input name="amount" type="number" min="0.01" step="0.01" required value={form.amount} onChange={update} />
          </label>
          <div className="inline-fields">
            <label className="field">
              <span>Method</span>
              <select name="paymentMethod" value={form.paymentMethod} onChange={update}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
              </select>
            </label>
            <label className="field">
              <span>Status</span>
              <select name="status" value={form.status} onChange={update}>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>Payment date</span>
            <input name="paymentDate" type="date" required value={form.paymentDate} onChange={update} />
          </label>
          <label className="field">
            <span>Note</span>
            <textarea name="note" rows="3" value={form.note} onChange={update} />
          </label>
          <div className="button-row">
            <button className="primary-button" type="submit"><Plus size={18} /> {editingId ? "Save payment" : "Record payment"}</button>
            {editingId ? <button className="ghost-button" type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancel</button> : null}
          </div>
        </form>

        <article className="panel highlight-panel">
          <CreditCard size={34} />
          <span className="eyebrow">Payment volume</span>
          <strong>{formatCurrency(payments.reduce((sum, item) => sum + Number(item.amount), 0))}</strong>
          <p>Completed bill payments automatically mark the associated bill as paid.</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Transaction timeline</h2>
          <strong>{payments.length} payments</strong>
        </div>
        <div className="timeline">
          {payments.map((payment) => (
            <div className="timeline-item" key={payment.id}>
              <span className="timeline-dot" />
              <div>
                <strong>{formatCurrency(payment.amount)} via {enumLabel(payment.paymentMethod)}</strong>
                <p>{linkLabel(payment)} • {formatDate(payment.paymentDate)}</p>
                {payment.note ? <small>{payment.note}</small> : null}
              </div>
              <div className="timeline-actions">
                <span className={`status-badge ${payment.status === "COMPLETED" ? "success" : payment.status === "FAILED" ? "danger" : "pending"}`}>{enumLabel(payment.status)}</span>
                <button className="icon-button" type="button" onClick={() => edit(payment)} aria-label="Edit payment"><Pencil size={16} /></button>
                <button className="icon-button danger" type="button" onClick={() => remove(payment.id)} aria-label="Delete payment"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {!payments.length ? <div className="empty-state">No payments recorded yet.</div> : null}
        </div>
      </section>
    </div>
  );
}
