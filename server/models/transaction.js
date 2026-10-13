const { ValidationError } = require('sequelize');

// Transaction is the JUNCTION table of the Student <-> Book (M:N) relationship.
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    'Transaction',
    {
      studentId: { type: DataTypes.INTEGER, allowNull: false },
      bookId: { type: DataTypes.INTEGER, allowNull: false },
      issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      returnDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Issued', 'Returned', 'Overdue'),
        allowNull: false,
        defaultValue: 'Issued',
        validate: {
          isIn: {
            args: [['Issued', 'Returned', 'Overdue']],
            msg: 'Status must be Issued, Returned or Overdue',
          },
        },
      },
      fineAmount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: { args: [0], msg: 'Fine cannot be negative' } },
      },
    },
    {
      tableName: 'transactions',
      validate: {
        // Custom validator 1: due date must be after issue date
        dueDateAfterIssueDate() {
          if (this.dueDate && this.issueDate && new Date(this.dueDate) <= new Date(this.issueDate)) {
            throw new Error('Due date must be after the issue date');
          }
        },
        // Custom validator 2: return date cannot be before issue date
        returnDateNotBeforeIssueDate() {
          if (this.returnDate && this.issueDate && new Date(this.returnDate) < new Date(this.issueDate)) {
            throw new Error('Return date cannot be before the issue date');
          }
        },
      },
      hooks: {
        // Custom validator 3: a student cannot borrow a book with 0 copies available
        async beforeCreate(tx, options) {
          const book = await sequelize.models.Book.findByPk(tx.bookId, {
            transaction: options.transaction,
          });
          if (book && book.copiesAvailable < 1) {
            throw new ValidationError('No copies of this book are available', [
              { message: 'No copies of this book are available', path: 'bookId', type: 'Validation error' },
            ]);
          }
        },
      },
    }
  );

  return Transaction;
};
