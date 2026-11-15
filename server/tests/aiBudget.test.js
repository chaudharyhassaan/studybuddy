const test = require('node:test');
const assert = require('node:assert/strict');
const { createAiBudget } = require('../services/aiBudget');

// These tests never touch the network and never call Gemini.

function fixedClock(value) {
  const current = { value };

  return {
    now: () => current.value,
    advanceTo: (next) => {
      current.value = next;
    },
  };
}

test('the per-user cap stops one user before the global cap', () => {
  const clock = fixedClock(new Date('2026-11-15T09:00:00.000Z'));
  const budget = createAiBudget({ dailyLimit: 10, perUserLimit: 2, now: clock.now });

  assert.equal(budget.consume('user-a').allowed, true);
  assert.equal(budget.consume('user-a').allowed, true);

  const third = budget.consume('user-a');
  assert.equal(third.allowed, false);
  assert.equal(third.reason, 'user');
  assert.equal(third.userUsed, 2);
  assert.equal(third.globalUsed, 2);
});

test('the per-user cap does not block other users', () => {
  const clock = fixedClock(new Date('2026-11-15T09:00:00.000Z'));
  const budget = createAiBudget({ dailyLimit: 10, perUserLimit: 2, now: clock.now });

  budget.consume('user-a');
  budget.consume('user-a');

  assert.equal(budget.consume('user-b').allowed, true);
  assert.equal(budget.snapshot('user-b').userUsed, 1);
});

test('the global cap blocks every user once it is reached', () => {
  const clock = fixedClock(new Date('2026-11-15T09:00:00.000Z'));
  const budget = createAiBudget({ dailyLimit: 3, perUserLimit: 10, now: clock.now });

  assert.equal(budget.consume('user-a').allowed, true);
  assert.equal(budget.consume('user-b').allowed, true);
  assert.equal(budget.consume('user-c').allowed, true);

  const blocked = budget.consume('user-d');
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.reason, 'global');
  assert.equal(blocked.globalUsed, 3);
});

test('the global cap blocks a user who has not used any requests', () => {
  const clock = fixedClock(new Date('2026-11-15T09:00:00.000Z'));
  const budget = createAiBudget({ dailyLimit: 1, perUserLimit: 10, now: clock.now });

  assert.equal(budget.consume('user-a').allowed, true);
  assert.equal(budget.consume('user-b').allowed, false);
});

test('the counters reset at the start of the next UTC day', () => {
  const clock = fixedClock(new Date('2026-11-15T23:59:00.000Z'));
  const budget = createAiBudget({ dailyLimit: 2, perUserLimit: 1, now: clock.now });

  assert.equal(budget.consume('user-a').allowed, true);
  assert.equal(budget.consume('user-a').allowed, false);
  assert.equal(budget.consume('user-b').allowed, true);
  assert.equal(budget.consume('user-b').allowed, false);

  clock.advanceTo(new Date('2026-11-16T00:00:01.000Z'));

  assert.equal(budget.consume('user-a').allowed, true);
  assert.equal(budget.snapshot('user-a').userUsed, 1);
  assert.equal(budget.snapshot('user-a').globalUsed, 1);
});

test('a UTC day boundary resets counters even without a full 24 hours passing', () => {
  const clock = fixedClock(new Date('2026-11-15T23:59:59.000Z'));
  const budget = createAiBudget({ dailyLimit: 5, perUserLimit: 5, now: clock.now });

  assert.equal(budget.consume('user-a').allowed, true);

  clock.advanceTo(new Date('2026-11-16T00:00:00.000Z'));

  assert.equal(budget.snapshot('user-a').userUsed, 0);
  assert.equal(budget.snapshot('user-a').globalUsed, 0);
});

test('a rejected request does not consume part of the budget', () => {
  const clock = fixedClock(new Date('2026-11-15T09:00:00.000Z'));
  const budget = createAiBudget({ dailyLimit: 2, perUserLimit: 1, now: clock.now });

  budget.consume('user-a');
  budget.consume('user-a');
  budget.consume('user-b');
  budget.consume('user-b');

  const snapshot = budget.snapshot('user-a');
  assert.equal(snapshot.userUsed, 1);
  assert.equal(snapshot.globalUsed, 2);
});
