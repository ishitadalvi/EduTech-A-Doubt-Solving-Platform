import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HelpCircle,
  FileText,
  Zap,
  User as UserIcon,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F19]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                Edu<span className="text-indigo-400">Tech</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
                Peer Learning & Revision
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <NavLink to="/" end className={navLinkClass}>
              <HelpCircle className="w-4 h-4" />
              <span>Doubts Feed</span>
            </NavLink>
            <NavLink to="/notes" className={navLinkClass}>
              <FileText className="w-4 h-4" />
              <span>Notes Library</span>
            </NavLink>
            <NavLink to="/flashcards" className={navLinkClass}>
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Flashcard Revision</span>
            </NavLink>
          </div>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/ask"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ask Doubt</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/70 hover:border-slate-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">
                    {user?.name}
                  </span>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-200 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/login?mode=signup"
                  className="px-3.5 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/ask"
              className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0B0F19] px-4 pt-2 pb-4 space-y-2">
          <NavLink
            to="/"
            end
            onClick={() => setMenuOpen(false)}
            className={navLinkClass}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Doubts Feed</span>
          </NavLink>
          <NavLink
            to="/notes"
            onClick={() => setMenuOpen(false)}
            className={navLinkClass}
          >
            <FileText className="w-4 h-4" />
            <span>Notes Library</span>
          </NavLink>
          <NavLink
            to="/flashcards"
            onClick={() => setMenuOpen(false)}
            className={navLinkClass}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Flashcards</span>
          </NavLink>
          <div className="pt-2 border-t border-slate-800 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                  <span>Profile ({user?.name})</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-200"
                >
                  Log In
                </Link>
                <Link
                  to="/login?mode=signup"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
