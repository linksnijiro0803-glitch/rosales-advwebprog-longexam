import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/Button";
import { useAuth } from "../../hooks/useAuth";

const inputClasses = "mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-900";

const emptyForm = (fields) =>
  fields.reduce((form, field) => ({ ...form, [field.name]: field.defaultValue ?? "" }), {});

const normalizePayload = (form, fields, editing) =>
  fields.reduce((payload, field) => {
    let value = form[field.name];

    if (field.type === "number") {
      value = Number(value);
    }

    if (field.type === "boolean") {
      value = Boolean(value);
    }

    if (field.type === "images") {
      value = value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
    }

    if (editing && field.omitWhenEmpty && (value === "" || value === null || value === undefined)) {
      return payload;
    }

    if (!field.optional || value !== "" && value !== null && value !== undefined) {
      payload[field.name] = value;
    }

    return payload;
  }, {});

const AdminResourcePage = ({ title, fields, service, getItems, renderItem, optionLoaders = {} }) => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(() => emptyForm(fields));
  const [editingId, setEditingId] = useState("");
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formTitle = editingId ? `Edit ${title}` : `Create ${title}`;

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await service.list(token);
      setItems(getItems(response));
    } catch (apiError) {
      setError(apiError.message || `Unable to load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [getItems, service, title, token]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    const loadOptions = async () => {
      const entries = await Promise.all(
        Object.entries(optionLoaders).map(async ([key, loader]) => [key, await loader()])
      );
      setOptions(Object.fromEntries(entries));
    };

    if (Object.keys(optionLoaders).length) {
      loadOptions();
    }
  }, [optionLoaders]);

  const visibleFields = useMemo(() => fields.filter((field) => !field.editOnly || editingId), [fields, editingId]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const reset = () => {
    setEditingId("");
    setForm(emptyForm(fields));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = normalizePayload(form, visibleFields, Boolean(editingId));
      await (editingId ? service.update(editingId, payload, token) : service.create(payload, token));
      setSuccess(`${title} saved.`);
      reset();
      await loadItems();
    } catch (apiError) {
      setError(apiError.message || `Unable to save ${title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item) => {
    setEditingId(item._id);
    setForm(fields.reduce((nextForm, field) => {
      const value = item[field.name];
      const normalizedValue = value?._id || value;
      return { ...nextForm, [field.name]: Array.isArray(value) ? value.join(", ") : normalizedValue ?? field.defaultValue ?? "" };
    }, {}));
  };

  const deleteItem = async (item) => {
    if (!confirm(`Delete this ${title.toLowerCase()}?`)) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await service.delete(item._id, token);
      setSuccess(`${title} deleted.`);
      await loadItems();
    } catch (apiError) {
      setError(apiError.message || `Unable to delete ${title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-zinc-900">{title}</h1>
      <form className="mt-5 grid gap-4 rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        <h2 className="lg:col-span-2 text-xl font-semibold text-zinc-900">{formTitle}</h2>
        {visibleFields.map((field) => (
          <label key={field.name} className={field.type === "textarea" ? "lg:col-span-2 text-sm font-medium text-zinc-700" : "text-sm font-medium text-zinc-700"}>
            {field.label}
            {field.type === "textarea" ? (
              <textarea name={field.name} value={form[field.name] || ""} onChange={handleChange} className={inputClasses} rows="4" required={!field.optional && !(editingId && field.omitWhenEmpty)} />
            ) : field.type === "select" ? (
              <select name={field.name} value={form[field.name] || ""} onChange={handleChange} className={inputClasses} required={!field.optional}>
                <option value="">Select</option>
                {(field.options || options[field.optionsKey] || []).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : field.type === "boolean" ? (
              <input name={field.name} type="checkbox" checked={Boolean(form[field.name])} onChange={handleChange} className="ml-3 h-4 w-4 accent-zinc-900" />
            ) : (
              <input name={field.name} type={field.type || "text"} value={form[field.name] || ""} onChange={handleChange} className={inputClasses} required={!field.optional && !(editingId && field.omitWhenEmpty)} />
            )}
          </label>
        ))}
        {error && <p className="lg:col-span-2 text-sm text-red-700">{error}</p>}
        {success && <p className="lg:col-span-2 text-sm text-emerald-700">{success}</p>}
        <div className="flex gap-3 lg:col-span-2">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          {editingId && <Button type="button" onClick={reset} disabled={saving}>Cancel</Button>}
        </div>
      </form>
      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-zinc-600">Loading...</p>}
        {!loading && items.length === 0 && <p className="text-sm text-zinc-600">No records found.</p>}
        {items.map((item) => (
          <article key={item._id} className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4">
            <div className="text-sm text-zinc-700">{renderItem(item)}</div>
            <div className="mt-4 flex gap-2">
              <Button type="button" onClick={() => editItem(item)} disabled={saving}>Edit</Button>
              <Button type="button" onClick={() => deleteItem(item)} disabled={saving}>Delete</Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminResourcePage;
