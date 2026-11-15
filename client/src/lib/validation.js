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
