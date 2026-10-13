const { Op } = require('sequelize');
const { Book, Category, Student, Transaction } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

const SORTABLE = ['title', 'author', 'publishedYear', 'copiesAvailable', 'createdAt'];

// GET /api/books?search=&categoryId=&available=true&sort=title&order=ASC&page=1&limit=8
// Advanced filtering: category + availability + search (Op.like / Op.or) + sort + pagination
exports.list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 100);
  const sort = SORTABLE.includes(req.query.sort) ? req.query.sort : 'title';
  const order = String(req.query.order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const where = {};

  if (req.query.search) {
    const term = `%${req.query.search}%`;
    where[Op.or] = [{ title: { [Op.like]: term } }, { author: { [Op.like]: term } }];
  }
  if (req.query.categoryId) {
    where.categoryId = req.query.categoryId;
  }
  if (req.query.available === 'true') {
    where.copiesAvailable = { [Op.gt]: 0 };
  } else if (req.query.available === 'false') {
    where.copiesAvailable = 0;
  }

  const { count, rows } = await Book.findAndCountAll({
    where,
    include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    order: [[sort, order]],
    limit,
    offset: (page - 1) * limit,
  });

  res.json({
    total: count,
    page,
    pages: Math.max(Math.ceil(count / limit), 1),
    data: rows,
  });
});

// GET /api/books/:id  (with category and the students who borrowed it)
exports.getOne = asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id, {
    include: [
      { model: Category, as: 'category' },
      {
        model: Transaction,
        as: 'transactions',
        include: [{ model: Student, as: 'student', attributes: ['id', 'name', 'enrollmentNo'] }],
      },
    ],
    order: [[{ model: Transaction, as: 'transactions' }, 'issueDate', 'DESC']],
  });
  if (!book) throw new AppError('Book not found', 404);
  res.json({ success: true, data: book });
});

// POST /api/books
exports.create = asyncHandler(async (req, res) => {
  const { title, author, isbn, publishedYear, copiesTotal, copiesAvailable, categoryId } = req.body;
  const total = copiesTotal === undefined || copiesTotal === '' ? 1 : Number(copiesTotal);
  const book = await Book.create({
    title,
    author,
    isbn,
    publishedYear: publishedYear === '' ? null : publishedYear,
    copiesTotal: total,
    // a new book starts with all copies on the shelf unless told otherwise
    copiesAvailable: copiesAvailable === undefined || copiesAvailable === '' ? total : Number(copiesAvailable),
    categoryId: categoryId === '' ? null : categoryId,
  });
  res.status(201).json({ success: true, data: book });
});

// PUT /api/books/:id
exports.update = asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) throw new AppError('Book not found', 404);

  const fields = {};
  ['title', 'author', 'isbn', 'publishedYear', 'copiesTotal', 'copiesAvailable', 'categoryId'].forEach((f) => {
    if (req.body[f] !== undefined) fields[f] = req.body[f] === '' ? null : req.body[f];
  });
  await book.update(fields);
  res.json({ success: true, data: book });
});

// DELETE /api/books/:id
exports.remove = asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) throw new AppError('Book not found', 404);
  await book.destroy();
  res.json({ success: true, message: 'Book deleted' });
});
