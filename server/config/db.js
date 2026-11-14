const mongoose = require('mongoose');

async function connectDB(uri) {
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected to ${mongoose.connection.host}.`);
}

module.exports = connectDB;
