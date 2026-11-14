const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const email = `auth-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
const password = 'StudyBuddy123!';

let failures = 0;

function report(name, passed, detail) {
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? ` (${detail})` : ''}`);
  if (!passed) {
    failures += 1;
  }
}

async function call(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { status: response.status, body };
}

function hidesPasswordHash(body) {
  return !JSON.stringify(body).includes('passwordHash');
}

async function main() {
  console.log(`Testing auth against ${BASE_URL}`);
  console.log(`Test account: ${email}`);
  console.log('');

  const register = await call('/api/auth/register', {
    method: 'POST',
    body: { name: 'Auth Test', email, password },
  });
  report('register returns 201', register.status === 201, `status ${register.status}`);
  report('register returns a token', typeof register.body?.token === 'string' && register.body.token.length > 0);
  report('register hides passwordHash', hidesPasswordHash(register.body));
  report('register returns the email', register.body?.user?.email === email);

  const duplicate = await call('/api/auth/register', {
    method: 'POST',
    body: { name: 'Auth Test', email: email.toUpperCase(), password },
  });
  report('duplicate email returns 409', duplicate.status === 409, `status ${duplicate.status}`);
  report('duplicate email hides passwordHash', hidesPasswordHash(duplicate.body));

  const login = await call('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  report('login returns 200', login.status === 200, `status ${login.status}`);
  report('login returns a token', typeof login.body?.token === 'string' && login.body.token.length > 0);
  report('login hides passwordHash', hidesPasswordHash(login.body));

  const token = login.body?.token;

  const me = await call('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  report('me returns 200', me.status === 200, `status ${me.status}`);
  report('me returns the same account', me.body?.user?.email === email);
  report('me hides passwordHash', hidesPasswordHash(me.body));
  report('me returns streak 0', me.body?.user?.streak === 0);

  const wrongPassword = await call('/api/auth/login', {
    method: 'POST',
    body: { email, password: 'WrongPassword123!' },
  });
  report('wrong password returns 401', wrongPassword.status === 401, `status ${wrongPassword.status}`);
  report(
    'wrong password uses a generic message',
    wrongPassword.body?.error?.message === 'Email or password is incorrect.'
  );

  const anonymous = await call('/api/auth/me');
  report('me without a token returns 401', anonymous.status === 401, `status ${anonymous.status}`);

  console.log('');

  if (failures > 0) {
    console.log(`${failures} check(s) failed.`);
    process.exit(1);
  }

  console.log('All auth checks passed.');
}

main().catch((error) => {
  console.error('Test script failed:', error.message);
  process.exit(1);
});
