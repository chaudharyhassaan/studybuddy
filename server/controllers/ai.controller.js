const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const { generateQuiz, generateFlashcards } = require('../services/ai');
const { consumeAiBudget, AI_LIMIT_MESSAGE } = require('../services/aiBudget');
const { toPublicQuiz, toPublicFlashcards } = require('../utils/serializers');

function planNotFound(res) {
  return res.status(404).json({ error: { message: 'Plan not found.' } });
}

function invalidTopic(res) {
  return res.status(400).json({ error: { message: 'That topic is not part of this plan.' } });
}

function invalidPlanReference(res) {
  return res.status(400).json({ error: { message: 'Choose a valid plan.' } });
}

function dailyLimitReached(res) {
  return res.status(429).json({ error: { message: AI_LIMIT_MESSAGE } });
}

function aiFailed(res) {
  return res.status(502).json({ error: { message: 'AI generation failed. Try again.' } });
}

async function findOwnedPlan(userId, planId) {
  return Plan.findOne({ _id: planId, userId }).select('_id topics');
}

function matchPlanTopic(plan, topic) {
  const wanted = topic.toLowerCase();

  return plan.topics.find((planTopic) => planTopic.toLowerCase() === wanted) || null;
}

async function createQuiz(req, res, next) {
  const { planId, topic, count } = req.body;

  try {
    const plan = await findOwnedPlan(req.user._id, planId);

    if (!plan) {
      return planNotFound(res);
    }

    const planTopic = matchPlanTopic(plan, topic);

    if (!planTopic) {
      return invalidTopic(res);
    }

    const budget = consumeAiBudget(req.user._id);

    if (!budget.allowed) {
      return dailyLimitReached(res);
    }

    let questions;

    try {
      questions = await generateQuiz({ topic: planTopic, count });
    } catch {
      return aiFailed(res);
    }

    await Quiz.create({
      userId: req.user._id,
      planId: plan._id,
      topic: planTopic,
      questions,
    });

    return res.status(201).json(questions);
  } catch (error) {
    return next(error);
  }
}

async function createFlashcards(req, res, next) {
  const { planId, topic, count } = req.body;

  try {
    const plan = await findOwnedPlan(req.user._id, planId);

    if (!plan) {
      return planNotFound(res);
    }

    const planTopic = matchPlanTopic(plan, topic);

    if (!planTopic) {
      return invalidTopic(res);
    }

    const budget = consumeAiBudget(req.user._id);

    if (!budget.allowed) {
      return dailyLimitReached(res);
    }

    let cards;

    try {
      cards = await generateFlashcards({ topic: planTopic, count });
    } catch {
      return aiFailed(res);
    }

    await Flashcard.create({
      userId: req.user._id,
      planId: plan._id,
      topic: planTopic,
      cards,
    });

    return res.status(201).json(cards);
  } catch (error) {
    return next(error);
  }
}

async function requireOwnedPlan(req, res) {
  const { planId } = req.query;

  if (!mongoose.isValidObjectId(planId)) {
    invalidPlanReference(res);
    return null;
  }

  const plan = await findOwnedPlan(req.user._id, planId);

  if (!plan) {
    planNotFound(res);
    return null;
  }

  return plan;
}

async function listQuizzes(req, res, next) {
  try {
    const plan = await requireOwnedPlan(req, res);

    if (!plan) {
      return undefined;
    }

    const quizzes = await Quiz.find({ planId: plan._id, userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json({ quizzes: quizzes.map(toPublicQuiz) });
  } catch (error) {
    return next(error);
  }
}

async function listFlashcards(req, res, next) {
  try {
    const plan = await requireOwnedPlan(req, res);

    if (!plan) {
      return undefined;
    }

    const decks = await Flashcard.find({ planId: plan._id, userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json({ flashcards: decks.map(toPublicFlashcards) });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createQuiz, createFlashcards, listQuizzes, listFlashcards };
