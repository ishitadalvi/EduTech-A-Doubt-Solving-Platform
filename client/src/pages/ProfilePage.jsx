import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Calendar,
  HelpCircle,
  MessageSquare,
  FileText,
  Zap,
  Edit2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DoubtCard from '../components/DoubtCard';
import NoteCard from '../components/NoteCard';
import api from '../api/axios';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Bio/Name State
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Tab: 'doubts' | 'notes'
  const [activeTab, setActiveTab] = useState('doubts');

  const fetchProfile = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/users/${user._id}`);
      if (res.data.success) {
        setProfileData(res.data);
        setNameInput(res.data.user.name);
        setBioInput(res.data.user.bio || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?._id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setSaving(true);
    try {
      const res = await api.put('/users/profile', {
        name: nameInput.trim(),
        bio: bioInput.trim(),
      });
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileData((prev) => ({
          ...prev,
          user: { ...prev.user, name: nameInput.trim(), bio: bioInput.trim() },
        }));
        setIsEditing(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="w-48 h-6 bg-slate-800 rounded"></div>
              <div className="w-32 h-4 bg-slate-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = profileData?.user || user;
  const stats = profileData?.stats || {
    doubtsCount: 0,
    answersCount: 0,
    notesCount: 0,
    sessionsCompleted: currentUser?.sessionsCompleted || 0,
    cardsReviewed: currentUser?.cardsReviewed || 0,
  };

  const joinDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recent student';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Avatar Initial */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shadow-indigo-600/20 border border-indigo-400/30">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>

            <div className="space-y-1">
              {!isEditing ? (
                <>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-100">
                      {currentUser?.name}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 p-1 rounded-lg hover:bg-indigo-500/10 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{currentUser?.email}</p>
                  <p className="text-sm text-slate-300 pt-1 leading-relaxed max-w-lg">
                    {currentUser?.bio || 'Curious learner on EduTech.'}
                  </p>
                </>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      required
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
                    >
                      <Check className="w-3 h-3" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Badges Grid */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl text-center">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-1.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-slate-100">{stats.doubtsCount}</span>
            <p className="text-[11px] text-slate-400 font-medium">Doubts Asked</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl text-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-1.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-slate-100">{stats.answersCount}</span>
            <p className="text-[11px] text-slate-400 font-medium">Answers Provided</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl text-center">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto mb-1.5">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-slate-100">{stats.notesCount}</span>
            <p className="text-[11px] text-slate-400 font-medium">Notes Shared</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl text-center">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-1.5">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-slate-100">
              {stats.sessionsCompleted}
            </span>
            <p className="text-[11px] text-slate-400 font-medium">
              Revision Rounds ({stats.cardsReviewed} cards)
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for Recent Contributions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('doubts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'doubts'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>My Doubts ({profileData?.recentDoubts?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Notes ({profileData?.recentNotes?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'doubts' ? (
          <div className="space-y-4">
            {profileData?.recentDoubts && profileData.recentDoubts.length > 0 ? (
              profileData.recentDoubts.map((doubt) => (
                <DoubtCard key={doubt._id} doubt={doubt} />
              ))
            ) : (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                You haven't posted any doubts yet.
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileData?.recentNotes && profileData.recentNotes.length > 0 ? (
              profileData.recentNotes.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))
            ) : (
              <div className="col-span-2 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                You haven't shared any notes yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
