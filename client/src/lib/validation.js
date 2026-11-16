// Messages mirror server/validators/auth.validator.js so the client never
// disagrees with the API about what is valid.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value) {
  const name = value.trim();

  if (!name) {
    return 'Enter your name.';
  }

  if (name.length > 80) {
    return 'Name must be 80 characters or fewer.';
  }

  return null;
}

export function validateEmail(value) {
  const email = value.trim();

  if (!email) {
    return 'Enter your email address.';
  }

  if (email.length > 254) {
    return 'Email address is too long.';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address.';
  }

  return null;
}

export function validateNewPassword(value) {
  if (!value) {
    return 'Enter your password.';
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (value.length > 72) {
    return 'Password must be 72 characters or fewer.';
  }

  return null;
}

export function validateLoginPassword(value) {
  if (!value) {
    return 'Enter your password.';
  }

  if (value.length > 72) {
    return 'Password must be 72 characters or fewer.';
  }

  return null;
}

export function validateLogin({ email, password }) {
  const errors = {};

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validateLoginPassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}

export function validateRegister({ name, email, password }) {
  const errors = {};

  const nameError = validateName(name);
  if (nameError) {
    errors.name = nameError;
  }

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validateNewPassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}

export function validateSubject(value) {
  const subject = value.trim();

  if (!subject) {
    return 'Enter a subject.';
  }

  if (subject.length > 80) {
    return 'Subject must be 80 characters or fewer.';
  }

  return null;
}

export function validateExamDate(value, today = new Date().toISOString().slice(0, 10)) {
  if (!value) {
    return 'Choose an exam date.';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return 'Use YYYY-MM-DD for the exam date.';
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return 'Choose a real calendar date.';
  }

  const start = new Date(`${today}T00:00:00Z`);

  if (date <= start) {
    return 'Exam date must be in the future.';
  }

  return null;
}

export function validateHoursPerDay(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Enter hours per day.';
  }

  const hours = Number(value);

  if (!Number.isFinite(hours)) {
    return 'Enter hours per day.';
  }

  if (hours < 0.5) {
    return 'Study at least 0.5 hours per day.';
  }

  if (hours > 12) {
    return 'Study at most 12 hours per day.';
  }

  return null;
}

export function validateTopic(value) {
  const topic = value.trim();

  if (!topic) {
    return 'Enter a topic.';
  }

  if (topic.length > 80) {
    return 'Topics must be 80 characters or fewer.';
  }

  return null;
}

export function validatePlan({ subject, examDate, hoursPerDay, topics }) {
  const errors = {};

  const subjectError = validateSubject(subject);
  if (subjectError) {
    errors.subject = subjectError;
  }

  const dateError = validateExamDate(examDate);
  if (dateError) {
    errors.examDate = dateError;
  }

  const hoursError = validateHoursPerDay(hoursPerDay);
  if (hoursError) {
    errors.hoursPerDay = hoursError;
  }

  if (topics.length === 0) {
    errors.topics = 'Add at least one topic.';
  } else if (topics.length > 20) {
    errors.topics = 'Add 20 topics or fewer.';
  } else {
    const topicError = topics.map(validateTopic).find(Boolean);

    if (topicError) {
      errors.topics = topicError;
    }
  }

  return errors;
}
