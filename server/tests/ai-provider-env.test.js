const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveEnvironment, loadEnvironment } = require('../config/env');

// These tests check the startup rules without reading the real .env file and
// without starting the server.

const base = {
  NODE_ENV: 'test',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/studybuddy',
  JWT_SECRET: 'a'.repeat(40),
  CLIENT_URL: 'http://localhost:5173',
};

function problemsFor(overrides) {
  return resolveEnvironment({ ...base, ...overrides }).problems;
}

test('startup fails when no AI provider key is configured', () => {
  const problems = problemsFor({});

  assert.equal(problems.length, 1);
  assert.match(problems[0], /No AI provider is configured/);
});

test('startup refuses to return a config without a provider key', () => {
  let reported = null;

  const config = loadEnvironment(base, (problems) => {
    reported = problems;
  });

  assert.equal(config, null);
  assert.match(reported[0], /No AI provider is configured/);
});

test('Groq is the default provider and only its key is required', () => {
  const { problems, config } = resolveEnvironment({ ...base, GROQ_API_KEY: 'groq-key' });

  assert.deepEqual(problems, []);
  assert.equal(config.aiProvider, 'groq');
  assert.equal(config.groqModel, 'openai/gpt-oss-120b');
  assert.equal(config.geminiApiKey, '');
});

test('a Gemini key is not required while Groq is the primary provider', () => {
  const { problems, config } = resolveEnvironment({
    ...base,
    GROQ_API_KEY: 'groq-key',
    GEMINI_API_KEY: '',
  });

  assert.deepEqual(problems, []);
  assert.equal(config.geminiApiKey, '');
});

test('a Gemini-only setup fails loudly instead of silently using a missing Groq key', () => {
  const problems = problemsFor({ GEMINI_API_KEY: 'gemini-key' });

  assert.equal(problems.length, 1);
  assert.match(problems[0], /GROQ_API_KEY is missing or empty/);
});

test('AI_PROVIDER=gemini requires the Gemini key', () => {
  const missing = problemsFor({ AI_PROVIDER: 'gemini', GROQ_API_KEY: 'groq-key' });

  assert.equal(missing.length, 1);
  assert.match(missing[0], /GEMINI_API_KEY is missing or empty/);

  const { problems, config } = resolveEnvironment({
    ...base,
    AI_PROVIDER: 'gemini',
    GEMINI_API_KEY: 'gemini-key',
  });

  assert.deepEqual(problems, []);
  assert.equal(config.aiProvider, 'gemini');
  assert.equal(config.groqApiKey, '');
});

test('AI_PROVIDER rejects unknown values', () => {
  const problems = problemsFor({ AI_PROVIDER: 'openai', GROQ_API_KEY: 'groq-key' });

  assert.equal(problems.length, 1);
  assert.match(problems[0], /AI_PROVIDER must be one of: groq, gemini/);
});

test('GROQ_MODEL accepts namespaced model ids and rejects junk', () => {
  const accepted = resolveEnvironment({
    ...base,
    GROQ_API_KEY: 'groq-key',
    GROQ_MODEL: 'qwen/qwen3.8-27b',
  });

  assert.deepEqual(accepted.problems, []);
  assert.equal(accepted.config.groqModel, 'qwen/qwen3.8-27b');

  const rejected = problemsFor({
    GROQ_API_KEY: 'groq-key',
    GROQ_MODEL: 'bad model!',
  });

  assert.equal(rejected.length, 1);
  assert.match(rejected[0], /GROQ_MODEL must contain only/);
});

test('a placeholder key is rejected', () => {
  const problems = problemsFor({ GROQ_API_KEY: 'PASTE_ME' });

  assert.ok(problems.some((problem) => /still contains the placeholder/.test(problem)));
  assert.ok(problems.some((problem) => /No AI provider is configured/.test(problem)));
});
