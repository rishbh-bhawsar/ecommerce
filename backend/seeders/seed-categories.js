const sequelize = require('../config/database');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  { name: 'Clothing', description: 'Apparel and fashion items' },
  { name: 'Books', description: 'Physical and digital books' },
  { name: 'Home', description: 'Home decor and furniture' },
  { name: 'Sports', description: 'Sports equipment and gear' },
  { name: 'Beauty', description: 'Beauty and personal care products' },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync();
    console.log('Models synchronized');

    const result = await Category.bulkCreate(categories, { ignoreDuplicates: true });
    console.log(`${result.length} categories inserted`);

    const all = await Category.findAll();
    console.log('All categories:', all.map((c) => `${c.id}: ${c.name}`).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
