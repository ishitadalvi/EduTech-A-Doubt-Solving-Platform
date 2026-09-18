const express = require('express');
const router = express.Router();
const Flashcard = require('../models/Flashcard');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/flashcards
// @desc    Get flashcards by subject/topic with optional count limit
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { subject, topic, limit = 10 } = req.query;
    let query = {};

    if (subject && subject !== 'All') {
      query.subject = subject;
    }
    if (topic) {
      query.topic = topic;
    }

    let cards = await Flashcard.find(query).lean();

    // Shuffle cards for fresh revision session
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    const requestedLimit = parseInt(limit, 10) || 10;
    const sessionCards = cards.slice(0, requestedLimit);

    res.status(200).json({
      success: true,
      count: sessionCards.length,
      totalAvailable: cards.length,
      cards: sessionCards,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/flashcards/stats
// @desc    Get summary of flashcard subjects and card counts
// @access  Public
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await Flashcard.aggregate([
      {
        $group: {
          _id: '$subject',
          cardCount: { $sum: 1 },
          topics: { $addToSet: '$topic' },
        },
      },
      {
        $project: {
          subject: '$_id',
          cardCount: 1,
          topicCount: { $size: '$topics' },
          _id: 0,
        },
      },
    ]);

    const totalCards = await Flashcard.countDocuments();

    res.status(200).json({
      success: true,
      totalCards,
      subjects: stats,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/flashcards
// @desc    Create a new flashcard
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { question, answer, subject, topic, hint, difficulty } = req.body;

    if (!question || !answer || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Please provide question, answer, and topic',
      });
    }

    const card = await Flashcard.create({
      question,
      answer,
      subject: subject || 'General',
      topic,
      hint: hint || '',
      difficulty: difficulty || 'medium',
      author: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Flashcard created successfully',
      card,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/flashcards/session-complete
// @desc    Record completed flashcard revision session for user progress tracking
// @access  Private
router.post('/session-complete', protect, async (req, res, next) => {
  try {
    const { cardsReviewed = 0, correctCount = 0, skippedCount = 0, subject } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.sessionsCompleted = (user.sessionsCompleted || 0) + 1;
    user.cardsReviewed = (user.cardsReviewed || 0) + Number(cardsReviewed);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Session recorded successfully',
      stats: {
        sessionsCompleted: user.sessionsCompleted,
        cardsReviewed: user.cardsReviewed,
        latestSession: {
          cardsReviewed,
          correctCount,
          skippedCount,
          subject: subject || 'All',
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
