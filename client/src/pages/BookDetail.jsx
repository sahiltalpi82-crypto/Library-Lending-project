import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteBook, getBook, updateBook } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import BookForm from '../components/BookForm.jsx';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, notify } = useApp();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getBook(id)
      .then((res) => {
        if (!ignore) {
          setBook(res.data);
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
      await updateBook(id, form);
      notify('success', 'Book updated');
      setEditing(false);
      setReloadKey((k) => k + 1);
      return true;
    } catch (err) {
      notify('error', err.message);
      return false;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      await deleteBook(id);
      notify('success', 'Book deleted');
      navigate('/books');
    } catch (err) {
      notify('error', err.message);
    }
  };

  if (loading) return <p className="state">Loading book...</p>;
  if (error) return <p className="state error">{error}</p>;

  return (
    <>
      <Link to="/books" className="back">
        &larr; Back to books
      </Link>
      <div className="page-head">
        <h1>{book.title}</h1>
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
        <BookForm
          initial={book}
          categories={categories}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Update Book"
        />
      ) : (
        <div className="card">
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>ISBN:</strong> {book.isbn}</p>
          <p><strong>Category:</strong> {book.category ? book.category.name : 'Uncategorised'}</p>
          <p><strong>Published:</strong> {book.publishedYear || '-'}</p>
          <p className={book.copiesAvailable > 0 ? 'ok' : 'bad'}>
            <strong>Copies:</strong> {book.copiesAvailable} available of {book.copiesTotal}
          </p>
          {book.copiesAvailable > 0 && (
            <Link className="btn" to={`/issue?bookId=${book.id}`}>
              Issue this book
            </Link>
          )}
        </div>
      )}

      <h2>Lending history</h2>
      {book.transactions.length === 0 ? (
        <p className="state">This book has never been issued.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Returned</th>
                <th>Status</th>
                <th>Fine (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {book.transactions.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/students/${t.student.id}`}>{t.student.name}</Link>
                  </td>
                  <td>{t.issueDate}</td>
                  <td>{t.dueDate}</td>
                  <td>{t.returnDate || '-'}</td>
                  <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                  <td>{t.fineAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
