const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) =>
          Array.isArray(options) &&
          options.length === 4 &&
          options.every((option) => typeof option === 'string' && option.trim().length > 0),
        message: 'Each quiz question needs exactly four options.',
      },
    },
    answerIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false, versionKey: false }
);

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    questions: {
      type: [quizQuestionSchema],
      required: true,
      validate: {
        validator: (questions) =>
          Array.isArray(questions) && questions.length >= 3 && questions.length <= 10,
        message: 'A quiz needs 3 to 10 questions.',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

quizSchema.index({ userId: 1, planId: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
