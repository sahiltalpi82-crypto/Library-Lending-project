import { useState } from 'react';

const empty = { name: '', email: '', enrollmentNo: '', phone: '', department: '' };

export default function StudentForm({ initial, onSubmit, onCancel, submitLabel = 'Save Student' }) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          email: initial.email,
          enrollmentNo: initial.enrollmentNo,
          phone: initial.phone,
          department: initial.department ?? '',
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
          Name
          <input className="input" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Enrollment no.
          <input className="input" name="enrollmentNo" value={form.enrollmentNo} onChange={handleChange} required />
        </label>
        <label>
          Phone (10 digits)
          <input
            className="input"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            maxLength={10}
            required
          />
        </label>
        <label>
          Department
          <input className="input" name="department" value={form.department} onChange={handleChange} />
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
