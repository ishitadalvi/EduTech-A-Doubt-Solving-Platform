const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
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
      required: [true, 'Please provide a topic name'],
      trim: true,
      maxlength: [100, 'Topic cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Note content cannot be empty'],
      trim: true,
    },
    resourceLink: {
      type: String,
      trim: true,
      default: '',
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
  },
  {
    timestamps: true,
  }
);

// Add text index for fast search across title, topic, content, and tags
noteSchema.index({
  title: 'text',
  topic: 'text',
  content: 'text',
  tags: 'text',
});

module.exports = mongoose.model('Note', noteSchema);
