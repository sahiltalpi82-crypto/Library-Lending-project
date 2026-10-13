const { Category, Book } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/categories
exports.getAll = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.json({ success: true, data: categories });
});

// GET /api/categories/:id  (with its books)
exports.getOne = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id, {
    include: [{ model: Book, as: 'books', attributes: ['id', 'title', 'author', 'copiesAvailable'] }],
  });
  if (!category) throw new AppError('Category not found', 404);
  res.json({ success: true, data: category });
});

// POST /api/categories
exports.create = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.status(201).json({ success: true, data: category });
});

// PUT /api/categories/:id
exports.update = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  const { name, description } = req.body;
  await category.update({ name, description });
  res.json({ success: true, data: category });
});

// DELETE /api/categories/:id  (books get categoryId = NULL)
exports.remove = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  await category.destroy();
  res.json({ success: true, message: 'Category deleted' });
});
