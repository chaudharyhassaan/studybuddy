const { z } = require('zod');

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

// The instruction is user text that goes into a model prompt. It is short,
// single-purpose and never contains file data.
const promptSchema = z
  .string({ error: 'Describe how to summarize the document.' })
  .trim()
  .min(3, 'Describe how to summarize the document.')
  .max(400, 'Keep the summary request under 400 characters.')
  .refine(
    (value) => !CONTROL_CHARACTERS.test(value),
    'Use plain text in the summary request.'
  );

const summarizeRequestSchema = z
  .object({
    prompt: promptSchema,
  })
  .strict();

module.exports = { promptSchema, summarizeRequestSchema };
