module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    'Student',
    {
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: { notEmpty: { msg: 'Name is required' } },
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: { msg: 'Enter a valid email address' } },
      },
      enrollmentNo: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: { notEmpty: { msg: 'Enrollment number is required' } },
      },
      phone: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          is: {
            args: /^[6-9][0-9]{9}$/,
            msg: 'Phone must be a 10-digit Indian mobile number',
          },
        },
      },
      department: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
    },
    { tableName: 'students' }
  );

  return Student;
};
