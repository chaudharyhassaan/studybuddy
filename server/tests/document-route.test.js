const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

// These tests exercise the real route, multer parsing, validation and limiter.
// The AI call and the daily budget are replaced so nothing touches a provider.

const aiCalls = [];
const aiPath = require.resolve('../services/ai');
require.cache[aiPath] = {
  id: aiPath,
  filename: aiPath,
  loaded: true,
  exports: {
    summarizeDocument: async (input) => {
      aiCalls.push(input);
      return 'A short summary of the document.';
    },
    AiServiceError: class AiServiceError extends Error {},
  },
};

const budgetState = { allowed: true };
const budgetPath = require.resolve('../services/aiBudget');
require.cache[budgetPath] = {
  id: budgetPath,
  filename: budgetPath,
  loaded: true,
  exports: {
    consumeAiBudget: () => ({ allowed: budgetState.allowed }),
    AI_LIMIT_MESSAGE: 'The daily AI limit has been reached. Try again tomorrow.',
  },
};

const app = require('../app');

const originalFindById = User.findById;
User.findById = async (id) => ({
  _id: id,
  id,
  name: 'Test Student',
  email: 'student@example.com',
});

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  User.findById = originalFindById;
  await new Promise((resolve) => server.close(resolve));
});

function tokenFor(sub) {
  return jwt.sign({ sub }, env.jwtSecret, { algorithm: 'HS256' });
}

async function post({ token, name, content, prompt }) {
  const form = new FormData();

  if (prompt !== undefined) {
    form.append('prompt', prompt);
  }

  if (name) {
    form.append('file', new Blob([content], { type: 'application/octet-stream' }), name);
  }

  const response = await fetch(`${baseUrl}/api/documents/summarize`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  return { status: response.status, body: await response.json() };
}

const notes = Buffer.from('Photosynthesis notes\n\nPlants use light to make food.');

test('an unauthenticated request is rejected', async () => {
  const response = await post({ name: 'notes.txt', content: notes, prompt: 'Five bullet points.' });

  assert.equal(response.status, 401);
  assert.equal(aiCalls.length, 0);
});

test('a supported text document is summarized', async () => {
  const response = await post({
    token: tokenFor('user-success'),
    name: 'notes.txt',
    content: notes,
    prompt: 'Give me five bullet points.',
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.summary, 'A short summary of the document.');
  assert.equal(response.body.truncated, false);
  assert.ok(aiCalls.at(-1).text.includes('Photosynthesis notes'));
});

test('an unsupported file type is rejected with a clear message', async () => {
  const response = await post({
    token: tokenFor('user-type'),
    name: 'setup.exe',
    content: Buffer.from('MZ binary'),
    prompt: 'Summarize this.',
  });

  assert.equal(response.status, 415);
  assert.match(response.body.error.message, /PDF, DOCX, PPTX, TXT, MD, CSV, PNG, JPG or WEBP/);
});

test('a spoofed extension is rejected by the signature check', async () => {
  const response = await post({
    token: tokenFor('user-spoof'),
    name: 'report.pdf',
    content: Buffer.from('this is not a pdf'),
    prompt: 'Summarize this.',
  });

  assert.equal(response.status, 400);
  assert.match(response.body.error.message, /valid PDF data/);
});

test('a file over 10 MB is rejected', async () => {
  const response = await post({
    token: tokenFor('user-large'),
    name: 'notes.txt',
    content: Buffer.alloc(10 * 1024 * 1024 + 1, 0x61),
    prompt: 'Summarize this.',
  });

  assert.equal(response.status, 413);
  assert.match(response.body.error.message, /larger than 10 MB/);
});

test('a missing prompt is rejected', async () => {
  const response = await post({
    token: tokenFor('user-prompt-missing'),
    name: 'notes.txt',
    content: notes,
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.fields.prompt, 'Describe how to summarize the document.');
});

test('a prompt over the limit is rejected', async () => {
  const response = await post({
    token: tokenFor('user-prompt-long'),
    name: 'notes.txt',
    content: notes,
    prompt: 'a'.repeat(401),
  });

  assert.equal(response.status, 400);
  assert.match(response.body.error.fields.prompt, /under 400 characters/);
});

test('the daily AI quota blocks the request before any provider call', async () => {
  const user = tokenFor('user-quota');
  const before = aiCalls.length;
  budgetState.allowed = false;

  try {
    const response = await post({
      token: user,
      name: 'notes.txt',
      content: notes,
      prompt: 'Summarize this.',
    });

    assert.equal(response.status, 429);
    assert.equal(response.body.error.message, 'The daily AI limit has been reached. Try again tomorrow.');
    assert.equal(aiCalls.length, before);
  } finally {
    budgetState.allowed = true;
  }
});

test('the per-user AI limiter blocks after twenty requests in the window', async () => {
  const token = tokenFor('user-rate-limit');
  let last;

  for (let attempt = 1; attempt <= 21; attempt += 1) {
    last = await post({
      token,
      name: 'notes.txt',
      content: notes,
      prompt: 'Summarize this.',
    });

    if (attempt < 21) {
      assert.equal(last.status, 200, `request ${attempt} should pass`);
    }
  }

  assert.equal(last.status, 429);
  assert.equal(last.body.error.message, 'AI request limit reached. Try again later.');
});
