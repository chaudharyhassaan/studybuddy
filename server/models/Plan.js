const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    examDate: {
      type: Date,
      required: true,
    },
    hoursPerDay: {
      type: Number,
      required: true,
      min: 0.5,
      max: 12,
    },
    topics: {
      type: [String],
      required: true,
      validate: {
        validator: (topics) => Array.isArray(topics) && topics.length >= 1 && topics.length <= 20,
        message: 'A plan needs 1 to 20 topics.',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

planSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Plan', planSchema);
