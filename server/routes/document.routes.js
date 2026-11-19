const { Router } = require('express');
const { summarize } = require('../controllers/document.controller');
const { requireAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/upload');
const { validate } = require('../middleware/validate');
const { summarizeRequestSchema } = require('../validators/document.validator');

const router = Router();

router.use(requireAuth);

// The limiter runs before the upload so a blocked account never parses a file.
router.post(
  '/summarize',
  aiLimiter,
  upload.single('file'),
  validate(summarizeRequestSchema),
  summarize
);

module.exports = router;
