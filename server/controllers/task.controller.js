const mongoose = require('mongoose');
const Task = require('../models/Task');
const { toPublicTask } = require('../utils/serializers');
const { calculateStreak } = require('../services/streak');

function taskNotFound(res) {
  return res.status(404).json({
    error: {
      message: 'Task not found.',
    },
  });
}

async function toggleTask(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return taskNotFound(res);
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return taskNotFound(res);
    }

    const now = new Date();
    task.completed = !task.completed;

    if (task.completed) {
      task.completedAt = now;

      const next = calculateStreak(req.user, now);
      req.user.streak = next.streak;
      req.user.lastStudyDate = next.lastStudyDate;
      await req.user.save();
    } else {
      task.completedAt = null;
    }

    await task.save();

    return res.json({
      task: toPublicTask(task),
      streak: req.user.streak,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { toggleTask };
