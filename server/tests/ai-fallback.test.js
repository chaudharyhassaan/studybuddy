process.env.GEMINI_MODEL = 'test-primary';
process.env.GEMINI_FALLBACK_MODEL = 'test-fallback';

const test = require('node:test');
const assert = require('node:assert/strict');
const { generateSchedule, AiServiceError } = require('../services/ai');

const schedule = [
  { date: '2026-11-16', topic: 'Cells', description: 'Read chapter 1 and summarise it.' },
];

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  };
}

function candidateResponse() {
  return jsonResponse(200, {
    candidates: [{ content: { parts: [{ text: JSON.stringify(schedule) }] } }],
  });
}

function errorResponse(status) {
  return jsonResponse(status, { error: { code: status, message: 'Provider error.' } });
}

function trackFetch(responses) {
  const calls = [];
  const original = global.fetch;

  global.fetch = async (url) => {
    calls.push(String(url));
    const next = responses.shift();

    if (!next) {
      throw new Error('Unexpected extra Gemini call.');
    }

    return next;
  };

  return { calls, restore: () => { global.fetch = original; } };
}

const request = {
  subject: 'Biology',
  topics: ['Cells'],
  examDate: '2026-11-20',
  hoursPerDay: 1,
  startDate: '2026-11-16',
};

test('a 503 on the primary model falls back to the fallback model', async () => {
  const fetch = trackFetch([errorResponse(503), errorResponse(503), candidateResponse()]);

  try {
    const tasks = await generateSchedule(request);

    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].topic, 'Cells');
    assert.equal(fetch.calls.length, 3);
    assert.match(fetch.calls[0], /test-primary/);
    assert.match(fetch.calls[2], /test-fallback/);
  } finally {
    fetch.restore();
  }
});

test('a 429 on the primary model is retried, then falls back once', async () => {
  const fetch = trackFetch([errorResponse(429), errorResponse(429), candidateResponse()]);

  try {
    const tasks = await generateSchedule(request);

    assert.equal(tasks.length, 1);
    assert.equal(fetch.calls.length, 3);
    assert.match(fetch.calls[1], /test-primary/);
    assert.match(fetch.calls[2], /test-fallback/);
  } finally {
    fetch.restore();
  }
});

test('a retired primary model moves to the fallback without retrying it twice', async () => {
  const fetch = trackFetch([errorResponse(404), candidateResponse()]);

  try {
    const tasks = await generateSchedule(request);

    assert.equal(tasks.length, 1);
    assert.equal(fetch.calls.length, 2);
    assert.match(fetch.calls[0], /test-primary/);
    assert.match(fetch.calls[1], /test-fallback/);
  } finally {
    fetch.restore();
  }
});

test('a non-retryable request error does not try the fallback model', async () => {
  const fetch = trackFetch([errorResponse(401)]);

  try {
    await assert.rejects(() => generateSchedule(request), (error) => {
      assert.ok(error instanceof AiServiceError);
      assert.equal(error.message, 'Plan generation failed.');
      return true;
    });

    assert.equal(fetch.calls.length, 1);
  } finally {
    fetch.restore();
  }
});
