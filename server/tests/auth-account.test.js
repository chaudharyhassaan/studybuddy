const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Task = require('../models/Task');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const app = require('../app');

// These tests exercise the real account routes, authentication, validation,
// rate limiting and controllers. The models are stubbed so no database
// connection is opened.

const CALLER_ID = 'caller-account';
const OTHER_ID = 'other-account';
const PASSWORD = 'correct-password';
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 4);

const models = [
  { name: 'Plan', model: Plan },
  { name: 'Task', model: Task },
  { name: 'Quiz', model: Quiz },
  { name: 'Flashcard', model: Flashcard },
];

let users;
let stores;
let deleteCalls;
let lookedUp;
let server;
let baseUrl;
const originals = {};

function buildUser(id, name) {
  return {
    id,
    _id: id,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    passwordHash: PASSWORD_HASH,
    saved: 0,
    toPublicJSON() {
      return { id: this._id, name: this.name, email: this.email };
    },
    async save() {
      this.saved += 1;
    },
  };
}

function resetState() {
  users = new Map([
    [CALLER_ID, buildUser(CALLER_ID, 'Caller Student')],
    [OTHER_ID, buildUser(OTHER_ID, 'Other Student')],
  ]);
  stores = new Map(
    models.map(({ name }) => [
      name,
      [
        { userId: CALLER_ID, id: `${name}-caller` },
        { userId: OTHER_ID, id: `${name}-other` },
      ],
    ])
  );
  deleteCalls = [];
  lookedUp = [];
}

function tokenFor(id) {
  return jwt.sign({ sub: id }, env.jwtSecret, { expiresIn: '1h' });
}

async function request(method, path, { token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();

  return { status: response.status, body: text ? JSON.parse(text) : null };
}

test.before(async () => {
  originals.findById = User.findById;
  originals.deleteOne = User.deleteOne;
  for (const { name, model } of models) {
    originals[name] = model.deleteMany;
  }

  User.findById = (id) => {
    lookedUp.push(id);
    const user = users.get(String(id)) || null;

    // Mongoose returns a query, so the controller can chain select() before
    // awaiting it. Mirror that shape with a thenable.
    return {
      select: async () => user,
      then(resolve, reject) {
        return Promise.resolve(user).then(resolve, reject);
      },
    };
  };

  User.deleteOne = async (filter) => {
    deleteCalls.push({ name: 'User', filter });
    return { deletedCount: users.delete(String(filter._id)) ? 1 : 0 };
  };

  for (const { name, model } of models) {
    model.deleteMany = async (filter) => {
      deleteCalls.push({ name, filter });
      const remaining = stores.get(name).filter((record) => record.userId !== filter.userId);

      stores.set(name, remaining);
      return { deletedCount: 1 };
    };
  }

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  User.findById = originals.findById;
  User.deleteOne = originals.deleteOne;
  for (const { name, model } of models) {
    model.deleteMany = originals[name];
  }

  await new Promise((resolve) => server.close(resolve));
});

test.beforeEach(() => {
  resetState();
});

test('changing a name requires a signed in user', async () => {
  const response = await request('PATCH', '/api/auth/me', {
    body: { name: 'New Name', password: PASSWORD },
  });

  assert.equal(response.status, 401);
  assert.equal(users.get(CALLER_ID).name, 'Caller Student');
  assert.equal(users.get(CALLER_ID).saved, 0);
});

test('changing a name rejects a wrong password with the generic message', async () => {
  const response = await request('PATCH', '/api/auth/me', {
    token: tokenFor(CALLER_ID),
    body: { name: 'New Name', password: 'wrong-password' },
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.message, 'Email or password is incorrect.');
  assert.equal(users.get(CALLER_ID).name, 'Caller Student');
  assert.equal(users.get(CALLER_ID).saved, 0);
});

test('changing a name validates the name and rejects unsafe keys', async () => {
  const empty = await request('PATCH', '/api/auth/me', {
    token: tokenFor(CALLER_ID),
    body: { name: '   ', password: PASSWORD },
  });

  assert.equal(empty.status, 400);
  assert.equal(empty.body.error.fields.name, 'Enter your name.');

  const extraKey = await request('PATCH', '/api/auth/me', {
    token: tokenFor(CALLER_ID),
    body: { name: 'New Name', password: PASSWORD, userId: OTHER_ID },
  });

  assert.equal(extraKey.status, 400);
  assert.equal(extraKey.body.error.fields.userId, 'Unknown field.');

  const unsafe = await request('PATCH', '/api/auth/me', {
    token: tokenFor(CALLER_ID),
    body: { name: { $ne: null }, password: PASSWORD },
  });

  assert.equal(unsafe.status, 400);
  assert.equal(unsafe.body.error.message, 'Invalid request.');
  assert.equal(users.get(CALLER_ID).saved, 0);
});

test('changing a name trims the value and updates only the caller', async () => {
  const response = await request('PATCH', '/api/auth/me', {
    token: tokenFor(CALLER_ID),
    body: { name: '  New Caller Name  ', password: PASSWORD },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.user, {
    id: CALLER_ID,
    name: 'New Caller Name',
    email: 'caller.student@example.com',
  });
  assert.equal(users.get(CALLER_ID).name, 'New Caller Name');
  assert.equal(users.get(CALLER_ID).saved, 1);
  assert.equal(users.get(OTHER_ID).name, 'Other Student');
  assert.equal(users.get(OTHER_ID).saved, 0);
  assert.ok(lookedUp.every((id) => id === CALLER_ID));
});

test('deleting an account requires a signed in user', async () => {
  const response = await request('DELETE', '/api/auth/me', {
    body: { password: PASSWORD, confirmation: 'DELETE' },
  });

  assert.equal(response.status, 401);
  assert.deepEqual(deleteCalls, []);
});

test('deleting an account rejects a wrong password and keeps the data', async () => {
  const response = await request('DELETE', '/api/auth/me', {
    token: tokenFor(CALLER_ID),
    body: { password: 'wrong-password', confirmation: 'DELETE' },
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.message, 'Email or password is incorrect.');
  assert.deepEqual(deleteCalls, []);
  assert.equal(stores.get('Plan').length, 2);
  assert.equal(users.has(CALLER_ID), true);
});

test('deleting an account requires the typed confirmation', async () => {
  const response = await request('DELETE', '/api/auth/me', {
    token: tokenFor(CALLER_ID),
    body: { password: PASSWORD, confirmation: 'delete' },
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.fields.confirmation, 'Type DELETE to confirm.');
  assert.deepEqual(deleteCalls, []);
});

test('deleting an account removes all caller data and leaves another user alone', async () => {
  const response = await request('DELETE', '/api/auth/me', {
    token: tokenFor(CALLER_ID),
    body: { password: PASSWORD, confirmation: 'DELETE' },
  });

  assert.equal(response.status, 204);

  for (const { name } of models) {
    const record = deleteCalls.find((call) => call.name === name);

    assert.deepEqual(record.filter, { userId: CALLER_ID });
    assert.deepEqual(stores.get(name), [{ userId: OTHER_ID, id: `${name}-other` }]);
  }

  assert.deepEqual(deleteCalls.find((call) => call.name === 'User').filter, {
    _id: CALLER_ID,
  });
  assert.equal(users.has(CALLER_ID), false);
  assert.equal(users.has(OTHER_ID), true);
  assert.equal(users.get(OTHER_ID).saved, 0);
});
