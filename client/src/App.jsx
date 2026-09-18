import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import DoubtDetailPage from './pages/DoubtDetailPage';
import AskDoubtPage from './pages/AskDoubtPage';
import NotesPage from './pages/NotesPage';
import FlashcardsPage from './pages/FlashcardsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/doubts/:id" element={<DoubtDetailPage />} />
          <Route
            path="/ask"
            element={
              <ProtectedRoute>
                <AskDoubtPage />
              </ProtectedRoute>
            }
          />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EduTech — Community Doubt-Solving & Micro-Learning Platform.</p>
          <p className="flex items-center gap-1">
            Built for collaborative student learning • Powered by MERN
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
