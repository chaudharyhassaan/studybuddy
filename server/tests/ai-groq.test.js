const test = require('node:test');
const assert = require('node:assert/strict');
const env = require('../config/env');
const { generateSchedule, generateQuiz, providerPlan } = require('../services/ai');

// These tests never touch the network. Every fetch call is mocked.

const schedule = [
  { date: '2026-11-16', topic: 'Cells', description: 'Read chapter 1 and summarise it.' },
];

const quiz = Array.from({ length: 5 }, (_, index) => ({
  question: `Question ${index + 1}?`,
  options: ['A', 'B', 'C', 'D'],
  answerIndex: 0,
  explanation: 'Because.',
}));

const request = {
  subject: 'Biology',
  topics: ['Cells'],
  examDate: '2026-11-20',
  hoursPerDay: 1,
  startDate: '2026-11-16',
};

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  };
}

function groqResponse(payload) {
  return jsonResponse(200, {
    choices: [{ message: { content: JSON.stringify(payload) }, finish_reason: 'stop' }],
  });
}

function geminiResponse(payload) {
  return jsonResponse(200, {
    candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }],
  });
}

function errorResponse(status) {
  return jsonResponse(status, { error: { code: status, message: 'Provider error.' } });
}

function trackFetch(responses) {
  const calls = [];
  const original = global.fetch;

  global.fetch = async (url, init) => {
    calls.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body) });
    const next = responses.shift();

    if (!next) {
      throw new Error('Unexpected extra provider call.');
    }

    return typeof next === 'function' ? next() : next;
  };

  return { calls, restore: () => { global.fetch = original; } };
}

test('a Groq key and model are used by default', () => {
  assert.equal(env.aiProvider, 'groq');
  assert.equal(env.groqModel, 'openai/gpt-oss-120b');
  assert.ok(env.groqApiKey.length > 0);
});

test('a Groq success returns validated tasks and sends one small JSON request', async () => {
  const fetch = trackFetch([groqResponse(schedule)]);

  try {
    const tasks = await generateSchedule(request);

    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].topic, 'Cells');
    assert.equal(fetch.calls.length, 1);

    const [{ url, body }] = fetch.calls;

    assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
    assert.equal(body.model, env.groqModel);
    assert.deepEqual(body.response_format, { type: 'json_object' });
    assert.equal(body.max_completion_tokens, 4096);
    assert.ok(body.temperature <= 0.5);
    assert.equal(body.messages[0].role, 'system');
    assert.equal(body.messages[1].role, 'user');
    assert.equal(body.reasoning_effort, 'low');
  } finally {
    fetch.restore();
  }
});

test('the Authorization header carries the key from the environment', async () => {
  const fetch = trackFetch([groqResponse(schedule)]);

  try {
    await generateSchedule(request);
    assert.equal(fetch.calls[0].headers.Authorization, `Bearer ${env.groqApiKey}`);
  } finally {
    fetch.restore();
  }
});

test('each generator caps its output tokens', async () => {
  const fetch = trackFetch([groqResponse(quiz)]);

  try {
    const questions = await generateQuiz({ topic: 'Cells', count: 5 });

    assert.equal(questions.length, 5);
    assert.equal(fetch.calls[0].body.max_completion_tokens, 1600);
  } finally {
    fetch.restore();
  }
});

test('a 429 is retried once on Groq, then answered by Gemini', async () => {
  const fetch = trackFetch([
    errorResponse(429),
    errorResponse(429),
    geminiResponse(schedule),
  ]);

  try {
    const tasks = await generateSchedule(request);

    assert.equal(tasks.length, 1);
    assert.equal(fetch.calls.length, 3);
    assert.match(fetch.calls[0].url, /api\.groq\.com/);
    assert.equal(fetch.calls[1].body.model, env.groqModel);
    assert.match(fetch.calls[2].url, /generativelanguage\.googleapis\.com/);
    assert.equal(fetch.calls[2].body.generationConfig.maxOutputTokens, 4096);
  } finally {
    fetch.restore();
  }
});

test('a 429 that clears on the retry never reaches Gemini', async () => {
  const fetch = trackFetch([errorResponse(429), groqResponse(schedule)]);

  try {
    const tasks = await generateSchedule(request);

    assert.equal(tasks.length, 1);
    assert.equal(fetch.calls.length, 2);
    assert.match(fetch.calls[0].url, /api\.groq\.com/);
    assert.match(fetch.calls[1].url, /api\.groq\.com/);
  } finally {
    fetch.restore();
  }
});

test('a timeout is retried once, then answered by Gemini', async () => {
  const timeout = () => {
    const error = new Error('The operation was aborted.');
    error.name = 'TimeoutError';
    throw error;
  };
  const fetch = trackFetch([timeout, timeout, geminiResponse(schedule)]);

  try {
    const tasks = await generateSchedule(request);

    assert.equal(tasks.length, 1);
    assert.equal(fetch.calls.length, 3);
    assert.match(fetch.calls[2].url, /generativelanguage\.googleapis\.com/);
  } finally {
    fetch.restore();
  }
});

test('Gemini is left out of the plan when its key is not configured', () => {
  const settings = {
    aiProvider: 'groq',
    groqModel: 'openai/gpt-oss-120b',
    groqApiKey: 'groq-key',
    geminiModel: 'gemini-test',
    geminiFallbackModel: 'gemini-test-fallback',
    geminiApiKey: '',
  };

  const plan = providerPlan(settings);

  assert.deepEqual(plan, [{ provider: 'groq', model: 'openai/gpt-oss-120b', attempts: 2 }]);
});

test('Gemini joins the plan as a single fallback attempt when its key is set', () => {
  const plan = providerPlan({
    aiProvider: 'groq',
    groqModel: 'openai/gpt-oss-120b',
    groqApiKey: 'groq-key',
    geminiModel: 'gemini-test',
    geminiFallbackModel: 'gemini-test-fallback',
    geminiApiKey: 'gemini-key',
  });

  assert.deepEqual(plan, [
    { provider: 'groq', model: 'openai/gpt-oss-120b', attempts: 2 },
    { provider: 'gemini', model: 'gemini-test', attempts: 1 },
  ]);
});
