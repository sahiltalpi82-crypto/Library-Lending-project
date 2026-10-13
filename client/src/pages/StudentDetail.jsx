import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteStudent, getStudent, returnBook, updateStudent } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import StudentForm from '../components/StudentForm.jsx';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify, refreshStudents } = useApp();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getStudent(id)
      .then((res) => {
        if (!ignore) {
          setStudent(res.data);
          setError('');
        }
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  const handleUpdate = async (form) => {
    try {
      await updateStudent(id, form);
      notify('success', 'Student updated');
      setEditing(false);
      setReloadKey((k) => k + 1);
      refreshStudents();
      return true;
    } catch (err) {
      notify('error', err.message);
      return false;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${student.name} and all their lending records?`)) return;
    try {
      await deleteStudent(id);
      notify('success', 'Student deleted');
      refreshStudents();
      navigate('/students');
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleReturn = async (txId, title) => {
    if (!window.confirm(`Mark "${title}" as returned?`)) return;
    try {
      const res = await returnBook(txId);
      notify('success', res.message);
      setReloadKey((k) => k + 1);
    } catch (err) {
      notify('error', err.message);
    }
  };

  if (loading) return <p className="state">Loading student...</p>;
  if (error) return <p className="state error">{error}</p>;

  return (
    <>
      <Link to="/students" className="back">
        &larr; Back to students
      </Link>
      <div className="page-head">
        <h1>{student.name}</h1>
        <div className="row">
          <button className="btn btn-light" onClick={() => setEditing((e) => !e)}>
            {editing ? 'Cancel edit' : 'Edit'}
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <StudentForm initial={student} onSubmit={handleUpdate} onCancel={() => setEditing(false)} submitLabel="Update Student" />
      ) : (
        <div className="card">
          <p><strong>Enrollment no.:</strong> {student.enrollmentNo}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p><strong>Department:</strong> {student.department || '-'}</p>
        </div>
      )}

      <h2>Borrowed books</h2>
      {student.transactions.length === 0 ? (
        <p className="state">This student has not borrowed any books yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Returned</th>
                <th>Status</th>
                <th>Fine (Rs)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {student.transactions.map((t) => (
                <tr key={t.id}>
                  <td><Link to={`/books/${t.book.id}`}>{t.book.title}</Link></td>
                  <td>{t.issueDate}</td>
                  <td>{t.dueDate}</td>
                  <td>{t.returnDate || '-'}</td>
                  <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                  <td>{t.fineAmount}</td>
                  <td>
                    {t.status !== 'Returned' && (
                      <button className="btn btn-small" onClick={() => handleReturn(t.id, t.book.title)}>
                        Return
                      </button>
                    )}
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
