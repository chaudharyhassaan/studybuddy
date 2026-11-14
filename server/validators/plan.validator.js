const { z } = require('zod');
const { startOfUtcDay, parseDateOnly, isRealCalendarDate } = require('../utils/date');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const titleSchema = z
  .string({ error: 'Enter a plan title.' })
  .trim()
  .min(1, 'Enter a plan title.')
  .max(120, 'Title must be 120 characters or fewer.');

const subjectSchema = z
  .string({ error: 'Enter a subject.' })
  .trim()
  .min(1, 'Enter a subject.')
  .max(80, 'Subject must be 80 characters or fewer.');

const examDateSchema = z
  .string({ error: 'Choose an exam date.' })
  .regex(DATE_PATTERN, 'Use YYYY-MM-DD for the exam date.')
  .refine(isRealCalendarDate, 'Choose a real calendar date.')
  .refine((value) => parseDateOnly(value) > startOfUtcDay(), 'Exam date must be in the future.');

const hoursPerDaySchema = z.coerce
  .number({ error: 'Enter hours per day.' })
  .min(0.5, 'Study at least 0.5 hours per day.')
  .max(12, 'Study at most 12 hours per day.');

const topicSchema = z
  .string({ error: 'Enter a topic.' })
  .trim()
  .min(1, 'Enter a topic.')
  .max(80, 'Topics must be 80 characters or fewer.');

const createPlanSchema = z
  .object({
    title: titleSchema.optional(),
    subject: subjectSchema,
    examDate: examDateSchema,
    hoursPerDay: hoursPerDaySchema,
    topics: z
      .array(topicSchema, { error: 'Add at least one topic.' })
      .min(1, 'Add at least one topic.')
      .max(20, 'Add 20 topics or fewer.')
      .transform((topics) => {
        const seen = new Set();
        return topics.filter((topic) => {
          const key = topic.toLowerCase();
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
      }),
  })
  .strict();

module.exports = { createPlanSchema };
