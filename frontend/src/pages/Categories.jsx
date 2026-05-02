import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import api, { extractError } from "../api/client.js";
import IconRenderer, { CATEGORY_ICONS } from "../components/IconRenderer.jsx";
import { useToast } from "../context/ToastContext.jsx";

const colors = ["#22c55e", "#38bdf8", "#f97316", "#a78bfa", "#facc15", "#fb7185", "#14b8a6", "#e879f9"];
const initialForm = { name: "", color: colors[0], icon: CATEGORY_ICONS[0].value };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  const loadCategories = useCallback(async () => {
    const { data } = await api.get("/categories");
    setCategories(data);
  }, []);

  useEffect(() => {
    loadCategories().catch((error) => toast.error(extractError(error)));
  }, [loadCategories, toast]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success("Category updated");
      } else {
        await api.post("/categories", form);
        toast.success("Category created");
      }
      setForm(initialForm);
      setEditingId(null);
      await loadCategories();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const edit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, color: category.color, icon: category.icon });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      await loadCategories();
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  return (
    <div className="page-stack">
      <section className="module-header">
        <div>
          <span className="eyebrow">Category system</span>
          <h2>Create custom colors and icons for expense planning</h2>
        </div>
      </section>

      <section className="split-grid">
        <form className="panel form" onSubmit={submit}>
          <div className="panel-heading">
            <h2>{editingId ? "Edit category" : "Create category"}</h2>
          </div>
          <label className="field">
            <span>Name</span>
            <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Groceries, fuel, tuition" />
          </label>
          <label className="field">
            <span>Icon</span>
            <select value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}>
              {CATEGORY_ICONS.map((icon) => (
                <option value={icon.value} key={icon.value}>{icon.label}</option>
              ))}
            </select>
          </label>
          <div className="swatch-grid">
            {colors.map((color) => (
              <button
                type="button"
                className={`swatch ${form.color === color ? "active" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setForm((current) => ({ ...current, color }))}
                aria-label={`Choose ${color}`}
                key={color}
              />
            ))}
          </div>
          <div className="category-preview" style={{ "--pill": form.color }}>
            <IconRenderer name={form.icon} size={20} />
            <strong>{form.name || "Category preview"}</strong>
          </div>
          <div className="button-row">
            <button className="primary-button" type="submit"><Plus size={18} /> {editingId ? "Save category" : "Create category"}</button>
            {editingId ? <button className="ghost-button" type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancel</button> : null}
          </div>
        </form>

        <article className="panel">
          <div className="panel-heading">
            <h2>Available categories</h2>
            <strong>{categories.length}</strong>
          </div>
          <div className="category-list">
            {categories.map((category) => (
              <div className="category-row" key={category.id}>
                <span className="category-pill" style={{ "--pill": category.color }}>
                  <IconRenderer name={category.icon} />
                  {category.name}
                </span>
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => edit(category)} aria-label="Edit category"><Pencil size={16} /></button>
                  <button className="icon-button danger" type="button" onClick={() => remove(category.id)} aria-label="Delete category"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {!categories.length ? <div className="empty-state">No categories yet.</div> : null}
          </div>
        </article>
      </section>
    </div>
  );
}
