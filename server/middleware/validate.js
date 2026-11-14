// MongoDB operators start with $ and dotted keys reach nested fields.
const UNSAFE_KEY = /^\$|\./;

function findUnsafeKey(value) {
  if (value === null || typeof value !== 'object') {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const unsafeKey = findUnsafeKey(item);
      if (unsafeKey) {
        return unsafeKey;
      }
    }
    return null;
  }

  for (const key of Object.keys(value)) {
    if (UNSAFE_KEY.test(key)) {
      return key;
    }
    const unsafeKey = findUnsafeKey(value[key]);
    if (unsafeKey) {
      return unsafeKey;
    }
  }

  return null;
}

function validate(schema) {
  return (req, res, next) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};

    if (findUnsafeKey(body)) {
      return res.status(400).json({ error: { message: 'Invalid request.' } });
    }

    const result = schema.safeParse(body);

    if (!result.success) {
      const fields = {};

      for (const issue of result.error.issues) {
        if (issue.code === 'unrecognized_keys') {
          for (const key of issue.keys) {
            fields[key] = 'Unknown field.';
          }
          continue;
        }

        const key = issue.path.length > 0 ? issue.path.join('.') : '_';
        if (!fields[key]) {
          fields[key] = issue.message;
        }
      }

      return res.status(400).json({
        error: {
          message: 'Invalid request.',
          fields,
        },
      });
    }

    req.body = result.data;
    return next();
  };
}

module.exports = { validate };
