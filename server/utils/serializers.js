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

function toPublicQuiz(quiz) {
  return {
    id: quiz._id.toString(),
    planId: quiz.planId.toString(),
    topic: quiz.topic,
    createdAt: quiz.createdAt,
    questions: quiz.questions.map((item) => ({
      question: item.question,
      options: item.options,
      answerIndex: item.answerIndex,
      explanation: item.explanation,
    })),
  };
}

function toPublicFlashcards(deck) {
  return {
    id: deck._id.toString(),
    planId: deck.planId.toString(),
    topic: deck.topic,
    createdAt: deck.createdAt,
    cards: deck.cards.map((card) => ({
      front: card.front,
      back: card.back,
    })),
  };
}

module.exports = { toPublicPlan, toPublicTask, toPublicQuiz, toPublicFlashcards };
