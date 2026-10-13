require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');
  } catch (err) {
    console.error('Could not connect to MySQL:', err.message);
    console.error('-> Open XAMPP and START MySQL, then run: npm run db:setup');
    process.exit(1);
  }

  app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
})();
