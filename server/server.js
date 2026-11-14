const mongoose = require('mongoose');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

async function start() {
  await connectDB(env.mongoUri);

  const server = app.listen(env.port, () => {
    console.log(`StudyBuddy API listening on http://localhost:${env.port} (${env.nodeEnv}).`);
  });

  server.on('error', (error) => {
    console.error('Server error:', error.message);
    process.exit(1);
  });

  let shuttingDown = false;

  function shutdown(signal) {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    console.log(`${signal} received. Closing the server.`);

    const forceExit = setTimeout(() => {
      console.error('Shutdown took too long. Exiting.');
      process.exit(1);
    }, 10000);
    forceExit.unref();

    server.close(async () => {
      await mongoose.connection.close();
      clearTimeout(forceExit);
      console.log('Server closed.');
      process.exit(0);
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Failed to start the server:', error.message);
  process.exit(1);
});
