const { QueryTypes } = require('sequelize');
const { sequelize, Book, Category, Student, Transaction } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { markOverdue } = require('./transactionController');

const FINE_PER_DAY = Number(process.env.FINE_PER_DAY) || 2;

// GET /api/reports/summary  - counts for the dashboard
exports.summary = asyncHandler(async (req, res) => {
  await markOverdue();

  const [totalBooks, totalCategories, totalStudents, issued, overdue, returned, copiesAvailable, finesCollected] =
    await Promise.all([
      Book.count(),
      Category.count(),
      Student.count(),
      Transaction.count({ where: { status: 'Issued' } }),
      Transaction.count({ where: { status: 'Overdue' } }),
      Transaction.count({ where: { status: 'Returned' } }),
      Book.sum('copiesAvailable'),
      Transaction.sum('fineAmount', { where: { status: 'Returned' } }),
    ]);

  res.json({
    success: true,
    data: {
      totalBooks,
      totalCategories,
      totalStudents,
      booksIssued: issued + overdue, // currently out of the library
      booksOverdue: overdue,
      booksReturned: returned,
      copiesAvailable: copiesAvailable || 0,
      finesCollected: Number(finesCollected || 0),
    },
  });
});

// GET /api/reports/overdue  - RAW SQL with JOIN across transactions, students and books
exports.overdue = asyncHandler(async (req, res) => {
  const rows = await sequelize.query(
    `SELECT t.id            AS transactionId,
            b.title         AS bookTitle,
            b.isbn          AS isbn,
            s.id            AS studentId,
            s.name          AS studentName,
            s.enrollmentNo  AS enrollmentNo,
            s.phone         AS phone,
            t.issueDate     AS issueDate,
            t.dueDate       AS dueDate,
            DATEDIFF(CURDATE(), t.dueDate)              AS daysOverdue,
            DATEDIFF(CURDATE(), t.dueDate) * :finePerDay AS estimatedFine
       FROM transactions t
       JOIN students s ON s.id = t.studentId
       JOIN books    b ON b.id = t.bookId
      WHERE t.returnDate IS NULL
        AND t.dueDate < CURDATE()
      ORDER BY daysOverdue DESC`,
    {
      replacements: { finePerDay: FINE_PER_DAY },
      type: QueryTypes.SELECT,
    }
  );

  res.json({ success: true, finePerDay: FINE_PER_DAY, total: rows.length, data: rows });
});
