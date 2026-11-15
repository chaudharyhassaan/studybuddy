const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastStudyDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    streak: this.streak,
    lastStudyDate: this.lastStudyDate,
    createdAt: this.createdAt,
  };
};

// Account deletion: a future DELETE /api/auth/me must remove this user's plans,
// tasks, quizzes and flashcards, all scoped to this user's id. No such endpoint
// exists yet; add that cascade before exposing one.
module.exports = mongoose.model('User', userSchema);
