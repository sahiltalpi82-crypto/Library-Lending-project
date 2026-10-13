'use strict';

// ONE migration that creates every table (with foreign keys).
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('books', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      title: { type: Sequelize.STRING(200), allowNull: false },
      author: { type: Sequelize.STRING(150), allowNull: false },
      isbn: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      publishedYear: { type: Sequelize.INTEGER, allowNull: true },
      copiesTotal: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      copiesAvailable: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('students', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      enrollmentNo: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(10), allowNull: false },
      department: { type: Sequelize.STRING(80), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('transactions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      studentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'books', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      issueDate: { type: Sequelize.DATEONLY, allowNull: false },
      dueDate: { type: Sequelize.DATEONLY, allowNull: false },
      returnDate: { type: Sequelize.DATEONLY, allowNull: true },
      status: {
        type: Sequelize.ENUM('Issued', 'Returned', 'Overdue'),
        allowNull: false,
        defaultValue: 'Issued',
      },
      fineAmount: { type: Sequelize.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('students');
    await queryInterface.dropTable('books');
    await queryInterface.dropTable('categories');
  },
};
