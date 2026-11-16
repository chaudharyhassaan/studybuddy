const Plan = require('../models/Plan');
const Task = require('../models/Task');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const User = require('../models/User');

// Every query is scoped to the authenticated user id. The user document is
// removed last so a failed delete can be retried without losing the account.
async function deleteAccountData(userId) {
  await Promise.all([
    Task.deleteMany({ userId }),
    Quiz.deleteMany({ userId }),
    Flashcard.deleteMany({ userId }),
    Plan.deleteMany({ userId }),
  ]);

  await User.deleteOne({ _id: userId });
}

module.exports = { deleteAccountData };
