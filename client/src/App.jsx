import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import BookDetail from './pages/BookDetail.jsx';
import Students from './pages/Students.jsx';
import StudentDetail from './pages/StudentDetail.jsx';
import IssueBook from './pages/IssueBook.jsx';
import OverdueReport from './pages/OverdueReport.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/issue" element={<IssueBook />} />
          <Route path="/overdue" element={<OverdueReport />} />
          <Route path="*" element={<p className="state">Page not found.</p>} />
        </Routes>
      </main>
      <Toast />
    </>
  );
}
