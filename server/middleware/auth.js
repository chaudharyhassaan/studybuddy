const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

function unauthorized() {
  const error = new Error('Authentication is required.');
  error.status = 401;
  return error;
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return next(unauthorized());
  }

  try {
    const payload = jwt.verify(match[1], env.jwtSecret, { algorithms: ['HS256'] });

    if (typeof payload.sub !== 'string' || payload.sub === '') {
      return next(unauthorized());
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return next(unauthorized());
    }

    req.user = user;
    return next();
  } catch {
    return next(unauthorized());
  }
}

module.exports = { requireAuth };
