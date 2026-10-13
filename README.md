# College Library Book Lending System

Full Stack mini project (ISA-II backend + ISA-III frontend), Topic 4.

- **Backend:** Node.js, Express, Sequelize ORM, MySQL (XAMPP)
- **Frontend:** React (Vite), React Router, plain CSS
- **Associations:** Category has many Books (1:M). Students borrow many Books through Transactions (M:N).

## How to run

You need Node.js 18 or newer and XAMPP.

1. Open XAMPP and **start MySQL**.
2. Backend:
   ```bash
   cd server
   npm install
   npm run db:setup     # creates library_db, runs the migration, loads demo data
   npm run dev          # http://localhost:5000
   ```
3. Frontend (open a second terminal):
   ```bash
   cd client
   npm install
   npm run dev          # http://localhost:5173
   ```
4. Open http://localhost:5173

More detail (endpoints, validations, payloads) is in [server/README.md](server/README.md).

## Folder structure

```
library-lending/
  server/   Express + Sequelize API
  client/   React (Vite) app
  README.md
```

## Rubric mapping

| Rubric item | Where it is covered |
| --- | --- |
| Project structure (config, models, migrations, seeders, controllers, routes, middleware) | `server/` folders |
| Environment and config (`.env`, `.sequelizerc`, `.gitignore`) | `server/.env`, `server/.env.example`, `server/.sequelizerc`, `server/.gitignore`, `server/config/config.js` |
| Models | `server/models/category.js`, `book.js`, `student.js`, `transaction.js` |
| Field validations (allowNull, unique, isEmail, regex, ENUM, min) | `server/models/student.js`, `book.js`, `transaction.js` |
| Custom validators (dueDate after issueDate, returnDate not before issueDate, no borrowing with 0 copies) | `server/models/transaction.js` (model validators and `beforeCreate` hook) |
| 1:M association (Category - Book) | `server/models/index.js` |
| M:N association through junction (Student - Book via Transaction) | `server/models/index.js` |
| Aliases and onDelete CASCADE / SET NULL | `server/models/index.js`, `server/migrations/20260101000000-create-library-tables.js` |
| Migration (all tables, foreign keys) | `server/migrations/20260101000000-create-library-tables.js` |
| Seeder (demo data, relative dates, overdue rows) | `server/seeders/20260101000000-demo-data.js` |
| CRUD controllers (`findAll`, `findByPk`, `findAndCountAll`, `create`, `update`, `destroy`) | `server/controllers/*.js` |
| Business logic: issue and return with Sequelize transaction and fine | `server/controllers/transactionController.js` |
| Advanced filtering (search with `Op.like` / `Op.or`, filter, sort, pagination) | `server/controllers/bookController.js` (`list`) |
| Raw SQL with `replacements` and `DATEDIFF` | `server/controllers/reportController.js` (`overdue`) |
| Summary report | `server/controllers/reportController.js` (`summary`) |
| Error handling (400, 404, 409, 500) and `asyncHandler` | `server/middleware/errorHandler.js`, `server/middleware/asyncHandler.js` |
| Routes | `server/routes/index.js` |
| npm scripts (dev, db:create, db:migrate, db:seed, db:setup, db:reset) | `server/package.json` |
| Backend documentation | `server/README.md` |
| Vite proxy | `client/vite.config.js` |
| Single API file | `client/src/api.js` |
| React Router pages | `client/src/App.jsx`, `client/src/pages/*.jsx` |
| Reusable components with props | `client/src/components/*.jsx` |
| `useState` (forms, filters) | `client/src/pages/Books.jsx`, `client/src/components/BookForm.jsx`, `StudentForm.jsx` |
| `useEffect` with ignore flag, re-fetch on filter change | `client/src/pages/Books.jsx` (also Dashboard, BookDetail, StudentDetail) |
| `useReducer` + `useContext` (categories, students, toasts) | `client/src/context/AppContext.jsx`, `client/src/components/Toast.jsx` |
| `useRef` (autofocus search) | `client/src/components/SearchBar.jsx` |
| `useMemo` (filtered list) | `client/src/pages/Students.jsx`, `client/src/pages/Books.jsx` |
| `useCallback` + `React.memo` | `client/src/pages/Books.jsx` (`handleDelete`), `client/src/components/BookCard.jsx` |
| Loading and error states, confirm before delete | every page in `client/src/pages/` |
| Responsive CSS | `client/src/index.css` |
