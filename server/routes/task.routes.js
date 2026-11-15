const { Router } = require('express');
const { toggleTask } = require('../controllers/task.controller');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.use(requireAuth);

router.patch('/:id/toggle', toggleTask);

module.exports = router;
