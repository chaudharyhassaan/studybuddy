const rateLimit = require('express-rate-limit');

// Auth and AI routes will get stricter limiters when those routes are added.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests. Try again later.',
    },
  },
});

module.exports = { globalLimiter };
