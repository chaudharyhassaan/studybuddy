const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const env = require('../config/env');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// These tests cover the two guards every protected route relies on:
// JWT authentication and strict, NoSQL-safe request validation.

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function nextCapture() {
  const errors = [];
  const next = (error) => {
    if (error) {
      errors.push(error);
    }
  };
  next.errors = errors;
  return next;
}

test('a request without a bearer token is rejected', async () => {
  const next = nextCapture();

  await requireAuth({ headers: {} }, {}, next);

  assert.equal(next.errors.length, 1);
  assert.equal(next.errors[0].status, 401);
});

test('a malformed authorization header is rejected', async () => {
  const next = nextCapture();

  await requireAuth({ headers: { authorization: 'Token abc' } }, {}, next);

  assert.equal(next.errors.length, 1);
  assert.equal(next.errors[0].status, 401);
});

test('a token signed with another secret is rejected', async () => {
  const next = nextCapture();
  const token = jwt.sign({ sub: 'user-a' }, `${env.jwtSecret}-other`);

  await requireAuth({ headers: { authorization: `Bearer ${token}` } }, {}, next);

  assert.equal(next.errors.length, 1);
  assert.equal(next.errors[0].status, 401);
});

test('a token without a subject is rejected before touching the database', async () => {
  const original = User.findById;
  let lookedUp = false;

  User.findById = async () => {
    lookedUp = true;
    return null;
  };

  try {
    const next = nextCapture();
    const token = jwt.sign({ role: 'student' }, env.jwtSecret);

    await requireAuth({ headers: { authorization: `Bearer ${token}` } }, {}, next);

    assert.equal(next.errors.length, 1);
    assert.equal(next.errors[0].status, 401);
    assert.equal(lookedUp, false);
  } finally {
    User.findById = original;
  }
});

test('a valid token for a deleted account is rejected', async () => {
  const original = User.findById;

  User.findById = async () => null;

  try {
    const next = nextCapture();
    const token = jwt.sign({ sub: 'user-a' }, env.jwtSecret);

    await requireAuth({ headers: { authorization: `Bearer ${token}` } }, {}, next);

    assert.equal(next.errors.length, 1);
    assert.equal(next.errors[0].status, 401);
  } finally {
    User.findById = original;
  }
});

test('a valid token loads the user from the token subject', async () => {
  const original = User.findById;
  const user = { _id: 'user-a', name: 'Student' };
  let lookedUpWith;

  User.findById = async (id) => {
    lookedUpWith = id;
    return user;
  };

  try {
    const req = { headers: { authorization: `Bearer ${jwt.sign({ sub: 'user-a' }, env.jwtSecret)}` } };
    const next = nextCapture();

    await requireAuth(req, {}, next);

    assert.deepEqual(next.errors, []);
    assert.equal(lookedUpWith, 'user-a');
    assert.equal(req.user, user);
  } finally {
    User.findById = original;
  }
});

test('validation rejects a NoSQL operator key in the body', () => {
  const schema = z.object({ email: z.string() }).strict();
  const res = createResponse();
  const next = nextCapture();

  validate(schema)({ body: { email: { $ne: null } } }, res, next);

  assert.equal(next.errors.length, 0);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.message, 'Invalid request.');
});

test('validation rejects a dotted key that reaches nested fields', () => {
  const schema = z.object({ name: z.string() }).strict();
  const res = createResponse();
  const next = nextCapture();

  validate(schema)({ body: { name: 'Student', 'account.role': 'admin' } }, res, next);

  assert.equal(next.errors.length, 0);
  assert.equal(res.statusCode, 400);
});

test('validation rejects unknown keys through strict schemas', () => {
  const schema = z.object({ email: z.string() }).strict();
  const res = createResponse();
  const next = nextCapture();

  validate(schema)({ body: { email: 'student@example.com', isAdmin: true } }, res, next);

  assert.equal(next.errors.length, 0);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.fields.isAdmin, 'Unknown field.');
});

test('validation passes only the parsed data to the route handler', () => {
  const schema = z.object({ email: z.string().trim().toLowerCase() }).strict();
  const req = { body: { email: '  Student@Example.com ' } };
  const res = createResponse();
  const next = nextCapture();

  validate(schema)(req, res, next);

  assert.deepEqual(next.errors, []);
  assert.deepEqual(req.body, { email: 'student@example.com' });
});
