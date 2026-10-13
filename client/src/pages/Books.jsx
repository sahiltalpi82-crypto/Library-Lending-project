import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBook, deleteBook, getBooks } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import BookCard from '../components/BookCard.jsx';
import BookForm from '../components/BookForm.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchBar from '../components/SearchBar.jsx';

const LIMIT = 8;

export default function Books() {
  const { categories, notify } = useApp();

  // useState: filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [available, setAvailable] = useState('');
  const [sort, setSort] = useState('title');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [result, setResult] = useState({ total: 0, pages: 1, data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect: re-fetch whenever a filter changes. `ignore` drops stale responses.
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getBooks({ search, categoryId, available, sort, page, limit: LIMIT })
      .then((res) => {
        if (ignore) return;
        setResult(res);
        setError('');
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [search, categoryId, available, sort, page, reloadKey]);

  // changing a filter always goes back to page 1
  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  // useCallback: stable function, so memoised BookCards do not re-render needlessly
  const handleDelete = useCallback(
    async (id, title) => {
      if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
      try {
        await deleteBook(id);
        notify('success', 'Book deleted');
        setReloadKey((k) => k + 1);
      } catch (err) {
        notify('error', err.message);
      }
    },
    [notify]
  );

  const handleCreate = async (form) => {
    try {
      await createBook(form);
      notify('success', 'Book added');
      setShowForm(false);
      setReloadKey((k) => k + 1);
      return true;
    } catch (err) {
      notify('error', err.message);
      return false;
    }
  };

  // useMemo: text shown above the list is only rebuilt when its inputs change
  const summaryText = useMemo(() => {
    const parts = [`${result.total} book${result.total === 1 ? '' : 's'} found`];
    if (search) parts.push(`matching "${search}"`);
    if (categoryId) {
      const c = categories.find((x) => String(x.id) === String(categoryId));
      if (c) parts.push(`in ${c.name}`);
    }
    if (available === 'true') parts.push('(available only)');
    return parts.join(' ');
  }, [result.total, search, categoryId, available, categories]);

  return (
    <>
      <div className="page-head">
        <h1>Books</h1>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Close' : '+ Add Book'}
        </button>
      </div>

      {showForm && <BookForm categories={categories} onSubmit={handleCreate} onCancel={() => setShowForm(false)} submitLabel="Add Book" />}

      <div className="filters">
        <SearchBar value={search} onChange={changeFilter(setSearch)} placeholder="Search by title or author" />
        <select className="input" value={categoryId} onChange={(e) => changeFilter(setCategoryId)(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="input" value={available} onChange={(e) => changeFilter(setAvailable)(e.target.value)}>
          <option value="">All books</option>
          <option value="true">Available only</option>
          <option value="false">Not available</option>
        </select>
        <select className="input" value={sort} onChange={(e) => changeFilter(setSort)(e.target.value)}>
          <option value="title">Sort: Title</option>
          <option value="author">Sort: Author</option>
          <option value="publishedYear">Sort: Year</option>
          <option value="copiesAvailable">Sort: Copies</option>
        </select>
      </div>

      <p className="muted">{summaryText}</p>

      {loading && <p className="state">Loading books...</p>}
      {error && <p className="state error">{error}</p>}
      {!loading && !error && result.data.length === 0 && <p className="state">No books match your filters.</p>}

      {!error && (
        <div className="grid">
          {result.data.map((b) => (
            <BookCard key={b.id} book={b} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Pagination page={page} pages={result.pages} onPageChange={setPage} />
    </>
  );
}
