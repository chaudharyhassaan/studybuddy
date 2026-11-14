const rateLimit = require('express-rate-limit');

const WINDOW_MS = 15 * 60 * 1000;

// AI routes will get their own stricter limiter when those routes are added.
const globalLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests. Try again later.',
    },
  },
});

const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many attempts. Try again later.',
    },
  },
});

module.exports = { globalLimiter, authLimiter };
