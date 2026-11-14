const mongoose = require('mongoose');
const env = require('../config/env');

const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

function getHealth(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    environment: env.nodeEnv,
    database: CONNECTION_STATES[mongoose.connection.readyState] || 'unknown',
  });
}

module.exports = { getHealth };
