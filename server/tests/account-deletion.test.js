const test = require('node:test');
const assert = require('node:assert/strict');
const Plan = require('../models/Plan');
const Task = require('../models/Task');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const User = require('../models/User');
const { deleteAccountData } = require('../services/account');

// These tests use model stubs. They never open a database connection.

function stubDeleteMany(models, calls) {
  return models.map(({ name, model }) => {
    const original = model.deleteMany;
    model.deleteMany = async (filter) => {
      calls.push({ name, filter });
      return { deletedCount: 1 };
    };
    return () => {
      model.deleteMany = original;
    };
  });
}

test('account deletion removes every owned record and then the user', async () => {
  const calls = [];
  const restoreData = stubDeleteMany(
    [
      { name: 'Plan', model: Plan },
      { name: 'Task', model: Task },
      { name: 'Quiz', model: Quiz },
      { name: 'Flashcard', model: Flashcard },
    ],
    calls
  );
  const originalDeleteOne = User.deleteOne;
  User.deleteOne = async (filter) => {
    calls.push({ name: 'User', filter });
    return { deletedCount: 1 };
  };

  try {
    await deleteAccountData('user-123');
  } finally {
    restoreData.forEach((restore) => restore());
    User.deleteOne = originalDeleteOne;
  }

  const dataCalls = calls.filter((call) => call.name !== 'User');
  assert.equal(dataCalls.length, 4);

  for (const call of dataCalls) {
    assert.deepEqual(call.filter, { userId: 'user-123' });
  }

  assert.deepEqual(calls.at(-1), { name: 'User', filter: { _id: 'user-123' } });
});
