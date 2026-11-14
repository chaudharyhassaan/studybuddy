const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Task = require('../models/Task');
const { generateSchedule } = require('../services/ai');
const { startOfUtcDay, toDateOnly, parseDateOnly } = require('../utils/date');

function toPublicPlan(plan) {
  return {
    id: plan._id.toString(),
    title: plan.title,
    subject: plan.subject,
    examDate: toDateOnly(plan.examDate),
    hoursPerDay: plan.hoursPerDay,
    topics: plan.topics,
    createdAt: plan.createdAt,
  };
}

function toPublicTask(task) {
  return {
    id: task._id.toString(),
    planId: task.planId.toString(),
    date: toDateOnly(task.date),
    topic: task.topic,
    description: task.description,
    completed: task.completed,
    completedAt: task.completedAt,
  };
}

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

module.exports = { createPlan, listPlans, getPlan, deletePlan };
