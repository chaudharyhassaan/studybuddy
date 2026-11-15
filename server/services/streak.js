const { startOfUtcDay } = require('../utils/date');

const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeStreak(streak) {
  return Number.isFinite(streak) && streak > 0 ? Math.floor(streak) : 0;
}

function calculateStreak({ streak = 0, lastStudyDate = null }, now = new Date()) {
  const today = startOfUtcDay(now);
  const current = normalizeStreak(streak);

  if (!lastStudyDate) {
    return { streak: 1, lastStudyDate: today };
  }

  const last = startOfUtcDay(new Date(lastStudyDate));
  const dayDifference = Math.round((today.getTime() - last.getTime()) / DAY_MS);

  if (dayDifference === 0) {
    return { streak: current, lastStudyDate: last };
  }

  if (dayDifference === 1) {
    return { streak: current + 1, lastStudyDate: today };
  }

  return { streak: 1, lastStudyDate: today };
}

module.exports = { calculateStreak };
