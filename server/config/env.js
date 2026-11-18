const path = require('node:path');

require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env'),
  quiet: true,
});

const ENV_PATH = path.resolve(__dirname, '..', '.env');
const PLACEHOLDER = 'PASTE_ME';
const REQUIRED_VARIABLES = ['NODE_ENV', 'MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
const NODE_ENVIRONMENTS = ['development', 'test', 'production'];
const AI_PROVIDERS = ['groq', 'gemini'];
const DEFAULT_AI_PROVIDER = 'groq';
const MIN_JWT_SECRET_LENGTH = 32;
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
const DEFAULT_GEMINI_FALLBACK_MODEL = 'gemini-3.5-flash';
const DEFAULT_AI_DAILY_LIMIT = 15;
const MIN_AI_DAILY_LIMIT = 1;
const MAX_AI_DAILY_LIMIT = 1000;
// Model ids from both providers contain dots, dashes, slashes and underscores.
const MODEL_PATTERN = /^[a-z0-9][a-z0-9._/-]*$/i;

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

function readPort(source, problems) {
  const raw = source.PORT;
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

function readModel(source, name, defaultValue, problems) {
  const raw = source[name];

  if (raw === undefined || raw.trim() === '') {
    return defaultValue;
  }

  const model = raw.trim();

  if (!MODEL_PATTERN.test(model)) {
    problems.push(
      `${name} must contain only letters, numbers, dots, dashes, slashes and underscores.`
    );
    return defaultValue;
  }

  return model;
}

function readAiProvider(source, problems) {
  const raw = source.AI_PROVIDER;

  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_AI_PROVIDER;
  }

  const provider = raw.trim().toLowerCase();

  if (!AI_PROVIDERS.includes(provider)) {
    problems.push(`AI_PROVIDER must be one of: ${AI_PROVIDERS.join(', ')}. Received "${raw}".`);
    return DEFAULT_AI_PROVIDER;
  }

  return provider;
}

function readOptionalKey(source, name, problems) {
  const raw = source[name];

  if (typeof raw !== 'string' || raw.trim() === '') {
    return '';
  }

  if (raw.trim() === PLACEHOLDER) {
    problems.push(`${name} still contains the placeholder ${PLACEHOLDER}.`);
    return '';
  }

  return raw.trim();
}

function readAiDailyLimit(source, problems) {
  const raw = source.AI_DAILY_LIMIT;

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

// Only the key of the provider that is actually used is required. Gemini is the
// backup provider, so its key stays optional.
function readApiKeys(source, provider, problems) {
  const groqApiKey = readOptionalKey(source, 'GROQ_API_KEY', problems);
  const geminiApiKey = readOptionalKey(source, 'GEMINI_API_KEY', problems);

  if (!groqApiKey && !geminiApiKey) {
    problems.push(
      'No AI provider is configured. Set GROQ_API_KEY, or set GEMINI_API_KEY with AI_PROVIDER=gemini.'
    );
  } else if (provider === 'groq' && !groqApiKey) {
    problems.push(
      'GROQ_API_KEY is missing or empty while AI_PROVIDER is groq. Set GROQ_API_KEY, or set AI_PROVIDER=gemini.'
    );
  } else if (provider === 'gemini' && !geminiApiKey) {
    problems.push(
      'GEMINI_API_KEY is missing or empty while AI_PROVIDER is gemini. Set GEMINI_API_KEY, or set AI_PROVIDER=groq.'
    );
  }

  return { groqApiKey, geminiApiKey };
}

function resolveEnvironment(source = process.env) {
  const problems = [];

  for (const name of REQUIRED_VARIABLES) {
    const value = source[name];
    if (typeof value !== 'string' || value.trim() === '') {
      problems.push(`${name} is missing or empty.`);
    } else if (value.trim() === PLACEHOLDER) {
      problems.push(`${name} still contains the placeholder ${PLACEHOLDER}.`);
    }
  }

  const nodeEnv = (source.NODE_ENV || '').trim();
  if (nodeEnv && !NODE_ENVIRONMENTS.includes(nodeEnv)) {
    problems.push(`NODE_ENV must be one of: ${NODE_ENVIRONMENTS.join(', ')}.`);
  }

  const jwtSecret = (source.JWT_SECRET || '').trim();
  if (jwtSecret && jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    problems.push(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long.`);
  }

  const clientOrigins = readClientOrigins((source.CLIENT_URL || '').trim(), problems);
  const port = readPort(source, problems);
  const aiProvider = readAiProvider(source, problems);
  const { groqApiKey, geminiApiKey } = readApiKeys(source, aiProvider, problems);
  const groqModel = readModel(source, 'GROQ_MODEL', DEFAULT_GROQ_MODEL, problems);
  const geminiModel = readModel(source, 'GEMINI_MODEL', DEFAULT_GEMINI_MODEL, problems);
  const geminiFallbackModel = readModel(
    source,
    'GEMINI_FALLBACK_MODEL',
    DEFAULT_GEMINI_FALLBACK_MODEL,
    problems
  );
  const aiDailyLimit = readAiDailyLimit(source, problems);

  return {
    problems,
    config: {
      nodeEnv,
      isProduction: nodeEnv === 'production',
      port,
      mongoUri: (source.MONGODB_URI || '').trim(),
      jwtSecret,
      aiProvider,
      groqApiKey,
      groqModel,
      geminiApiKey,
      geminiModel,
      geminiFallbackModel,
      aiDailyLimit,
      clientOrigins,
    },
  };
}

function loadEnvironment(source = process.env, onFail = fail) {
  const { problems, config } = resolveEnvironment(source);

  if (problems.length > 0) {
    onFail(problems);
    return null;
  }

  return Object.freeze(config);
}

module.exports = Object.freeze({
  ...loadEnvironment(),
  resolveEnvironment,
  loadEnvironment,
});
