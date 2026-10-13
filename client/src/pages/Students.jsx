import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createStudent, deleteStudent } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import SearchBar from '../components/SearchBar.jsx';
import StudentForm from '../components/StudentForm.jsx';

export default function Students() {
  // students come from the global context (shared with the Issue Book page)
  const { students, refreshStudents, notify } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  // useMemo: filter the list only when the students or the search text change
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.enrollmentNo.toLowerCase().includes(q)
    );
  }, [students, search]);

  const handleDelete = useCallback(
    async (id, name) => {
      if (!window.confirm(`Delete student "${name}" and all their lending records?`)) return;
      try {
        await deleteStudent(id);
        notify('success', 'Student deleted');
        refreshStudents();
      } catch (err) {
        notify('error', err.message);
      }
    },
    [notify, refreshStudents]
  );

  const handleCreate = async (form) => {
    try {
      await createStudent(form);
      notify('success', 'Student added');
      setShowForm(false);
      refreshStudents();
      return true;
    } catch (err) {
      notify('error', err.message);
      return false;
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Students</h1>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Close' : '+ Add Student'}
        </button>
      </div>

      {showForm && <StudentForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} submitLabel="Add Student" />}

      <div className="filters">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email or enrollment no." />
      </div>

      {filtered.length === 0 ? (
        <p className="state">No students found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Enrollment</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Dept</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td><Link to={`/students/${s.id}`}>{s.name}</Link></td>
                  <td>{s.enrollmentNo}</td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>{s.department || '-'}</td>
                  <td>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(s.id, s.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
