import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSummary } from '../api.js';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false; // ignore flag: skip results of a stale request
    setLoading(true);
    getSummary()
      .then((res) => {
        if (!ignore) {
          setSummary(res.data);
          setError('');
        }
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <p className="state">Loading dashboard...</p>;
  if (error) return <p className="state error">{error}</p>;

  const stats = [
    { label: 'Total Books', value: summary.totalBooks },
    { label: 'Copies Available', value: summary.copiesAvailable },
    { label: 'Categories', value: summary.totalCategories },
    { label: 'Students', value: summary.totalStudents },
    { label: 'Books Currently Issued', value: summary.booksIssued },
    { label: 'Overdue', value: summary.booksOverdue, danger: true },
    { label: 'Returned', value: summary.booksReturned },
    { label: 'Fines Collected (Rs)', value: summary.finesCollected },
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className={`card stat ${s.danger ? 'stat-danger' : ''}`}>
            <span className="stat-value">{s.value}</span>
            <span className="muted">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="row">
        <Link className="btn" to="/issue">
          Issue a Book
        </Link>
        <Link className="btn btn-light" to="/overdue">
          View Overdue Report
        </Link>
      </div>
    </>
  );
}
