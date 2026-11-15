const { toDateOnly } = require('./date');

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

module.exports = { toPublicPlan, toPublicTask };
