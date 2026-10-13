module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    'Book',
    {
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: { msg: 'Title is required' } },
      },
      author: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { notEmpty: { msg: 'Author is required' } },
      },
      isbn: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          is: {
            args: /^[0-9-]{10,17}$/,
            msg: 'ISBN must be 10-17 characters (digits and hyphens only)',
          },
        },
      },
      publishedYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1000, max: 2100 },
      },
      copiesTotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: { args: [1], msg: 'Total copies must be at least 1' } },
      },
      copiesAvailable: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: { args: [0], msg: 'Available copies cannot be negative' } },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true, // SET NULL when its category is deleted
      },
    },
    {
      tableName: 'books',
      validate: {
        // Custom validator: available copies can never exceed total copies
        availableNotMoreThanTotal() {
          if (
            this.copiesAvailable != null &&
            this.copiesTotal != null &&
            this.copiesAvailable > this.copiesTotal
          ) {
            throw new Error('Available copies cannot exceed total copies');
          }
        },
      },
    }
  );

  return Book;
};
