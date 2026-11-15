const { z } = require('zod');

const OBJECT_ID = /^[a-f0-9]{24}$/i;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const CODE_FENCE = /```/;

// Topics are untrusted user text that ends up inside a model prompt.
// Reject the common instruction-hijacking shapes instead of passing them through.
const INJECTION_PATTERNS = [
  /\b(ignore|disregard|forget|override)\b[\s\S]{0,40}\b(instruction|instructions|prompt|prompts|rule|rules|direction|directions|context)\b/i,
  /\b(system|developer)\s+(prompt|message|role|instructions?)\b/i,
  /\b(reveal|show|print|leak|repeat)\b[\s\S]{0,30}\b(system prompt|api key|api-key|secret|instructions?)\b/i,
  /\b(you are now|act as|pretend to be|jailbreak|developer mode)\b/i,
  /\b(new|updated)\s+(instructions?|rules?)\s*:/i,
];

function looksLikeInjection(value) {
  return CODE_FENCE.test(value) || INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

const planIdSchema = z
  .string({ error: 'Choose a plan.' })
  .regex(OBJECT_ID, 'Choose a valid plan.');

const topicSchema = z
  .string({ error: 'Enter a topic.' })
  .trim()
  .min(1, 'Enter a topic.')
  .max(80, 'Topics must be 80 characters or fewer.')
  .refine((value) => !CONTROL_CHARACTERS.test(value), 'Topic must be a single line.')
  .refine((value) => !looksLikeInjection(value), 'Topic contains text that cannot be used.')
  .transform((value) => value.replace(/\s+/g, ' '));

const quizRequestSchema = z
  .object({
    planId: planIdSchema,
    topic: topicSchema,
    count: z.coerce
      .number({ error: 'Choose how many questions you want.' })
      .int('Choose a whole number of questions.')
      .min(3, 'Ask for at least 3 questions.')
      .max(10, 'Ask for 10 questions or fewer.'),
  })
  .strict();

const flashcardRequestSchema = z
  .object({
    planId: planIdSchema,
    topic: topicSchema,
    count: z.coerce
      .number({ error: 'Choose how many flashcards you want.' })
      .int('Choose a whole number of cards.')
      .min(5, 'Ask for at least 5 cards.')
      .max(15, 'Ask for 15 cards or fewer.'),
  })
  .strict();

module.exports = { quizRequestSchema, flashcardRequestSchema, looksLikeInjection };
