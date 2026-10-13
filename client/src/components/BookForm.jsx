import { useState } from 'react';

const empty = { title: '', author: '', isbn: '', publishedYear: '', copiesTotal: 1, categoryId: '' };

export default function BookForm({ initial, categories, onSubmit, onCancel, submitLabel = 'Save Book' }) {
  const [form, setForm] = useState(
    initial
      ? {
          title: initial.title,
          author: initial.author,
          isbn: initial.isbn,
          publishedYear: initial.publishedYear ?? '',
          copiesTotal: initial.copiesTotal,
          copiesAvailable: initial.copiesAvailable,
          categoryId: initial.categoryId ?? '',
        }
      : empty
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onSubmit(form);
    setSaving(false);
    if (ok && !initial) setForm(empty);
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Title
          <input className="input" name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Author
          <input className="input" name="author" value={form.author} onChange={handleChange} required />
        </label>
        <label>
          ISBN
          <input
            className="input"
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
            placeholder="978-0132350884"
            required
          />
        </label>
        <label>
          Published year
          <input
            className="input"
            type="number"
            name="publishedYear"
            value={form.publishedYear}
            onChange={handleChange}
          />
        </label>
        <label>
          Total copies
          <input
            className="input"
            type="number"
            min="1"
            name="copiesTotal"
            value={form.copiesTotal}
            onChange={handleChange}
            required
          />
        </label>
        {initial && (
          <label>
            Available copies
            <input
              className="input"
              type="number"
              min="0"
              name="copiesAvailable"
              value={form.copiesAvailable}
              onChange={handleChange}
              required
            />
          </label>
        )}
        <label>
          Category
          <select className="input" name="categoryId" value={form.categoryId} onChange={handleChange}>
            <option value="">-- none --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="row">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button className="btn btn-light" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
