# College Library Book Lending System - Backend (ISA-II)

Node.js + Express + Sequelize ORM + MySQL (XAMPP). CommonJS.

## Setup steps

1. Start **MySQL** in the XAMPP Control Panel (the default user is `root` with an empty password).
2. In this folder run:
   ```bash
   npm install
   cp .env.example .env      # on Windows: copy .env.example .env   (a .env is already included)
   npm run db:setup          # create database + run migration + run seeder
   npm run dev               # API on http://localhost:5000
   ```

| Script | What it does |
| --- | --- |
| `npm run dev` | start the API with auto-restart (`node --watch`) |
| `npm start` | start the API normally |
| `npm run db:create` | create the `library_db` database |
| `npm run db:migrate` | create all tables |
| `npm run db:seed` | insert demo data |
| `npm run db:setup` | create + migrate + seed |
| `npm run db:reset` | drop the database and run `db:setup` again |

If you see `ECONNREFUSED 127.0.0.1:3306`, MySQL is not running. Start it from XAMPP.

## Folder structure

```
server/
  config/       config.js  (DB settings, used by sequelize-cli and the app)
  models/       category.js book.js student.js transaction.js index.js (associations)
  migrations/   20260101000000-create-library-tables.js   (one file, all tables)
  seeders/      20260101000000-demo-data.js               (one file, demo data)
  controllers/  category / book / student / transaction / report
  routes/       index.js
  middleware/   asyncHandler.js  errorHandler.js (404 + central error handler)
  utils/        AppError.js
  app.js  server.js  .env  .env.example  .sequelizerc  .gitignore
```

## Associations

| Relationship | Type | Sequelize code | Alias | On delete |
| --- | --- | --- | --- | --- |
| Category -> Books | 1:M | `Category.hasMany(Book)` / `Book.belongsTo(Category)` | `books` / `category` | SET NULL |
| Student <-> Book | M:N | `Student.belongsToMany(Book, { through: Transaction })` and the reverse | `borrowedBooks` / `borrowers` | - |
| Transaction -> Student | M:1 | `Transaction.belongsTo(Student)` | `student` | CASCADE |
| Transaction -> Book | M:1 | `Transaction.belongsTo(Book)` | `book` | CASCADE |

`Transaction` is the junction table. It also holds `issueDate`, `dueDate`, `returnDate`, `status`, `fineAmount`.

## Validations

| Model | Field | Rule |
| --- | --- | --- |
| Category | name | required, unique |
| Book | title, author | required, not empty |
| Book | isbn | required, unique, regex `^[0-9-]{10,17}$` |
| Book | copiesTotal | required, >= 1 |
| Book | copiesAvailable | required, >= 0; custom validator: cannot exceed copiesTotal |
| Student | email | required, unique, `isEmail` |
| Student | enrollmentNo | required, unique |
| Student | phone | required, regex `^[6-9][0-9]{9}$` |
| Transaction | status | ENUM `Issued`, `Returned`, `Overdue` |
| Transaction | fineAmount | >= 0 |
| Transaction | custom 1 | `dueDate` must be after `issueDate` |
| Transaction | custom 2 | `returnDate` cannot be before `issueDate` |
| Transaction | custom 3 | `beforeCreate` hook: cannot issue a book with 0 copies available |

## Status codes

| Code | When |
| --- | --- |
| 200 | OK (read, update, delete, return) |
| 201 | Created (create, issue) |
| 400 | Validation failed / bad request |
| 404 | Record or route not found |
| 409 | Duplicate value (unique email, enrollment no, ISBN) or foreign key problem |
| 500 | Unexpected server error |

Error body: `{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "..." }] }`

## Endpoints

Base URL: `http://localhost:5000/api`

### Categories
| Method | URL | Description |
| --- | --- | --- |
| GET | `/categories` | list all (`findAll`) |
| GET | `/categories/:id` | one category with its books (`findByPk`) |
| POST | `/categories` | create |
| PUT | `/categories/:id` | update |
| DELETE | `/categories/:id` | delete (books keep existing, `categoryId` becomes NULL) |

### Books
| Method | URL | Description |
| --- | --- | --- |
| GET | `/books` | **advanced filter** (`findAndCountAll`): `search`, `categoryId`, `available=true/false`, `sort` (title, author, publishedYear, copiesAvailable, createdAt), `order` (ASC/DESC), `page`, `limit`. Returns `{ total, page, pages, data }` |
| GET | `/books/:id` | one book with category and its transactions |
| POST | `/books` | create |
| PUT | `/books/:id` | update |
| DELETE | `/books/:id` | delete |

Example: `GET /api/books?search=data&categoryId=1&available=true&sort=title&order=ASC&page=1&limit=8`

### Students
| Method | URL | Description |
| --- | --- | --- |
| GET | `/students` | list (optional `search`, `page`, `limit`) -> `{ total, page, pages, data }` |
| GET | `/students/:id` | student with all transactions and books |
| POST | `/students` | create |
| PUT | `/students/:id` | update |
| DELETE | `/students/:id` | delete (transactions cascade) |

### Transactions (lending)
| Method | URL | Description |
| --- | --- | --- |
| GET | `/transactions` | list, filter by `status`, `studentId`, paginated |
| GET | `/transactions/:id` | one transaction |
| POST | `/transactions/issue` | issue a book (copiesAvailable - 1, inside a Sequelize transaction) |
| PUT | `/transactions/:id/return` | return a book (sets returnDate, copiesAvailable + 1, calculates fine) |
| PUT | `/transactions/:id` | change dueDate |
| DELETE | `/transactions/:id` | delete (puts the copy back if the book was still out) |

Fine = overdue days x Rs 2 (`FINE_PER_DAY` in `.env`). Default loan period = 14 days (`LOAN_DAYS`).

### Reports
| Method | URL | Description |
| --- | --- | --- |
| GET | `/reports/summary` | counts for the dashboard |
| GET | `/reports/overdue` | **raw SQL** (`sequelize.query` + `replacements`): JOIN of transactions, students, books with phone and `DATEDIFF` days overdue |

## Example payloads

Create category - `POST /api/categories`
```json
{ "name": "History", "description": "History books" }
```

Create book - `POST /api/books`
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "978-0132350884",
  "publishedYear": 2008,
  "copiesTotal": 3,
  "categoryId": 1
}
```

Create student - `POST /api/students`
```json
{
  "name": "Meera Joshi",
  "email": "meera.joshi@college.edu",
  "enrollmentNo": "BCA2024050",
  "phone": "9876512345",
  "department": "BCA"
}
```

Issue a book - `POST /api/transactions/issue`
```json
{ "studentId": 1, "bookId": 2, "dueDate": "2026-11-01" }
```
(`dueDate` is optional; default is today + 14 days)

Return a book - `PUT /api/transactions/3/return` (no body needed). Response:
```json
{ "success": true, "message": "Book returned. Fine: Rs 22", "data": { "id": 3, "status": "Returned", "fineAmount": "22.00" } }
```

Summary - `GET /api/reports/summary`
```json
{ "success": true, "data": { "totalBooks": 10, "totalCategories": 5, "totalStudents": 6, "booksIssued": 6, "booksOverdue": 3, "booksReturned": 2, "copiesAvailable": 25, "finesCollected": 4 } }
```
