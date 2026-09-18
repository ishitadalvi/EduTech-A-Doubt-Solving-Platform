import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Clock,
  Play,
  Award,
  ChevronRight,
  Plus,
  X,
  Volume2,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import SubjectBadge from '../components/SubjectBadge';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const subjects = [
  'All',
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
];

const FlashcardsPage = () => {
  const { user, isAuthenticated, updateUser } = useAuth();

  // Mode: 'hub' | 'session' | 'summary'
  const [mode, setMode] = useState('hub');

  // Hub configuration state
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [cardCount, setCardCount] = useState(5);
  const [cardTimerSeconds, setCardTimerSeconds] = useState(20); // 15, 20, 30, 0 (untimed)
  const [stats, setStats] = useState(null);

  // Active Session state
  const [sessionCards, setSessionCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [sessionLog, setSessionLog] = useState([]);

  // Create flashcard modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newSubject, setNewSubject] = useState('Computer Science');
  const [newTopic, setNewTopic] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('medium');
  const [submittingCard, setSubmittingCard] = useState(false);

  const timerRef = useRef(null);

  // Fetch subject statistics on hub mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/flashcards/stats');
        if (res.data.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load flashcard stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (mode !== 'session' || cardTimerSeconds === 0) return;

    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isFlipped) {
      // Auto flip when timer expires
      setIsFlipped(true);
    }

    return () => clearTimeout(timerRef.current);
  }, [mode, timeLeft, isTimerRunning, cardTimerSeconds, isFlipped]);

  // Start a revision session
  const startSession = async () => {
    try {
      const params = { limit: cardCount };
      if (selectedSubject !== 'All') params.subject = selectedSubject;

      const res = await api.get('/flashcards', { params });
      if (res.data.success && res.data.cards.length > 0) {
        setSessionCards(res.data.cards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowHint(false);
        setTimeLeft(cardTimerSeconds);
        setIsTimerRunning(cardTimerSeconds > 0);
        setCorrectCount(0);
        setSkippedCount(0);
        setSessionLog([]);
        setMode('session');
      } else {
        alert('No flashcards found for this selection. Try selecting "All" or create one!');
      }
    } catch (err) {
      alert('Failed to load flashcard deck. Please try again.');
    }
  };

  // Move to next card or complete session
  const handleAnswerCard = async (isCorrect) => {
    const currentCard = sessionCards[currentIndex];
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    const newSkipped = !isCorrect ? skippedCount + 1 : skippedCount;

    if (isCorrect) {
      setCorrectCount(newCorrect);
    } else {
      setSkippedCount(newSkipped);
    }

    const updatedLog = [
      ...sessionLog,
      {
        question: currentCard.question,
        answer: currentCard.answer,
        isCorrect,
      },
    ];
    setSessionLog(updatedLog);

    if (currentIndex + 1 < sessionCards.length) {
      // Next card
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
      setTimeLeft(cardTimerSeconds);
      setIsTimerRunning(cardTimerSeconds > 0);
    } else {
      // Session finished!
      setMode('summary');

      // Record session progress on backend if authenticated
      if (isAuthenticated) {
        try {
          const res = await api.post('/flashcards/session-complete', {
            cardsReviewed: sessionCards.length,
            correctCount: newCorrect,
            skippedCount: newSkipped,
            subject: selectedSubject,
          });
          if (res.data.success && res.data.stats) {
            updateUser({
              sessionsCompleted: res.data.stats.sessionsCompleted,
              cardsReviewed: res.data.stats.cardsReviewed,
            });
          }
        } catch (err) {
          console.warn('Failed to save session stats:', err);
        }
      }
    }
  };

  // Handle adding custom flashcard
  const handleCreateFlashcard = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim() || !newTopic.trim()) return;

    setSubmittingCard(true);
    try {
      const res = await api.post('/flashcards', {
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        subject: newSubject,
        topic: newTopic.trim(),
        hint: newHint.trim(),
        difficulty: newDifficulty,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setNewQuestion('');
        setNewAnswer('');
        setNewTopic('');
        setNewHint('');
        alert('Flashcard added to the community deck!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create flashcard');
    } finally {
      setSubmittingCard(false);
    }
  };

  // ----------------------------------------------------
  // RENDER: SESSION ACTIVE
  // ----------------------------------------------------
  if (mode === 'session') {
    const currentCard = sessionCards[currentIndex];
    const progressPercent = ((currentIndex + 1) / sessionCards.length) * 100;
    const timerPercent =
      cardTimerSeconds > 0 ? (timeLeft / cardTimerSeconds) * 100 : 100;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 min-h-[75vh] flex flex-col justify-between">
        {/* Top Header & Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SubjectBadge subject={currentCard.subject} />
              <span className="text-xs text-slate-400 font-medium">
                {currentCard.topic}
              </span>
            </div>

            <button
              onClick={() => setMode('hub')}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Exit Session
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-semibold text-slate-300">
              {currentIndex + 1} / {sessionCards.length}
            </span>
          </div>

          {/* Timer display */}
          {cardTimerSeconds > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Clock
                  className={`w-3.5 h-3.5 ${
                    timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-indigo-400'
                  }`}
                />
                <span
                  className={`font-mono font-bold ${
                    timeLeft <= 5 ? 'text-rose-400' : 'text-slate-300'
                  }`}
                >
                  {timeLeft}s remaining
                </span>
              </div>
              <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeLeft <= 5
                      ? 'bg-rose-500'
                      : timeLeft <= 10
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${timerPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* 3D Flashcard */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="cursor-pointer perspective-1000 relative w-full min-h-[320px] sm:min-h-[360px] select-none"
        >
          <div
            className={`w-full h-full duration-500 transform-style-3d transition-transform ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT OF CARD (Question) */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-8 flex flex-col justify-between shadow-2xl hover:border-indigo-500/50 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="uppercase tracking-wider font-semibold text-indigo-400">
                  Question (Front)
                </span>
                <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 capitalize">
                  {currentCard.difficulty || 'medium'}
                </span>
              </div>

              <div className="my-auto py-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-slate-100 leading-relaxed">
                  {currentCard.question}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/80">
                {currentCard.hint ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint(!showHint);
                    }}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                  </button>
                ) : (
                  <span></span>
                )}
                <span className="text-indigo-400 font-medium flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" /> Click or Tap to Flip
                </span>
              </div>
            </div>

            {/* BACK OF CARD (Answer) */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider font-semibold text-emerald-400">
                  Solution / Explanation (Back)
                </span>
                <span className="text-indigo-400 flex items-center gap-1 text-[11px]">
                  <CheckCircle className="w-3 h-3" /> Answer Revealed
                </span>
              </div>

              <div className="my-auto py-4">
                <p className="text-base sm:text-lg text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {currentCard.answer}
                </p>
              </div>

              <div className="text-right text-xs text-slate-500 pt-4 border-t border-slate-800/80">
                Click anywhere to flip back
              </div>
            </div>
          </div>
        </div>

        {/* Hint Box (if opened) */}
        {showHint && currentCard.hint && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-300 text-xs sm:text-sm animate-in fade-in">
            <span className="font-bold mr-1">💡 Hint:</span>
            {currentCard.hint}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => handleAnswerCard(false)}
            className="flex-1 max-w-xs flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-semibold text-sm bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all hover:border-slate-600"
          >
            <span>Skip / Still Learning</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleAnswerCard(true)}
            className="flex-1 max-w-xs flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Got It Right!</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: SESSION SUMMARY SCREEN
  // ----------------------------------------------------
  if (mode === 'summary') {
    const total = sessionCards.length;
    const percentage = Math.round((correctCount / total) * 100);

    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-100">Session Complete!</h2>
          <p className="text-sm text-slate-400 mt-1">
            Great revision on <span className="text-indigo-400 font-semibold">{selectedSubject}</span>
          </p>

          {/* Score Badge */}
          <div className="my-6 p-6 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-around">
            <div className="text-center">
              <span className="text-3xl font-black text-emerald-400">{correctCount}</span>
              <p className="text-xs text-slate-400 mt-0.5">Mastered</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-center">
              <span className="text-3xl font-black text-slate-400">{skippedCount}</span>
              <p className="text-xs text-slate-400 mt-0.5">Need Review</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-center">
              <span className="text-3xl font-black text-indigo-400">{percentage}%</span>
              <p className="text-xs text-slate-400 mt-0.5">Accuracy</p>
            </div>
          </div>

          {/* Cards Breakdown List */}
          <div className="space-y-2.5 text-left mb-6 max-h-56 overflow-y-auto pr-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Card Breakdown:
            </h4>
            {sessionLog.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs"
              >
                <span className="text-slate-300 truncate max-w-[80%] font-medium">
                  {item.question}
                </span>
                {item.isCorrect ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" /> Correct
                  </span>
                ) : (
                  <span className="text-slate-500 font-semibold">Skipped</span>
                )}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={startSession}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Session</span>
            </button>
            <button
              onClick={() => setMode('hub')}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Back to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: FLASHCARD HUB (DEFAULT)
  // ----------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Active Recall & Spaced Repetition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
            Micro-Learning Flashcard Deck
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Strengthen knowledge retention with quick, countdown-driven study rounds.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Flashcard</span>
          </button>
        )}
      </div>

      {/* Subject Selection Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          1. Choose Subject Domain
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedSubject === subj
                  ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="block font-bold text-sm text-slate-100 mb-1">
                {subj}
              </span>
              <span className="text-xs text-indigo-400">
                {selectedSubject === subj ? 'Selected' : 'Select Deck'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Session Settings & Launcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>2. Session Options & Timer</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card Count */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Cards Per Round
            </label>
            <div className="flex items-center gap-2">
              {[5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setCardCount(cnt)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                    cardCount === cnt
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {cnt} Cards
                </button>
              ))}
            </div>
          </div>

          {/* Countdown timer */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Countdown Per Card
            </label>
            <div className="flex items-center gap-2">
              {[
                { label: '15s', val: 15 },
                { label: '20s', val: 20 },
                { label: '30s', val: 30 },
                { label: 'Untimed', val: 0 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setCardTimerSeconds(opt.val)}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                    cardTimerSeconds === opt.val
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-4">
          <div className="text-xs text-slate-400">
            Topic: <span className="text-indigo-400 font-semibold">{selectedSubject}</span> • {cardCount} cards • {cardTimerSeconds > 0 ? `${cardTimerSeconds}s per card` : 'untimed'}
          </div>

          <button
            onClick={startSession}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Revision Session</span>
          </button>
        </div>
      </div>

      {/* Create Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                <span>Create Flashcard</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFlashcard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {subjects.filter((s) => s !== 'All').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic *
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Recursion & Divide-and-Conquer"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Front / Question Prompt *
                </label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={3}
                  placeholder="What is the base case of Fibonacci recursion?"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Back / Answer Explanation *
                </label>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={3}
                  placeholder="f(0) = 0, f(1) = 1"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hint (optional)
                </label>
                <input
                  type="text"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  placeholder="Think of the first two non-negative terms..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCard}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {submittingCard ? 'Saving...' : 'Add Flashcard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
