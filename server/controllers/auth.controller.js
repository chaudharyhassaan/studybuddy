const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { deleteAccountData } = require('../services/account');

const BCRYPT_ROUNDS = 12;
const TOKEN_TTL = '7d';
// Comparing against this on unknown emails keeps login timing consistent.
const DUMMY_PASSWORD_HASH = '$2b$12$0ZzYXLfUvbXVj38pZit6E.QSQi6wsCDcAvaM88xCZMzx0T7Aavh2.';

function issueToken(user) {
  return jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

function invalidCredentials(res) {
  return res.status(401).json({
    error: {
      message: 'Email or password is incorrect.',
    },
  });
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        error: {
          message: 'An account with this email already exists.',
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    return res.status(201).json({
      token: issueToken(user),
      user: user.toPublicJSON(),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        error: {
          message: 'An account with this email already exists.',
        },
      });
    }

    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    const passwordHash = user ? user.passwordHash : DUMMY_PASSWORD_HASH;
    const matches = await bcrypt.compare(password, passwordHash);

    if (!user || !matches) {
      return invalidCredentials(res);
    }

    return res.json({
      token: issueToken(user),
      user: user.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

function me(req, res) {
  return res.json({ user: req.user.toPublicJSON() });
}

async function deleteAccount(req, res, next) {
  try {
    await deleteAccountData(req.user._id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, me, deleteAccount };
