import { memo } from 'react';
import { Link } from 'react-router-dom';

// React.memo: the card only re-renders when its own book (or onDelete) changes
function BookCard({ book, onDelete }) {
  const available = book.copiesAvailable > 0;
  return (
    <div className="card book-card">
      <h3>
        <Link to={`/books/${book.id}`}>{book.title}</Link>
      </h3>
      <p className="muted">by {book.author}</p>
      <p>
        <span className="tag">{book.category ? book.category.name : 'Uncategorised'}</span>
      </p>
      <p className={available ? 'ok' : 'bad'}>
        {available ? `${book.copiesAvailable} of ${book.copiesTotal} available` : 'All copies issued'}
      </p>
      <div className="row">
        <Link className="btn btn-small" to={`/books/${book.id}`}>
          View
        </Link>
        <button className="btn btn-small btn-danger" onClick={() => onDelete(book.id, book.title)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default memo(BookCard);
