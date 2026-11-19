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

// Multer rejects uploads before the route runs, so map its codes to the same
// plain messages the document page shows for its own checks.
const UPLOAD_ERRORS = {
  LIMIT_FILE_SIZE: { status: 413, message: 'That file is larger than 10 MB.' },
  LIMIT_FILE_COUNT: { status: 400, message: 'Upload one file at a time.' },
  LIMIT_PART_COUNT: { status: 400, message: 'The upload has too many parts.' },
  LIMIT_FIELD_COUNT: { status: 400, message: 'The upload has too many fields.' },
  LIMIT_FIELD_KEY: { status: 400, message: 'The upload has an invalid field.' },
  LIMIT_FIELD_VALUE: { status: 400, message: 'That prompt is too long.' },
  LIMIT_UNEXPECTED_FILE: { status: 400, message: 'Upload one file using the file field.' },
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
  let message = '';

  if (error.name === 'MulterError' && UPLOAD_ERRORS[error.code]) {
    status = UPLOAD_ERRORS[error.code].status;
    message = UPLOAD_ERRORS[error.code].message;
  } else if (error.type === 'entity.too.large') {
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

  message = message || STATUS_MESSAGES[status] || 'Something went wrong.';

  res.status(status).json({
    error: {
      message,
    },
  });
}

module.exports = { notFound, errorHandler };
