const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

// @route   GET /api/notes
// @desc    Get all notes with search and subject filters
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { subject, search } = req.query;
    let query = {};

    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { topic: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const notes = await Note.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/notes/:id
// @desc    Get single note by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate('author', 'name avatar');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, subject, topic, content, resourceLink, tags } = req.body;

    if (!title || !topic || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, topic, and content',
      });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string' && tags.trim()
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const note = await Note.create({
      title,
      subject: subject || 'General',
      topic,
      content,
      resourceLink: resourceLink || '',
      tags: parsedTags,
      author: req.user._id,
    });

    const populatedNote = await Note.findById(note._id).populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note: populatedNote,
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note (author only)
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this note',
      });
    }

    const { title, subject, topic, content, resourceLink, tags } = req.body;

    if (title) note.title = title;
    if (subject) note.subject = subject;
    if (topic) note.topic = topic;
    if (content) note.content = content;
    if (resourceLink !== undefined) note.resourceLink = resourceLink;
    if (tags !== undefined) {
      note.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    await note.save();
    const updated = await Note.findById(note._id).populate('author', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: updated,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note (author only)
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this note',
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
