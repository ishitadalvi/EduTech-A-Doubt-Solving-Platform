import React, { useState } from 'react';
import { ArrowBigUp, CheckCircle2, Trash2, Clock } from 'lucide-react';
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

const AnswerCard = ({ doubtId, answer, onDelete }) => {
  const { user, isAuthenticated } = useAuth();
  const [upvotes, setUpvotes] = useState(
    answer.upvoteCount !== undefined
      ? answer.upvoteCount
      : answer.upvotes
      ? answer.upvotes.length
      : 0
  );
  const [hasUpvoted, setHasUpvoted] = useState(
    answer.hasUpvoted !== undefined
      ? answer.hasUpvoted
      : user && answer.upvotes
      ? answer.upvotes.some((u) => (typeof u === 'string' ? u === user._id : u._id === user._id))
      : false
  );
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const authorId = typeof answer.author === 'object' ? answer.author?._id : answer.author;
  const isAuthor = user && authorId && user._id === authorId;
  const authorName = answer.author?.name || 'Fellow Student';
  const authorInitial = authorName[0]?.toUpperCase() || 'S';

  const handleVote = async () => {
    if (!isAuthenticated) return;
    if (voting) return;
    setVoting(true);

    const nextVoted = !hasUpvoted;
    const nextCount = nextVoted ? upvotes + 1 : Math.max(0, upvotes - 1);
    setHasUpvoted(nextVoted);
    setUpvotes(nextCount);

    try {
      const res = await api.post(`/doubts/${doubtId}/answers/${answer._id}/upvote`);
      if (res.data.success) {
        setUpvotes(res.data.upvoteCount);
        setHasUpvoted(res.data.hasUpvoted);
      }
    } catch {
      setHasUpvoted(!nextVoted);
      setUpvotes(upvotes);
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/doubts/${doubtId}/answers/${answer._id}`);
      if (res.data.success && onDelete) {
        onDelete(answer._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete answer');
      setDeleting(false);
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-5 border transition-all ${
        answer.isAccepted
          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80'
      }`}
    >
      {answer.isAccepted && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 w-fit px-2.5 py-1 rounded-full mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Accepted / Community Verified Solution</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Vote pill */}
        <button
          onClick={handleVote}
          disabled={!isAuthenticated}
          title={isAuthenticated ? 'Upvote answer' : 'Log in to upvote'}
          className={`flex flex-col items-center justify-center min-w-[42px] py-1.5 px-2 rounded-xl border transition-all ${
            hasUpvoted
              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ArrowBigUp className={`w-5 h-5 ${hasUpvoted ? 'fill-indigo-400' : ''}`} />
          <span className="text-xs font-bold">{upvotes}</span>
        </button>

        {/* Content & Author */}
        <div className="flex-1 min-w-0">
          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
            {answer.content}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-[11px]">
                {authorInitial}
              </div>
              <span className="font-medium text-slate-300">{authorName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(answer.createdAt)}
              </span>
            </div>

            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors flex items-center gap-1"
                title="Delete your answer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;
