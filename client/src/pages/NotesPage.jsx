import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  X,
  ExternalLink,
  BookOpen,
  Filter,
} from 'lucide-react';
import NoteCard from '../components/NoteCard';
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

const NotesPage = () => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Modal for creating note
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Computer Science');
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newTags, setNewTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSubject !== 'All') params.subject = selectedSubject;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/notes', { params });
      if (res.data.success) {
        setNotes(res.data.notes);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedSubject, searchQuery]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTopic.trim() || !newContent.trim()) {
      setModalError('Please fill in title, topic, and notes content.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const res = await api.post('/notes', {
        title: newTitle.trim(),
        subject: newSubject,
        topic: newTopic.trim(),
        content: newContent.trim(),
        resourceLink: newLink.trim(),
        tags: newTags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
      });

      if (res.data.success) {
        // Prepend new note immediately
        setNotes([res.data.note, ...notes]);
        setIsModalOpen(false);
        // Reset form
        setNewTitle('');
        setNewTopic('');
        setNewContent('');
        setNewLink('');
        setNewTags('');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to publish note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    setNotes((prev) => prev.filter((n) => n._id !== noteId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Shared Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
            Study Notes & Cheat Sheets
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse peer-summarized topic reviews, formula sheets, and study materials.
          </p>
        </div>

        {isAuthenticated ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all hover:-translate-y-0.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Share Notes</span>
          </button>
        ) : (
          <span className="text-xs text-slate-500 self-start sm:self-auto">
            Log in to publish your revision notes
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedSubject === subj
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by keyword, topic, or tags (e.g. Dynamic Programming, Calculus)..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 h-64 animate-pulse"
              >
                <div className="w-20 h-5 bg-slate-800 rounded mb-3"></div>
                <div className="w-3/4 h-5 bg-slate-800 rounded mb-2"></div>
                <div className="w-full h-24 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No notes found</h3>
            <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
              {searchQuery || selectedSubject !== 'All'
                ? 'Try adjusting your search keywords or topic filter.'
                : 'Be the first to share notes on this subject!'}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Share Notes Now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} onDelete={handleDeleteNote} />
            ))}
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-slate-100">Share Study Note</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Theorem & Asymptotic Notation Cheatsheet"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    placeholder="e.g. Asymptotics"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Notes / Summary Content *
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  placeholder="Write formulas, core definitions, bullet points, or algorithm steps..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  External Resource / PDF Link (optional)
                </label>
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. formulas, exam-prep, algorithms"
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
