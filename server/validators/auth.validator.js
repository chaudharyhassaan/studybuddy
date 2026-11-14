const { z } = require('zod');

const emailSchema = z
  .string({ error: 'Enter your email address.' })
  .trim()
  .min(1, 'Enter your email address.')
  .max(254, 'Email address is too long.')
  .email('Enter a valid email address.')
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string({ error: 'Enter your password.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be 72 characters or fewer.');

const registerSchema = z
  .object({
    name: z
      .string({ error: 'Enter your name.' })
      .trim()
      .min(1, 'Enter your name.')
      .max(80, 'Name must be 80 characters or fewer.'),
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

const loginSchema = z
  .object({
    email: emailSchema,
    password: z
      .string({ error: 'Enter your password.' })
      .min(1, 'Enter your password.')
      .max(72, 'Password must be 72 characters or fewer.'),
  })
  .strict();

module.exports = { registerSchema, loginSchema };
