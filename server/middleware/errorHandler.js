// 404 for unknown routes
const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Central error handler: 400 validation, 404, 409 duplicate, 500 everything else
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // 409 - duplicate value (unique email / enrollmentNo / isbn / category name)
  // (checked first because UniqueConstraintError is also a kind of ValidationError)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = Object.keys(err.fields || {}).join(', ') || 'value';
    return res.status(409).json({
      success: false,
      message: `Duplicate entry: ${fields} already exists`,
      errors: (err.errors || []).map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // 400 - Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: (err.errors || []).map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // 409 - foreign key problems (e.g. unknown categoryId / studentId)
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Related record does not exist or is still in use',
    });
  }

  // Errors we threw ourselves with a status (AppError)
  if (err.status) {
    return res.status(err.status).json({ success: false, message: err.message });
  }

  // Database not reachable
  if (err.name === 'SequelizeConnectionRefusedError' || err.name === 'SequelizeConnectionError') {
    return res.status(500).json({
      success: false,
      message: 'Cannot connect to MySQL. Is XAMPP MySQL running?',
    });
  }

  console.error(err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};

module.exports = { notFound, errorHandler };
