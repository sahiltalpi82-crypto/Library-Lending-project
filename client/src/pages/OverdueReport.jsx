import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOverdue } from '../api.js';

export default function OverdueReport() {
  const [rows, setRows] = useState([]);
  const [finePerDay, setFinePerDay] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    getOverdue()
      .then((res) => {
        if (!ignore) {
          setRows(res.data);
          setFinePerDay(res.finePerDay);
        }
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <p className="state">Loading report...</p>;
  if (error) return <p className="state error">{error}</p>;

  return (
    <>
      <h1>Overdue Report</h1>
      <p className="muted">Fine rate: Rs {finePerDay} per day. Data comes from a raw SQL JOIN query.</p>
      {rows.length === 0 ? (
        <p className="state">No overdue books. Great!</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Student</th>
                <th>Phone</th>
                <th>Due date</th>
                <th>Days overdue</th>
                <th>Fine so far (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.transactionId}>
                  <td>{r.bookTitle}</td>
                  <td><Link to={`/students/${r.studentId}`}>{r.studentName}</Link></td>
                  <td>{r.phone}</td>
                  <td>{r.dueDate}</td>
                  <td><span className="badge badge-Overdue">{r.daysOverdue} days</span></td>
                  <td>{r.estimatedFine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
