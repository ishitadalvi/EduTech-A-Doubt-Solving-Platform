const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please provide the question or front-side prompt'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Please provide the answer or reverse explanation'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please select a subject'],
      enum: [
        'Computer Science',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'Economics',
        'General',
      ],
      default: 'General',
    },
    topic: {
      type: String,
      required: [true, 'Please provide a topic'],
      trim: true,
    },
    hint: {
      type: String,
      trim: true,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Flashcard', flashcardSchema);
