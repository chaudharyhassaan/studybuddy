const { Router } = require('express');
const { createPlan, listPlans, getPlan, deletePlan } = require('../controllers/plan.controller');
const { requireAuth } = require('../middleware/auth');
const { planLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { createPlanSchema } = require('../validators/plan.validator');

const router = Router();

router.use(requireAuth);

router.get('/', listPlans);
router.post('/', planLimiter, validate(createPlanSchema), createPlan);
router.get('/:id', getPlan);
router.delete('/:id', deletePlan);

module.exports = router;
