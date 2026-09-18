const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doubt = require('../models/Doubt');
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/:id
// @desc    Get user profile and activity stats
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Compute activity counts
    const doubtsCount = await Doubt.countDocuments({ author: user._id });
    const notesCount = await Note.countDocuments({ author: user._id });

    // Count answers given by this user across all doubts
    const answersAggregate = await Doubt.aggregate([
      { $unwind: '$answers' },
      { $match: { 'answers.author': user._id } },
      { $count: 'totalAnswers' },
    ]);
    const answersCount = answersAggregate.length > 0 ? answersAggregate[0].totalAnswers : 0;

    // Fetch user's recent doubts
    const recentDoubts = await Doubt.find({ author: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name avatar');

    // Fetch user's recent notes
    const recentNotes = await Note.find({ author: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        sessionsCompleted: user.sessionsCompleted || 0,
        cardsReviewed: user.cardsReviewed || 0,
        createdAt: user.createdAt,
      },
      stats: {
        doubtsCount,
        answersCount,
        notesCount,
        sessionsCompleted: user.sessionsCompleted || 0,
        cardsReviewed: user.cardsReviewed || 0,
      },
      recentDoubts,
      recentNotes,
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user profile (bio, name)
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        sessionsCompleted: user.sessionsCompleted || 0,
        cardsReviewed: user.cardsReviewed || 0,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
