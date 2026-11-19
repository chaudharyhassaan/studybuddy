const { Router } = require('express');
const {
  register,
  login,
  me,
  changeName,
  deleteAccount,
} = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  changeNameSchema,
} = require('../validators/auth.validator');

const router = Router();

// Only the credential routes get the strict limiter. GET /me runs on every
// app load, so counting it here would lock active users out of their session.
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, authLimiter, validate(changeNameSchema), changeName);
router.delete('/me', requireAuth, deleteAccount);

module.exports = router;
