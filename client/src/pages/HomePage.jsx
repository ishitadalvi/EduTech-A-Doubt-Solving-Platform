import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  HelpCircle,
  Filter,
  Flame,
  Clock,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import DoubtCard from '../components/DoubtCard';
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

const HomePage = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortOption, setSortOption] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSubject !== 'All') params.subject = selectedSubject;
      if (sortOption) params.sort = sortOption;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/doubts', { params });
      if (res.data.success) {
        setDoubts(res.data.doubts);
      }
    } catch (err) {
      console.error('Error loading doubts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search/filter fetch
    const timer = setTimeout(() => {
      fetchDoubts();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedSubject, sortOption, searchQuery]);

  const handleVoteUpdate = (doubtId, newCount, hasUpvoted) => {
    setDoubts((prev) =>
      prev.map((d) =>
        d._id === doubtId ? { ...d, upvoteCount: newCount, hasUpvoted } : d
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Knowledge Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Stuck on a problem? <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
              Solve it together.
            </span>
          </h1>

          <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
            Ask doubts, share peer-reviewed answers, upvote clarity, and retain concepts
            with rapid timer-based micro-learning.
          </p>

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ask a Doubt</span>
            </Link>
            <Link
              to="/flashcards"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Start Flashcard Session</span>
            </Link>
          </div>
        </div>
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

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doubts by title, question, or tag..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setSortOption('recent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sortOption === 'recent'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Latest</span>
            </button>
            <button
              onClick={() => setSortOption('upvotes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sortOption === 'upvotes'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Voted</span>
            </button>
            <button
              onClick={() => setSortOption('unanswered')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sortOption === 'unanswered'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Unsolved</span>
            </button>
          </div>
        </div>
      </div>

      {/* Doubts Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-14 bg-slate-800 rounded-xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="w-1/4 h-4 bg-slate-800 rounded"></div>
                    <div className="w-3/4 h-5 bg-slate-800 rounded"></div>
                    <div className="w-full h-4 bg-slate-800 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : doubts.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No doubts found</h3>
            <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
              {searchQuery || selectedSubject !== 'All'
                ? 'Try broadening your search query or switching the subject filter.'
                : 'Be the first student to ask a question and get help from the community!'}
            </p>
            <Link
              to="/ask"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ask a Doubt</span>
            </Link>
          </div>
        ) : (
          doubts.map((doubt) => (
            <DoubtCard
              key={doubt._id}
              doubt={doubt}
              onVoteUpdate={handleVoteUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
