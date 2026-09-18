const express = require('express');
const router = express.Router();
const Doubt = require('../models/Doubt');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/doubts
// @desc    Get all doubts with subject filter, search, and sorting
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { subject, sort, search } = req.query;
    let query = {};

    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let doubts = await Doubt.find(query)
      .populate('author', 'name avatar')
      .populate('answers.author', 'name avatar')
      .lean();

    // Sort options:
    // 'recent' -> createdAt desc
    // 'upvotes' -> number of upvotes desc
    // 'unanswered' -> answer count = 0, then recent
    if (sort === 'upvotes') {
      doubts.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
    } else if (sort === 'unanswered') {
      doubts = doubts.filter((d) => (d.answers?.length || 0) === 0);
      doubts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Default: recent
      doubts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Add helper flags for current user (hasUpvoted)
    const currentUserId = req.user ? req.user._id.toString() : null;
    const formatted = doubts.map((d) => ({
      ...d,
      upvoteCount: d.upvotes ? d.upvotes.length : 0,
      answerCount: d.answers ? d.answers.length : 0,
      hasUpvoted: currentUserId
        ? d.upvotes.some((id) => id.toString() === currentUserId)
        : false,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      doubts: formatted,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/doubts/:id
// @desc    Get single doubt by ID with full answers and author details
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('author', 'name avatar bio createdAt')
      .populate('answers.author', 'name avatar')
      .lean();

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    const currentUserId = req.user ? req.user._id.toString() : null;

    const formattedAnswers = (doubt.answers || []).map((ans) => ({
      ...ans,
      upvoteCount: ans.upvotes ? ans.upvotes.length : 0,
      hasUpvoted: currentUserId
        ? ans.upvotes.some((id) => id.toString() === currentUserId)
        : false,
    }));

    // Sort answers by upvotes descending
    formattedAnswers.sort((a, b) => b.upvoteCount - a.upvoteCount);

    const formattedDoubt = {
      ...doubt,
      answers: formattedAnswers,
      upvoteCount: doubt.upvotes ? doubt.upvotes.length : 0,
      answerCount: formattedAnswers.length,
      hasUpvoted: currentUserId
        ? doubt.upvotes.some((id) => id.toString() === currentUserId)
        : false,
    };

    res.status(200).json({
      success: true,
      doubt: formattedDoubt,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/doubts
// @desc    Create a new doubt
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, description, subject, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description',
      });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string' && tags.trim()
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const doubt = await Doubt.create({
      title,
      description,
      subject: subject || 'General',
      tags: parsedTags,
      author: req.user._id,
      upvotes: [],
      answers: [],
    });

    const populatedDoubt = await Doubt.findById(doubt._id).populate(
      'author',
      'name avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Doubt posted successfully',
      doubt: populatedDoubt,
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/doubts/:id
// @desc    Update a doubt (author only)
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    if (doubt.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this doubt',
      });
    }

    const { title, description, subject, tags } = req.body;
    if (title) doubt.title = title;
    if (description) doubt.description = description;
    if (subject) doubt.subject = subject;
    if (tags !== undefined) {
      doubt.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    await doubt.save();
    const updated = await Doubt.findById(doubt._id).populate('author', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Doubt updated successfully',
      doubt: updated,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/doubts/:id
// @desc    Delete a doubt (author only)
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    if (doubt.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this doubt',
      });
    }

    await doubt.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Doubt deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/doubts/:id/upvote
// @desc    Toggle upvote on a doubt
// @access  Private
router.post('/:id/upvote', protect, async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = doubt.upvotes.findIndex(
      (id) => id.toString() === userIdStr
    );

    let hasUpvoted = false;
    if (existingIndex > -1) {
      // User has already upvoted -> remove vote (toggle off)
      doubt.upvotes.splice(existingIndex, 1);
      hasUpvoted = false;
    } else {
      // Add upvote
      doubt.upvotes.push(req.user._id);
      hasUpvoted = true;
    }

    await doubt.save();

    res.status(200).json({
      success: true,
      hasUpvoted,
      upvoteCount: doubt.upvotes.length,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/doubts/:id/answers
// @desc    Post an answer to a doubt
// @access  Private
router.post('/:id/answers', protect, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Answer content cannot be empty',
      });
    }

    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    const newAnswer = {
      content: content.trim(),
      author: req.user._id,
      upvotes: [],
      isAccepted: false,
    };

    doubt.answers.push(newAnswer);
    await doubt.save();

    // Re-fetch populated doubt
    const updatedDoubt = await Doubt.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('answers.author', 'name avatar');

    const addedAnswer = updatedDoubt.answers[updatedDoubt.answers.length - 1];

    res.status(201).json({
      success: true,
      message: 'Answer added successfully',
      answer: addedAnswer,
      totalAnswers: updatedDoubt.answers.length,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/doubts/:id/answers/:answerId/upvote
// @desc    Toggle upvote on an answer
// @access  Private
router.post('/:id/answers/:answerId/upvote', protect, async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    const answer = doubt.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = answer.upvotes.findIndex(
      (id) => id.toString() === userIdStr
    );

    let hasUpvoted = false;
    if (existingIndex > -1) {
      answer.upvotes.splice(existingIndex, 1);
      hasUpvoted = false;
    } else {
      answer.upvotes.push(req.user._id);
      hasUpvoted = true;
    }

    await doubt.save();

    res.status(200).json({
      success: true,
      hasUpvoted,
      upvoteCount: answer.upvotes.length,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/doubts/:id/answers/:answerId
// @desc    Delete an answer (author only)
// @access  Private
router.delete('/:id/answers/:answerId', protect, async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    const answer = doubt.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this answer',
      });
    }

    doubt.answers.pull({ _id: req.params.answerId });
    await doubt.save();

    res.status(200).json({
      success: true,
      message: 'Answer deleted successfully',
      totalAnswers: doubt.answers.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
