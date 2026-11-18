const env = require('../config/env');
const { startOfUtcDay } = require('../utils/date');

const PER_USER_DAILY_LIMIT = 10;
const AI_LIMIT_MESSAGE = 'The daily AI limit has been reached. Try again tomorrow.';

// The free quota is shared by the whole API key, so the cap is global.
// Counters live in memory and reset at the start of each UTC day.
function createAiBudget({ dailyLimit, perUserLimit = PER_USER_DAILY_LIMIT, now = () => new Date() }) {
  let windowStart = null;
  let globalUsed = 0;
  const userUsage = new Map();

  function rollWindow(current) {
    const start = startOfUtcDay(current).getTime();

    if (windowStart !== start) {
      windowStart = start;
      globalUsed = 0;
      userUsage.clear();
    }
  }

  function consume(userId) {
    rollWindow(now());

    const key = String(userId);
    const userUsed = userUsage.get(key) || 0;

    if (globalUsed >= dailyLimit) {
      return { allowed: false, reason: 'global', globalUsed, userUsed };
    }

    if (userUsed >= perUserLimit) {
      return { allowed: false, reason: 'user', globalUsed, userUsed };
    }

    globalUsed += 1;
    userUsage.set(key, userUsed + 1);

    return { allowed: true, globalUsed, userUsed: userUsed + 1 };
  }

  function snapshot(userId) {
    rollWindow(now());

    return {
      globalUsed,
      globalLimit: dailyLimit,
      userUsed: userUsage.get(String(userId)) || 0,
      userLimit: perUserLimit,
    };
  }

  return { consume, snapshot };
}

const aiBudget = createAiBudget({ dailyLimit: env.aiDailyLimit });

function consumeAiBudget(userId) {
  return aiBudget.consume(userId);
}

module.exports = {
  createAiBudget,
  aiBudget,
  consumeAiBudget,
  AI_LIMIT_MESSAGE,
  PER_USER_DAILY_LIMIT,
};
