import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBooks, issueBook } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

export default function IssueBook() {
  const { students, notify } = useApp();
  const [searchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState('');
  const [bookId, setBookId] = useState(searchParams.get('bookId') || '');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // load only books that still have copies on the shelf
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getBooks({ available: 'true', limit: 100, sort: 'title' })
      .then((res) => {
        if (!ignore) {
          setBooks(res.data);
          setError('');
        }
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = { studentId: Number(studentId), bookId: Number(bookId) };
      if (dueDate) body.dueDate = dueDate;
      const res = await issueBook(body);
      notify('success', `Issued "${res.data.book.title}" to ${res.data.student.name} (due ${res.data.dueDate})`);
      setStudentId('');
      setBookId('');
      setDueDate('');
      setReloadKey((k) => k + 1); // refresh the available-books list
    } catch (err) {
      notify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="state">Loading...</p>;
  if (error) return <p className="state error">{error}</p>;

  return (
    <>
      <h1>Issue a Book</h1>
      <form className="card form narrow" onSubmit={handleSubmit}>
        <label>
          Student
          <select className="input" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
            <option value="">-- select student --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.enrollmentNo})
              </option>
            ))}
          </select>
        </label>
        <label>
          Book (only available copies are listed)
          <select className="input" value={bookId} onChange={(e) => setBookId(e.target.value)} required>
            <option value="">-- select book --</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} - {b.copiesAvailable} left
              </option>
            ))}
          </select>
        </label>
        <label>
          Due date (optional, default is 14 days)
          <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Issuing...' : 'Issue Book'}
        </button>
      </form>
    </>
  );
}
