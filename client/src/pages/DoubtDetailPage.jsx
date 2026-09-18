import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowBigUp,
  MessageSquare,
  Clock,
  Send,
  Trash2,
  Edit3,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import SubjectBadge from '../components/SubjectBadge';
import AnswerCard from '../components/AnswerCard';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const DoubtDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [doubt, setDoubt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New answer state
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Upvote state for doubt
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [votingDoubt, setVotingDoubt] = useState(false);

  // Delete state
  const [deletingDoubt, setDeletingDoubt] = useState(false);

  const fetchDoubtDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/doubts/${id}`);
      if (res.data.success) {
        setDoubt(res.data.doubt);
        setUpvotes(res.data.doubt.upvoteCount);
        setHasUpvoted(res.data.doubt.hasUpvoted);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doubt details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubtDetail();
  }, [id]);

  const handleDoubtUpvote = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (votingDoubt) return;
    setVotingDoubt(true);

    const nextVoted = !hasUpvoted;
    const nextCount = nextVoted ? upvotes + 1 : Math.max(0, upvotes - 1);
    setHasUpvoted(nextVoted);
    setUpvotes(nextCount);

    try {
      const res = await api.post(`/doubts/${id}/upvote`);
      if (res.data.success) {
        setUpvotes(res.data.upvoteCount);
        setHasUpvoted(res.data.hasUpvoted);
      }
    } catch {
      setHasUpvoted(!nextVoted);
      setUpvotes(upvotes);
    } finally {
      setVotingDoubt(false);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!answerText.trim() || submittingAnswer) return;

    setSubmittingAnswer(true);
    try {
      const res = await api.post(`/doubts/${id}/answers`, {
        content: answerText.trim(),
      });

      if (res.data.success) {
        setAnswerText('');
        // Add new answer immediately to list
        const newAns = {
          ...res.data.answer,
          upvoteCount: 0,
          hasUpvoted: false,
        };
        setDoubt((prev) => ({
          ...prev,
          answers: [...(prev.answers || []), newAns],
          answerCount: (prev.answers ? prev.answers.length : 0) + 1,
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleDeleteAnswer = (deletedAnswerId) => {
    setDoubt((prev) => ({
      ...prev,
      answers: prev.answers.filter((a) => a._id !== deletedAnswerId),
      answerCount: Math.max(0, (prev.answerCount || 1) - 1),
    }));
  };

  const handleDeleteDoubt = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this doubt?')) return;
    setDeletingDoubt(true);
    try {
      const res = await api.delete(`/doubts/${id}`);
      if (res.data.success) {
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete doubt');
      setDeletingDoubt(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 animate-pulse space-y-4">
          <div className="w-24 h-5 bg-slate-800 rounded"></div>
          <div className="w-3/4 h-8 bg-slate-800 rounded"></div>
          <div className="w-full h-24 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !doubt) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-200">Doubt Not Found</h2>
        <p className="mt-2 text-slate-400 text-sm">{error || 'This question does not exist or was deleted.'}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doubts Feed</span>
        </Link>
      </div>
    );
  }

  const isDoubtAuthor = user && doubt.author && user._id === (doubt.author._id || doubt.author);
  const authorName = doubt.author?.name || 'Anonymous Student';
  const authorInitial = authorName[0]?.toUpperCase() || 'S';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top back navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all doubts</span>
      </Link>

      {/* Main Doubt Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-start gap-4">
          {/* Large Upvote Button */}
          <button
            onClick={handleDoubtUpvote}
            title={isAuthenticated ? 'Upvote this doubt' : 'Log in to upvote'}
            className={`flex flex-col items-center justify-center min-w-[54px] py-2.5 px-2 rounded-2xl border transition-all ${
              hasUpvoted
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40 shadow-inner'
                : 'bg-slate-800/70 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ArrowBigUp className={`w-7 h-7 ${hasUpvoted ? 'fill-indigo-400 text-indigo-400' : ''}`} />
            <span className="text-sm font-bold mt-0.5">{upvotes}</span>
          </button>

          <div className="flex-1 min-w-0">
            {/* Subject badge and meta */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <SubjectBadge subject={doubt.subject} />
              <span className="text-xs text-slate-500">
                Posted {new Date(doubt.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 leading-snug">
              {doubt.title}
            </h1>

            {/* Description / Problem Statement */}
            <div className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
              {doubt.description}
            </div>

            {/* Tags */}
            {doubt.tags && doubt.tags.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {doubt.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author bar & author controls */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-sm">
                  {authorInitial}
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{authorName}</p>
                  <p className="text-[11px] text-slate-500">
                    {doubt.author?.bio || 'EduTech Student'}
                  </p>
                </div>
              </div>

              {isDoubtAuthor && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteDoubt}
                    disabled={deletingDoubt}
                    className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Doubt</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {doubt.answers?.length || 0}{' '}
              {doubt.answers?.length === 1 ? 'Community Solution' : 'Community Solutions'}
            </h2>
          </div>
        </div>

        {/* Answer Composer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          {isAuthenticated ? (
            <form onSubmit={handlePostAnswer} className="space-y-3">
              <label className="block text-sm font-semibold text-slate-200">
                Write your solution
              </label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Explain the concept step-by-step, provide code snippets or mathematical reasoning..."
                rows={4}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Tip: Be clear and constructive to earn peer upvotes!
                </span>
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerText.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingAnswer ? 'Posting...' : 'Post Solution'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-300 mb-3">
                Have a solution to help your peer?
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Log In to Post a Solution
              </Link>
            </div>
          )}
        </div>

        {/* Answers List */}
        <div className="space-y-4">
          {doubt.answers && doubt.answers.length > 0 ? (
            doubt.answers.map((answer) => (
              <AnswerCard
                key={answer._id}
                doubtId={doubt._id}
                answer={answer}
                onDelete={handleDeleteAnswer}
              />
            ))
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
              No solutions posted yet. Be the first to answer!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoubtDetailPage;
