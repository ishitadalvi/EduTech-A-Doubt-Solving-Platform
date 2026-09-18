import React, { useState } from 'react';
import { ExternalLink, BookOpen, Trash2, Clock } from 'lucide-react';
import SubjectBadge from './SubjectBadge';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const NoteCard = ({ note, onDelete }) => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const authorId = typeof note.author === 'object' ? note.author?._id : note.author;
  const isAuthor = user && authorId && user._id === authorId;
  const authorName = note.author?.name || 'Anonymous Peer';
  const authorInitial = authorName[0]?.toUpperCase() || 'S';

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete note "${note.title}"?`)) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/notes/${note._id}`);
      if (res.data.success && onDelete) {
        onDelete(note._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note');
      setDeleting(false);
    }
  };

  return (
    <div className="group flex flex-col justify-between bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <SubjectBadge subject={note.subject} />
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(note.createdAt)}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
          {note.title}
        </h3>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="truncate">{note.topic}</span>
        </div>

        <p className="mt-3 text-sm text-slate-400 line-clamp-4 leading-relaxed whitespace-pre-line bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 font-mono text-xs">
          {note.content}
        </p>

        {note.tags && note.tags.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {note.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/40"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-[11px]">
            {authorInitial}
          </div>
          <span className="font-medium text-slate-300 truncate max-w-[100px] sm:max-w-[130px]">
            {authorName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {note.resourceLink && (
            <a
              href={note.resourceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition-colors"
            >
              <span>Resource</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
