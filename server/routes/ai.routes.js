const { Router } = require('express');
const {
  createQuiz,
  createFlashcards,
  listQuizzes,
  listFlashcards,
} = require('../controllers/ai.controller');
const { requireAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { quizRequestSchema, flashcardRequestSchema } = require('../validators/ai.validator');

const router = Router();

router.use(requireAuth);

router.post('/quiz', aiLimiter, validate(quizRequestSchema), createQuiz);
router.get('/quiz', listQuizzes);
router.post('/flashcards', aiLimiter, validate(flashcardRequestSchema), createFlashcards);
router.get('/flashcards', listFlashcards);

module.exports = router;
