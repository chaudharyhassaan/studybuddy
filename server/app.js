const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { globalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header are server-to-server or curl, so allow them.
      if (!origin || env.clientOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error('Origin not allowed.');
      error.status = 403;
      return callback(error);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  })
);

app.use(morgan(env.isProduction ? 'combined' : 'dev'));
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use('/api', healthRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
