const test = require('node:test');
const assert = require('node:assert/strict');
const Plan = require('../models/Plan');
const Task = require('../models/Task');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const { getPlan, getPlanProgress, deletePlan } = require('../controllers/plan.controller');
const { toggleTask } = require('../controllers/task.controller');
const { createQuiz, listQuizzes, listFlashcards } = require('../controllers/ai.controller');

// These tests stub the models, so they never open a database connection.
// Each test asserts that a user-owned query carries the authenticated user id,
// which is what stops one account from reading another account's data.

const USER_A = 'user-a';
const PLAN_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const TASK_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
  };
}

function captureNext() {
  const errors = [];
  const next = (error) => {
    if (error) {
      errors.push(error);
    }
  };
  next.errors = errors;
  return next;
}

test('getPlan queries by both plan id and the authenticated user', async () => {
  const original = Plan.findOne;
  let filter;

  Plan.findOne = (value) => {
    filter = value;
    return Promise.resolve(null);
  };

  try {
    const res = createResponse();
    const next = captureNext();

    await getPlan({ user: { _id: USER_A }, params: { id: PLAN_ID } }, res, next);

    assert.deepEqual(next.errors, []);
    assert.deepEqual(filter, { _id: PLAN_ID, userId: USER_A });
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error.message, 'Plan not found.');
  } finally {
    Plan.findOne = original;
  }
});

test('getPlanProgress never reads progress from another user plan', async () => {
  const original = Plan.findOne;
  let filter;

  Plan.findOne = (value) => {
    filter = value;
    return { select: async () => null };
  };

  try {
    const res = createResponse();
    const next = captureNext();

    await getPlanProgress({ user: { _id: USER_A }, params: { id: PLAN_ID } }, res, next);

    assert.deepEqual(next.errors, []);
    assert.deepEqual(filter, { _id: PLAN_ID, userId: USER_A });
    assert.equal(res.statusCode, 404);
  } finally {
    Plan.findOne = original;
  }
});

test('deletePlan scopes the delete to the authenticated user', async () => {
  const originalPlan = Plan.findOneAndDelete;
  const originalTask = Task.deleteMany;
  let filter;
  let deletedTasks = false;

  Plan.findOneAndDelete = (value) => {
    filter = value;
    return Promise.resolve(null);
  };
  Task.deleteMany = async () => {
    deletedTasks = true;
    return { deletedCount: 0 };
  };

  try {
    const res = createResponse();
    const next = captureNext();

    await deletePlan({ user: { _id: USER_A }, params: { id: PLAN_ID } }, res, next);

    assert.deepEqual(next.errors, []);
    assert.deepEqual(filter, { _id: PLAN_ID, userId: USER_A });
    assert.equal(res.statusCode, 404);
    assert.equal(deletedTasks, false);
  } finally {
    Plan.findOneAndDelete = originalPlan;
    Task.deleteMany = originalTask;
  }
});

test('toggleTask reads a task by both task id and the authenticated user', async () => {
  const original = Task.findOne;
  let filter;

  Task.findOne = (value) => {
    filter = value;
    return Promise.resolve(null);
  };

  try {
    const res = createResponse();
    const next = captureNext();

    await toggleTask({ user: { _id: USER_A }, params: { id: TASK_ID } }, res, next);

    assert.deepEqual(next.errors, []);
    assert.deepEqual(filter, { _id: TASK_ID, userId: USER_A });
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error.message, 'Task not found.');
  } finally {
    Task.findOne = original;
  }
});

test('listQuizzes refuses a plan owned by another user', async () => {
  const originalPlan = Plan.findOne;
  const originalQuiz = Quiz.find;
  let quizQueried = false;

  Plan.findOne = () => ({ select: async () => null });
  Quiz.find = () => {
    quizQueried = true;
    return { sort: async () => [] };
  };

  try {
    const res = createResponse();
    const next = captureNext();

    await listQuizzes({ user: { _id: USER_A }, query: { planId: PLAN_ID } }, res, next);

    assert.deepEqual(next.errors, []);
    assert.equal(res.statusCode, 404);
    assert.equal(quizQueried, false);
  } finally {
    Plan.findOne = originalPlan;
    Quiz.find = originalQuiz;
  }
});

test('listQuizzes scopes the quiz query to the plan and the authenticated user', async () => {
  const originalPlan = Plan.findOne;
  const originalQuiz = Quiz.find;
  let filter;

  Plan.findOne = () => ({ select: async () => ({ _id: 'plan-1', topics: [] }) });
  Quiz.find = (value) => {
    filter = value;
    return { sort: async () => [] };
  };

  try {
    const res = createResponse();
    const next = captureNext();

    await listQuizzes({ user: { _id: USER_A }, query: { planId: PLAN_ID } }, res, next);

    assert.deepEqual(next.errors, []);
    assert.deepEqual(filter, { planId: 'plan-1', userId: USER_A });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { quizzes: [] });
  } finally {
    Plan.findOne = originalPlan;
    Quiz.find = originalQuiz;
  }
});

test('listFlashcards refuses a plan owned by another user', async () => {
  const originalPlan = Plan.findOne;
  const originalFlashcard = Flashcard.find;
  let deckQueried = false;

  Plan.findOne = () => ({ select: async () => null });
  Flashcard.find = () => {
    deckQueried = true;
    return { sort: async () => [] };
  };

  try {
    const res = createResponse();
    const next = captureNext();

    await listFlashcards({ user: { _id: USER_A }, query: { planId: PLAN_ID } }, res, next);

    assert.deepEqual(next.errors, []);
    assert.equal(res.statusCode, 404);
    assert.equal(deckQueried, false);
  } finally {
    Plan.findOne = originalPlan;
    Flashcard.find = originalFlashcard;
  }
});

test('createQuiz refuses to generate a quiz for another user plan', async () => {
  const originalPlan = Plan.findOne;
  const originalCreate = Quiz.create;
  let filter;
  let created = false;

  Plan.findOne = (value) => {
    filter = value;
    return { select: async () => null };
  };
  Quiz.create = async () => {
    created = true;
    return {};
  };

  try {
    const res = createResponse();
    const next = captureNext();

    await createQuiz(
      {
        user: { _id: USER_A },
        body: { planId: PLAN_ID, topic: 'Cells', count: 5 },
      },
      res,
      next
    );

    assert.deepEqual(next.errors, []);
    assert.deepEqual(filter, { _id: PLAN_ID, userId: USER_A });
    assert.equal(res.statusCode, 404);
    assert.equal(created, false);
  } finally {
    Plan.findOne = originalPlan;
    Quiz.create = originalCreate;
  }
});
