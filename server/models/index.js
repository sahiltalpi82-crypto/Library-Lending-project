const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');

const env = process.env.NODE_ENV || 'development';
const cfg = config[env];

const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
  host: cfg.host,
  port: cfg.port,
  dialect: cfg.dialect,
  logging: cfg.logging,
});

const Category = require('./category')(sequelize, DataTypes);
const Book = require('./book')(sequelize, DataTypes);
const Student = require('./student')(sequelize, DataTypes);
const Transaction = require('./transaction')(sequelize, DataTypes);

/* ---------- 1 : M  (Category has many Books) ---------- */
Category.hasMany(Book, { as: 'books', foreignKey: 'categoryId', onDelete: 'SET NULL' });
Book.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

/* ---------- M : N  (Students borrow Books through Transactions) ---------- */
Student.belongsToMany(Book, {
  through: Transaction,
  as: 'borrowedBooks',
  foreignKey: 'studentId',
  otherKey: 'bookId',
});
Book.belongsToMany(Student, {
  through: Transaction,
  as: 'borrowers',
  foreignKey: 'bookId',
  otherKey: 'studentId',
});

/* ---------- Junction model direct links (so we can include both sides) ---------- */
Transaction.belongsTo(Student, { as: 'student', foreignKey: 'studentId', onDelete: 'CASCADE' });
Transaction.belongsTo(Book, { as: 'book', foreignKey: 'bookId', onDelete: 'CASCADE' });
Student.hasMany(Transaction, { as: 'transactions', foreignKey: 'studentId', onDelete: 'CASCADE' });
Book.hasMany(Transaction, { as: 'transactions', foreignKey: 'bookId', onDelete: 'CASCADE' });

module.exports = { sequelize, Sequelize, Category, Book, Student, Transaction };
