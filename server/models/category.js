module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: { msg: 'Category name is required' } },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    { tableName: 'categories' }
  );

  return Category;
};
