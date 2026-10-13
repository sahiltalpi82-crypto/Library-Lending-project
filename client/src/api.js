// Every fetch call of the app lives in this one file.
const BASE = '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Failed to reach the server. Is the backend running on port 5000?');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // response had no JSON body
  }

  if (!res.ok) {
    const details = data?.errors?.map((e) => e.message).join(', ');
    throw new Error(details || data?.message || `Request failed (${res.status})`);
  }
  return data;
}

const toQuery = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== undefined && v !== null) q.append(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

/* Categories */
export const getCategories = () => request('/categories');

/* Books */
export const getBooks = (params = {}) => request(`/books${toQuery(params)}`);
export const getBook = (id) => request(`/books/${id}`);
export const createBook = (body) => request('/books', { method: 'POST', body });
export const updateBook = (id, body) => request(`/books/${id}`, { method: 'PUT', body });
export const deleteBook = (id) => request(`/books/${id}`, { method: 'DELETE' });

/* Students */
export const getStudents = (params = {}) => request(`/students${toQuery({ limit: 200, ...params })}`);
export const getStudent = (id) => request(`/students/${id}`);
export const createStudent = (body) => request('/students', { method: 'POST', body });
export const updateStudent = (id, body) => request(`/students/${id}`, { method: 'PUT', body });
export const deleteStudent = (id) => request(`/students/${id}`, { method: 'DELETE' });

/* Transactions */
export const issueBook = (body) => request('/transactions/issue', { method: 'POST', body });
export const returnBook = (id) => request(`/transactions/${id}/return`, { method: 'PUT' });

/* Reports */
export const getSummary = () => request('/reports/summary');
export const getOverdue = () => request('/reports/overdue');
