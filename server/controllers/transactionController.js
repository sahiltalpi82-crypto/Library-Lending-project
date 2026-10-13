const { Op } = require('sequelize');
const { sequelize, Book, Student, Transaction } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

const FINE_PER_DAY = Number(process.env.FINE_PER_DAY) || 2; // Rs per overdue day
const LOAN_DAYS = Number(process.env.LOAN_DAYS) || 14;

const toDateString = (d) => d.toISOString().slice(0, 10);
const today = () => toDateString(new Date());
const addDays = (dateStr, n) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return toDateString(d);
};
const daysBetween = (fromStr, toStr) => Math.round((new Date(toStr) - new Date(fromStr)) / 86400000);

const withBoth = [
  { model: Student, as: 'student', attributes: ['id', 'name', 'enrollmentNo', 'phone'] },
  { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'isbn'] },
];

// Flip Issued -> Overdue for loans whose due date has passed
const markOverdue = () =>
  Transaction.update({ status: 'Overdue' }, { where: { status: 'Issued', dueDate: { [Op.lt]: today() } } });

exports.markOverdue = markOverdue;

// GET /api/transactions?status=&studentId=&page=&limit=
exports.getAll = asyncHandler(async (req, res) => {
  await markOverdue();
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.studentId) where.studentId = req.query.studentId;

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    include: withBoth,
    order: [['issueDate', 'DESC'], ['id', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });
  res.json({ total: count, page, pages: Math.max(Math.ceil(count / limit), 1), data: rows });
});

// GET /api/transactions/:id
exports.getOne = asyncHandler(async (req, res) => {
  const tx = await Transaction.findByPk(req.params.id, { include: withBoth });
  if (!tx) throw new AppError('Transaction not found', 404);
  res.json({ success: true, data: tx });
});

// POST /api/transactions/issue   body: { studentId, bookId, dueDate? }
// Reduces the book's available copies inside ONE database transaction.
exports.issue = asyncHandler(async (req, res) => {
  const { studentId, bookId } = req.body;
  if (!studentId || !bookId) throw new AppError('studentId and bookId are required', 400);

  const result = await sequelize.transaction(async (t) => {
    const student = await Student.findByPk(studentId, { transaction: t });
    if (!student) throw new AppError('Student not found', 404);

    // lock the book row so two librarians cannot issue the last copy twice
    const book = await Book.findByPk(bookId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!book) throw new AppError('Book not found', 404);

    const issueDate = today();
    const dueDate = req.body.dueDate || addDays(issueDate, LOAN_DAYS);

    // beforeCreate hook rejects the issue if copiesAvailable is 0;
    // model validators check dueDate > issueDate
    const tx = await Transaction.create(
      { studentId, bookId, issueDate, dueDate, status: 'Issued', fineAmount: 0 },
      { transaction: t }
    );

    await book.decrement('copiesAvailable', { by: 1, transaction: t });
    return tx;
  });

  const full = await Transaction.findByPk(result.id, { include: withBoth });
  res.status(201).json({ success: true, message: 'Book issued', data: full });
});

// PUT /api/transactions/:id/return
// Sets returnDate, puts the copy back, calculates fine (Rs FINE_PER_DAY per overdue day)
exports.returnBook = asyncHandler(async (req, res) => {
  const result = await sequelize.transaction(async (t) => {
    const tx = await Transaction.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!tx) throw new AppError('Transaction not found', 404);
    if (tx.status === 'Returned') throw new AppError('This book was already returned', 400);

    const returnDate = today();
    const overdueDays = Math.max(daysBetween(tx.dueDate, returnDate), 0);

    await tx.update(
      { returnDate, status: 'Returned', fineAmount: overdueDays * FINE_PER_DAY },
      { transaction: t }
    );
    await Book.increment('copiesAvailable', { by: 1, where: { id: tx.bookId }, transaction: t });
    return tx;
  });

  const full = await Transaction.findByPk(result.id, { include: withBoth });
  res.json({
    success: true,
    message: Number(full.fineAmount) > 0 ? `Book returned. Fine: Rs ${full.fineAmount}` : 'Book returned',
    data: full,
  });
});

// PUT /api/transactions/:id   (only the due date can be edited, e.g. an extension)
exports.update = asyncHandler(async (req, res) => {
  const tx = await Transaction.findByPk(req.params.id);
  if (!tx) throw new AppError('Transaction not found', 404);
  if (!req.body.dueDate) throw new AppError('dueDate is required', 400);
  await tx.update({ dueDate: req.body.dueDate, status: tx.status === 'Returned' ? 'Returned' : 'Issued' });
  res.json({ success: true, data: tx });
});

// DELETE /api/transactions/:id  (if the book was still out, the copy goes back on the shelf)
exports.remove = asyncHandler(async (req, res) => {
  await sequelize.transaction(async (t) => {
    const tx = await Transaction.findByPk(req.params.id, { transaction: t });
    if (!tx) throw new AppError('Transaction not found', 404);
    if (tx.status !== 'Returned') {
      await Book.increment('copiesAvailable', { by: 1, where: { id: tx.bookId }, transaction: t });
    }
    await tx.destroy({ transaction: t });
  });
  res.json({ success: true, message: 'Transaction deleted' });
});
