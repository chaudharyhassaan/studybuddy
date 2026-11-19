const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { globalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const planRoutes = require('./routes/plan.routes');
const taskRoutes = require('./routes/task.routes');
const aiRoutes = require('./routes/ai.routes');
const documentRoutes = require('./routes/document.routes');

const app = express();

app.disable('x-powered-by');

// Render and Vercel forward requests through their own proxy and set
// X-Forwarded-For. Trusting one hop lets express-rate-limit key on the real
// client IP instead of the proxy address.
if (env.isProduction) {
  app.set('trust proxy', 1);
}

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
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', documentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
