const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
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
    cards: {
      type: [
        new mongoose.Schema(
          {
            front: {
              type: String,
              required: true,
              trim: true,
              maxlength: 300,
            },
            back: {
              type: String,
              required: true,
              trim: true,
              maxlength: 500,
            },
          },
          { _id: false, versionKey: false }
        ),
      ],
      required: true,
      validate: {
        validator: (cards) => Array.isArray(cards) && cards.length >= 5 && cards.length <= 15,
        message: 'A flashcard deck needs 5 to 15 cards.',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

flashcardSchema.index({ userId: 1, planId: 1, createdAt: -1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
