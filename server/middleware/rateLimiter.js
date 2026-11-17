const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const WINDOW_MS = 15 * 60 * 1000;

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

// Keyed by user because this limiter runs after requireAuth.
const planLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => (req.user ? `user:${req.user.id}` : ipKeyGenerator(req.ip)),
  message: {
    error: {
      message: 'Plan generation limit reached. Try again later.',
    },
  },
});

// Also keyed by user, so one account cannot use up another account's budget.
const aiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => (req.user ? `user:${req.user.id}` : ipKeyGenerator(req.ip)),
  message: {
    error: {
      message: 'AI request limit reached. Try again later.',
    },
  },
});

module.exports = { globalLimiter, authLimiter, planLimiter, aiLimiter };
