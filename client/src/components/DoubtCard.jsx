import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowBigUp, MessageSquare, Clock } from 'lucide-react';
import SubjectBadge from './SubjectBadge';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const formatTimeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const DoubtCard = ({ doubt, onVoteUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [upvotes, setUpvotes] = useState(doubt.upvoteCount || (doubt.upvotes ? doubt.upvotes.length : 0));
  const [hasUpvoted, setHasUpvoted] = useState(
    doubt.hasUpvoted !== undefined
      ? doubt.hasUpvoted
      : user && doubt.upvotes
      ? doubt.upvotes.some((u) => (typeof u === 'string' ? u === user._id : u._id === user._id))
      : false
  );
  const [voting, setVoting] = useState(false);

  const handleVote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (voting) return;
    setVoting(true);

    // Optimistic toggle
    const newHasUpvoted = !hasUpvoted;
    const newCount = newHasUpvoted ? upvotes + 1 : Math.max(0, upvotes - 1);
    setHasUpvoted(newHasUpvoted);
    setUpvotes(newCount);

    try {
      const res = await api.post(`/doubts/${doubt._id}/upvote`);
      if (res.data.success) {
        setUpvotes(res.data.upvoteCount);
        setHasUpvoted(res.data.hasUpvoted);
        if (onVoteUpdate) {
          onVoteUpdate(doubt._id, res.data.upvoteCount, res.data.hasUpvoted);
        }
      }
    } catch {
      // Revert on failure
      setHasUpvoted(!newHasUpvoted);
      setUpvotes(upvotes);
    } finally {
      setVoting(false);
    }
  };

  const authorName = doubt.author?.name || 'Anonymous Student';
  const authorInitial = authorName[0]?.toUpperCase() || 'S';
  const answerCount = doubt.answerCount !== undefined ? doubt.answerCount : (doubt.answers?.length || 0);

  return (
    <div className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="flex items-start gap-4">
        {/* Upvote column */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleVote}
            title={isAuthenticated ? 'Upvote doubt' : 'Log in to upvote'}
            className={`flex flex-col items-center justify-center w-12 py-2 rounded-xl border transition-all ${
              hasUpvoted
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40 shadow-inner'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <ArrowBigUp
              className={`w-6 h-6 transition-transform group-hover:scale-105 ${
                hasUpvoted ? 'fill-indigo-400 text-indigo-400' : ''
              }`}
            />
            <span className="text-xs font-bold mt-0.5">{upvotes}</span>
          </button>
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <SubjectBadge subject={doubt.subject} />
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTimeAgo(doubt.createdAt)}
            </span>
          </div>

          <Link to={`/doubts/${doubt._id}`} className="block group-hover:text-indigo-300">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
              {doubt.title}
            </h3>
          </Link>

          <p className="mt-1.5 text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {doubt.description}
          </p>

          {/* Tags */}
          {doubt.tags && doubt.tags.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              {doubt.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/40"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer with author and answer counter */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-[11px]">
                {authorInitial}
              </div>
              <span className="font-medium text-slate-300">{authorName}</span>
            </div>

            <Link
              to={`/doubts/${doubt._id}`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                answerCount > 0
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'text-slate-400 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="font-semibold">{answerCount}</span>
              <span className="hidden sm:inline">
                {answerCount === 1 ? 'solution' : 'solutions'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoubtCard;
