const express = require('express');
const category = require('../controllers/categoryController');
const book = require('../controllers/bookController');
const student = require('../controllers/studentController');
const transaction = require('../controllers/transactionController');
const report = require('../controllers/reportController');

const router = express.Router();

// Categories
router.get('/categories', category.getAll);
router.get('/categories/:id', category.getOne);
router.post('/categories', category.create);
router.put('/categories/:id', category.update);
router.delete('/categories/:id', category.remove);

// Books
router.get('/books', book.list);
router.get('/books/:id', book.getOne);
router.post('/books', book.create);
router.put('/books/:id', book.update);
router.delete('/books/:id', book.remove);

// Students
router.get('/students', student.getAll);
router.get('/students/:id', student.getOne);
router.post('/students', student.create);
router.put('/students/:id', student.update);
router.delete('/students/:id', student.remove);

// Transactions (static paths like /issue must come before /:id)
router.get('/transactions', transaction.getAll);
router.post('/transactions/issue', transaction.issue);
router.get('/transactions/:id', transaction.getOne);
router.put('/transactions/:id/return', transaction.returnBook);
router.put('/transactions/:id', transaction.update);
router.delete('/transactions/:id', transaction.remove);

// Reports
router.get('/reports/summary', report.summary);
router.get('/reports/overdue', report.overdue);

module.exports = router;
