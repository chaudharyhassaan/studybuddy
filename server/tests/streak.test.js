const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateStreak } = require('../services/streak');

function utcDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

test('first completion starts the streak at 1', () => {
  const result = calculateStreak(
    { streak: 0, lastStudyDate: null },
    new Date('2026-11-15T18:30:00.000Z')
  );

  assert.deepEqual(result, {
    streak: 1,
    lastStudyDate: utcDate('2026-11-15'),
  });
});

test('a completion on the same UTC day keeps the streak unchanged', () => {
  const result = calculateStreak(
    { streak: 5, lastStudyDate: new Date('2026-11-15T07:15:00.000Z') },
    new Date('2026-11-15T22:45:00.000Z')
  );

  assert.deepEqual(result, {
    streak: 5,
    lastStudyDate: utcDate('2026-11-15'),
  });
});

test('a completion the next UTC day increments the streak', () => {
  const result = calculateStreak(
    { streak: 5, lastStudyDate: new Date('2026-11-14T21:00:00.000Z') },
    new Date('2026-11-15T06:00:00.000Z')
  );

  assert.deepEqual(result, {
    streak: 6,
    lastStudyDate: utcDate('2026-11-15'),
  });
});

test('a gap of more than one day resets the streak to 1', () => {
  const result = calculateStreak(
    { streak: 9, lastStudyDate: new Date('2026-11-13T12:00:00.000Z') },
    new Date('2026-11-15T12:00:00.000Z')
  );

  assert.deepEqual(result, {
    streak: 1,
    lastStudyDate: utcDate('2026-11-15'),
  });
});

test('an old lastStudyDate resets the streak to 1', () => {
  const result = calculateStreak(
    { streak: 30, lastStudyDate: new Date('2026-01-02T09:00:00.000Z') },
    new Date('2026-11-15T09:00:00.000Z')
  );

  assert.deepEqual(result, {
    streak: 1,
    lastStudyDate: utcDate('2026-11-15'),
  });
});

test('day boundaries use UTC, not local time', () => {
  const result = calculateStreak(
    { streak: 2, lastStudyDate: new Date('2026-11-14T23:50:00.000Z') },
    new Date('2026-11-15T00:10:00.000Z')
  );

  assert.deepEqual(result, {
    streak: 3,
    lastStudyDate: utcDate('2026-11-15'),
  });
});

test('a missing date restarts the streak at 1 even with an old score', () => {
  const result = calculateStreak(
    { streak: 12, lastStudyDate: null },
    new Date('2026-11-15T11:00:00.000Z')
  );

  assert.deepEqual(result, {
    streak: 1,
    lastStudyDate: utcDate('2026-11-15'),
  });
});

test('a future lastStudyDate resets the streak to 1', () => {
  const result = calculateStreak(
    { streak: 4, lastStudyDate: new Date('2026-11-20T08:00:00.000Z') },
    new Date('2026-11-15T08:00:00.000Z')
  );

  assert.deepEqual(result, {
    streak: 1,
    lastStudyDate: utcDate('2026-11-15'),
  });
});

test('a negative streak value is normalised before incrementing', () => {
  const result = calculateStreak(
    { streak: -3, lastStudyDate: new Date('2026-11-14T10:00:00.000Z') },
    new Date('2026-11-15T10:00:00.000Z')
  );

  assert.deepEqual(result, {
    streak: 1,
    lastStudyDate: utcDate('2026-11-15'),
  });
});
