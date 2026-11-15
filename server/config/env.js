const path = require('node:path');

require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env'),
  quiet: true,
});

const ENV_PATH = path.resolve(__dirname, '..', '.env');
const PLACEHOLDER = 'PASTE_ME';
const REQUIRED_VARIABLES = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'GEMINI_API_KEY',
  'CLIENT_URL',
];
const NODE_ENVIRONMENTS = ['development', 'test', 'production'];
const MIN_JWT_SECRET_LENGTH = 32;
const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
const DEFAULT_GEMINI_FALLBACK_MODEL = 'gemini-3.5-flash';
const DEFAULT_AI_DAILY_LIMIT = 15;
const MIN_AI_DAILY_LIMIT = 1;
const MAX_AI_DAILY_LIMIT = 1000;
const GEMINI_MODEL_PATTERN = /^[a-z0-9][a-z0-9.-]*$/i;

function fail(problems) {
  console.error('');
  console.error('Server cannot start. The environment is not configured correctly.');
  console.error('');
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error('');
  console.error(`Update ${ENV_PATH} using ${ENV_PATH}.example as the list of variables.`);
  console.error('');
  process.exit(1);
}

function readPort(problems) {
  const raw = process.env.PORT;
  if (raw === undefined || raw.trim() === '') {
    return 5000;
  }

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    problems.push(`PORT must be a whole number between 1 and 65535. Received "${raw}".`);
    return 5000;
  }

  return port;
}

function readClientOrigins(raw, problems) {
  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    problems.push('CLIENT_URL must contain at least one origin.');
    return [];
  }

  for (const origin of origins) {
    if (origin === '*') {
      problems.push('CLIENT_URL must list exact origins. Wildcards are not allowed.');
      continue;
    }

    try {
      const url = new URL(origin);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        problems.push(`CLIENT_URL entry "${origin}" must use http or https.`);
      }
      if (url.pathname !== '/' || url.search !== '' || url.hash !== '') {
        problems.push(`CLIENT_URL entry "${origin}" must be an origin only, with no path.`);
      }
    } catch {
      problems.push(`CLIENT_URL entry "${origin}" is not a valid URL.`);
    }
  }

  return origins;
}

function readModel(name, defaultValue, problems) {
  const raw = process.env[name];

  if (raw === undefined || raw.trim() === '') {
    return defaultValue;
  }

  const model = raw.trim();

  if (!GEMINI_MODEL_PATTERN.test(model)) {
    problems.push(`${name} must contain only letters, numbers, dots and dashes.`);
    return defaultValue;
  }

  return model;
}

function readAiDailyLimit(problems) {
  const raw = process.env.AI_DAILY_LIMIT;

  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_AI_DAILY_LIMIT;
  }

  const value = raw.trim();
  const parsed = Number(value);

  if (
    !/^\d+$/.test(value) ||
    !Number.isInteger(parsed) ||
    parsed < MIN_AI_DAILY_LIMIT ||
    parsed > MAX_AI_DAILY_LIMIT
  ) {
    problems.push(
      `AI_DAILY_LIMIT must be a whole number between ${MIN_AI_DAILY_LIMIT} and ${MAX_AI_DAILY_LIMIT}.`
    );
    return DEFAULT_AI_DAILY_LIMIT;
  }

  return parsed;
}

function loadEnvironment() {
  const problems = [];

  for (const name of REQUIRED_VARIABLES) {
    const value = process.env[name];
    if (typeof value !== 'string' || value.trim() === '') {
      problems.push(`${name} is missing or empty.`);
    } else if (value.trim() === PLACEHOLDER) {
      problems.push(`${name} still contains the placeholder ${PLACEHOLDER}.`);
    }
  }

  if (problems.length > 0) {
    fail(problems);
  }

  const nodeEnv = process.env.NODE_ENV.trim();
  if (!NODE_ENVIRONMENTS.includes(nodeEnv)) {
    problems.push(`NODE_ENV must be one of: ${NODE_ENVIRONMENTS.join(', ')}.`);
  }

  const jwtSecret = process.env.JWT_SECRET.trim();
  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    problems.push(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long.`);
  }

  const clientOrigins = readClientOrigins(process.env.CLIENT_URL.trim(), problems);
  const port = readPort(problems);
  const geminiModel = readModel('GEMINI_MODEL', DEFAULT_GEMINI_MODEL, problems);
  const geminiFallbackModel = readModel(
    'GEMINI_FALLBACK_MODEL',
    DEFAULT_GEMINI_FALLBACK_MODEL,
    problems
  );
  const aiDailyLimit = readAiDailyLimit(problems);

  if (problems.length > 0) {
    fail(problems);
  }

  return Object.freeze({
    nodeEnv,
    isProduction: nodeEnv === 'production',
    port,
    mongoUri: process.env.MONGODB_URI.trim(),
    jwtSecret,
    geminiApiKey: process.env.GEMINI_API_KEY.trim(),
    geminiModel,
    geminiFallbackModel,
    aiDailyLimit,
    clientOrigins,
  });
}

module.exports = loadEnvironment();
