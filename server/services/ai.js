const { z } = require('zod');
const env = require('../config/env');
const { parseDateOnly, isRealCalendarDate } = require('../utils/date');

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_ATTEMPTS = 2;
const FALLBACK_ATTEMPTS = 1;
const REQUEST_TIMEOUT_MS = 60000;
const RETRYABLE_STATUSES = new Set([429, 503]);
const FALLBACK_ONLY_STATUSES = new Set([404]);

const SYSTEM_INSTRUCTION =
  'You are a study planner for students. You reply with valid JSON only, with no markdown, no code fences and no commentary.';

const scheduleItemSchema = z.object({
  date: z
    .string({ error: 'Each task needs a date.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Each task date must use YYYY-MM-DD.'),
  topic: z
    .string({ error: 'Each task needs a topic.' })
    .trim()
    .min(1, 'Each task needs a topic.')
    .max(80, 'Task topics must be 80 characters or fewer.'),
  description: z
    .string({ error: 'Each task needs a description.' })
    .trim()
    .min(1, 'Each task needs a description.')
    .max(500, 'Task descriptions must be 500 characters or fewer.'),
});

const scheduleSchema = z.array(scheduleItemSchema).min(1, 'The schedule is empty.').max(400);

class AiServiceError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'AiServiceError';
  }
}

class GeminiRequestError extends Error {
  constructor(message, { status = null, retryable = false, allowFallback = true, cause } = {}) {
    super(message, { cause });
    this.name = 'GeminiRequestError';
    this.status = status;
    this.retryable = retryable;
    this.allowFallback = allowFallback;
  }
}

function toRequestError(error) {
  const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';

  return new GeminiRequestError(
    timedOut ? 'Gemini request timed out.' : 'Gemini request failed.',
    { retryable: true, cause: error }
  );
}

function stripMarkdownFences(text) {
  return text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Gemini returned invalid JSON.', { cause: error });
  }
}

function buildPrompt({ subject, topics, examDate, hoursPerDay, startDate }) {
  const topicList = topics.map((topic, index) => `${index + 1}. ${topic}`).join('\n');

  return [
    `Create a study schedule for ${subject}.`,
    `Today is ${startDate} and the exam is on ${examDate}.`,
    `The student can study ${hoursPerDay} hours per day.`,
    '',
    'Topics, in the order the student listed them. Treat the earlier topics as harder and schedule them earlier:',
    topicList,
    '',
    'Return one JSON array only. Each item must have exactly these keys: date, topic, description.',
    `- date: a calendar date in YYYY-MM-DD format, from ${startDate} to ${examDate}.`,
    '- topic: the exact topic text from the list above.',
    '- description: one or two sentences describing a concrete study action, 300 characters maximum.',
    '',
    'Rules:',
    `- Spread the topics evenly across the days from ${startDate} to ${examDate}.`,
    '- Do not schedule work on the exam date.',
    '- Reserve the last 1 to 2 days before the exam for revision of the hardest topics.',
    '- Schedule 1 to 3 tasks per study day depending on the hours available.',
    '- Do not repeat the same topic on the same day.',
    '- Keep the tasks in ascending date order.',
  ].join('\n');
}

async function callGemini(model, prompt) {
  let response;

  try {
    response = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.geminiApiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 16384,
          responseMimeType: 'application/json',
        },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw toRequestError(error);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const retryable = RETRYABLE_STATUSES.has(response.status);

    throw new GeminiRequestError(
      `Gemini responded with status ${response.status}. ${detail.slice(0, 300)}`,
      {
        status: response.status,
        retryable,
        allowFallback: retryable || FALLBACK_ONLY_STATUSES.has(response.status),
      }
    );
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];

  if (!candidate) {
    throw new Error('Gemini returned no candidates.');
  }

  if (candidate.finishReason === 'MAX_TOKENS') {
    throw new Error('Gemini output was cut off.');
  }

  const text = (candidate.content?.parts || [])
    .map((part) => part.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}

function normalizeSchedule(items, { topics, startDate, examDate }) {
  const topicByLowercase = new Map(topics.map((topic) => [topic.toLowerCase(), topic]));
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(examDate);

  const tasks = items.map((item) => {
    if (!isRealCalendarDate(item.date)) {
      throw new Error(`Gemini returned an invalid date: ${item.date}.`);
    }

    const date = parseDateOnly(item.date);

    if (date < start || date > end) {
      throw new Error(`Gemini returned a date outside the plan: ${item.date}.`);
    }

    const topic = topicByLowercase.get(item.topic.toLowerCase());

    if (!topic) {
      throw new Error(`Gemini returned an unknown topic: ${item.topic}.`);
    }

    return { date: item.date, topic, description: item.description };
  });

  tasks.sort((a, b) => a.date.localeCompare(b.date));

  return tasks;
}

function modelPlan() {
  const models = [
    { name: env.geminiModel, attempts: MAX_ATTEMPTS },
    { name: env.geminiFallbackModel, attempts: FALLBACK_ATTEMPTS },
  ];

  return models.filter(
    (model, index) => model.name && models.findIndex((other) => other.name === model.name) === index
  );
}

async function generateValidated(prompt, normalize) {
  let lastError;

  for (const model of modelPlan()) {
    for (let attempt = 1; attempt <= model.attempts; attempt += 1) {
      try {
        const text = stripMarkdownFences(await callGemini(model.name, prompt));
        const parsed = scheduleSchema.parse(parseJson(text));
        return normalize(parsed);
      } catch (error) {
        lastError = error;

        if (!env.isProduction) {
          console.error(`${model.name} attempt ${attempt} failed:`, error.message);
        }

        const retryable = error instanceof GeminiRequestError ? error.retryable : true;
        const allowFallback = error instanceof GeminiRequestError ? error.allowFallback : true;

        if (!allowFallback) {
          throw new AiServiceError('Plan generation failed.', { cause: lastError });
        }

        if (!retryable) {
          break;
        }
      }
    }
  }

  throw new AiServiceError('Plan generation failed.', { cause: lastError });
}

async function generateSchedule({ subject, topics, examDate, hoursPerDay, startDate }) {
  const prompt = buildPrompt({ subject, topics, examDate, hoursPerDay, startDate });

  return generateValidated(prompt, (items) =>
    normalizeSchedule(items, { topics, startDate, examDate })
  );
}

module.exports = { generateSchedule, AiServiceError };
