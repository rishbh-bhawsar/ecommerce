const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return sendError(res, messages.join(', '), 400);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map(e => `${e.value} already exists`);
    return sendError(res, messages.join(', '), 409);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return sendError(res, 'Referenced resource not found', 400);
  }

  if (err.message && err.message.includes('Only image files')) {
    return sendError(res, err.message, 400);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File size too large. Maximum size is 5MB', 400);
  }

  return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
};

module.exports = errorHandler;
