const env = require('../config/env');

const STATUS_MESSAGES = {
  400: 'Invalid request.',
  401: 'Authentication is required.',
  403: 'Origin not allowed.',
  404: 'Route not found.',
  413: 'Request body is too large.',
  429: 'Too many requests. Try again later.',
  502: 'Plan generation failed. Try again.',
};

function notFound(req, res, next) {
  const error = new Error('Route not found.');
  error.status = 404;
  next(error);
}

// Express identifies error handlers by their four arguments, so next is required.
function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let status = Number(error.status || error.statusCode) || 500;

  if (error.type === 'entity.too.large') {
    status = 413;
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
  }

  if (status < 400 || status > 599) {
    status = 500;
  }

  if (!env.isProduction) {
    console.error(error.stack || error);
  }

  const message = STATUS_MESSAGES[status] || 'Something went wrong.';

  res.status(status).json({
    error: {
      message,
    },
  });
}

module.exports = { notFound, errorHandler };
