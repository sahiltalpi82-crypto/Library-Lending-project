import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/books', label: 'Books' },
  { to: '/students', label: 'Students' },
  { to: '/issue', label: 'Issue Book' },
  { to: '/overdue', label: 'Overdue' },
];

export default function Navbar({ title = 'College Library' }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand">{title}</span>
        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
