const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Answer content cannot be empty'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isAccepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

answerSchema.virtual('upvoteCount').get(function () {
  return this.upvotes ? this.upvotes.length : 0;
});

const doubtSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for your doubt'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please describe your doubt in detail'],
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
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    answers: [answerSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

doubtSchema.virtual('upvoteCount').get(function () {
  return this.upvotes ? this.upvotes.length : 0;
});

doubtSchema.virtual('answerCount').get(function () {
  return this.answers ? this.answers.length : 0;
});

module.exports = mongoose.model('Doubt', doubtSchema);
