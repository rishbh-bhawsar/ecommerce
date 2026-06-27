const http = require('http');
const app = require('./app');
const sequelize = require('./config/database');
const { initSocket } = require('./config/socket');
require('dotenv').config();

const server = http.createServer(app);
const io = initSocket(server);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    await sequelize.sync();
    console.log('Models synchronized');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
