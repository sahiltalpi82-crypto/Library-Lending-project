// Small custom error so controllers can say "this is a 404" or "this is a 400"
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

module.exports = AppError;
