const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Task = require('../models/Task');
const { generateSchedule } = require('../services/ai');
const { startOfUtcDay, toDateOnly, parseDateOnly } = require('../utils/date');
const { toPublicPlan, toPublicTask } = require('../utils/serializers');

function planNotFound(res) {
  return res.status(404).json({
    error: {
      message: 'Plan not found.',
    },
  });
}

async function createPlan(req, res, next) {
  const { title, subject, examDate, hoursPerDay, topics } = req.body;
  const startDate = toDateOnly(startOfUtcDay());

  let tasks;

  try {
    tasks = await generateSchedule({
      subject,
      topics,
      examDate,
      hoursPerDay,
      startDate,
    });
  } catch {
    const error = new Error('Plan generation failed.');
    error.status = 502;
    return next(error);
  }

  let plan;

  try {
    plan = await Plan.create({
      userId: req.user._id,
      title: title || subject,
      subject,
      examDate: parseDateOnly(examDate),
      hoursPerDay,
      topics,
    });

    const savedTasks = await Task.insertMany(
      tasks.map((task) => ({
        planId: plan._id,
        userId: req.user._id,
        date: parseDateOnly(task.date),
        topic: task.topic,
        description: task.description,
        completed: false,
        completedAt: null,
      }))
    );

    return res.status(201).json({
      plan: toPublicPlan(plan),
      tasks: savedTasks.map(toPublicTask),
    });
  } catch (error) {
    if (plan) {
      await Task.deleteMany({ planId: plan._id, userId: req.user._id }).catch(() => {});
      await Plan.deleteOne({ _id: plan._id, userId: req.user._id }).catch(() => {});
    }
    return next(error);
  }
}

async function listPlans(req, res, next) {
  try {
    const plans = await Plan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ plans: plans.map(toPublicPlan) });
  } catch (error) {
    return next(error);
  }
}

async function getPlan(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return planNotFound(res);
  }

  try {
    const plan = await Plan.findOne({ _id: req.params.id, userId: req.user._id });

    if (!plan) {
      return planNotFound(res);
    }

    const tasks = await Task.find({ planId: plan._id, userId: req.user._id }).sort({
      date: 1,
      _id: 1,
    });

    return res.json({
      plan: toPublicPlan(plan),
      tasks: tasks.map(toPublicTask),
    });
  } catch (error) {
    return next(error);
  }
}

async function getPlanProgress(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return planNotFound(res);
  }

  try {
    const plan = await Plan.findOne({ _id: req.params.id, userId: req.user._id }).select('_id');

    if (!plan) {
      return planNotFound(res);
    }

    const tasks = await Task.find({ planId: plan._id, userId: req.user._id })
      .select('date completed')
      .lean();

    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const perDay = new Map();

    for (const task of tasks) {
      const date = toDateOnly(task.date);
      const entry = perDay.get(date) || { date, completed: 0, total: 0 };
      entry.total += 1;
      if (task.completed) {
        entry.completed += 1;
      }
      perDay.set(date, entry);
    }

    const days = Array.from(perDay.values()).sort((a, b) => a.date.localeCompare(b.date));

    return res.json({
      planId: plan._id.toString(),
      completed,
      total,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      days,
    });
  } catch (error) {
    return next(error);
  }
}

async function deletePlan(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return planNotFound(res);
  }

  try {
    const plan = await Plan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!plan) {
      return planNotFound(res);
    }

    await Task.deleteMany({ planId: plan._id, userId: req.user._id });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = { createPlan, listPlans, getPlan, getPlanProgress, deletePlan };
