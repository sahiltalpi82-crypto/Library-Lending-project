const { Op } = require('sequelize');
const { Student, Book, Transaction } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/students?search=&page=1&limit=50
exports.getAll = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);

  const where = {};
  if (req.query.search) {
    const term = `%${req.query.search}%`;
    where[Op.or] = [
      { name: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { enrollmentNo: { [Op.like]: term } },
    ];
  }

  const { count, rows } = await Student.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset: (page - 1) * limit,
  });

  res.json({ total: count, page, pages: Math.max(Math.ceil(count / limit), 1), data: rows });
});

// GET /api/students/:id  (with every transaction and the book it was for)
exports.getOne = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id, {
    include: [
      {
        model: Transaction,
        as: 'transactions',
        include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'author', 'isbn'] }],
      },
    ],
    order: [[{ model: Transaction, as: 'transactions' }, 'issueDate', 'DESC']],
  });
  if (!student) throw new AppError('Student not found', 404);
  res.json({ success: true, data: student });
});

// POST /api/students
exports.create = asyncHandler(async (req, res) => {
  const { name, email, enrollmentNo, phone, department } = req.body;
  const student = await Student.create({ name, email, enrollmentNo, phone, department });
  res.status(201).json({ success: true, data: student });
});

// PUT /api/students/:id
exports.update = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) throw new AppError('Student not found', 404);
  const { name, email, enrollmentNo, phone, department } = req.body;
  await student.update({ name, email, enrollmentNo, phone, department });
  res.json({ success: true, data: student });
});

// DELETE /api/students/:id  (their transactions are removed by ON DELETE CASCADE)
exports.remove = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) throw new AppError('Student not found', 404);
  await student.destroy();
  res.json({ success: true, message: 'Student deleted' });
});
