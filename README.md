# EduTech — Community Doubt-Solving & Micro-Learning Platform

EduTech is a full-stack MERN web application where students collaborate to solve academic doubts, upvote high-quality solutions, share study notes and cheat sheets, and reinforce retention via countdown-driven flashcard micro-learning sessions.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Lucide Icons, Axios
- **Backend**: Node.js, Express, REST API, CORS, Dotenv
- **Database**: MongoDB via Mongoose (with automated in-memory embedded fallback via `mongodb-memory-server` for zero-setup local execution)
- **Authentication**: JWT (JSON Web Tokens), Bcryptjs password hashing, Protected Route Middleware

---

## Key Features

1. **Authentication & Profiles**
   - Secure user registration and login with encrypted passwords (`bcryptjs`).
   - JWT issued upon authentication and persisted in `localStorage`.
   - Protected route guards on both client and server.
   - Student profile displaying join date and live activity metrics (Doubts posted, answers given, notes shared, revision rounds completed, cards reviewed).
   - Instant "Use Demo Student" login option for friction-free exploration.

2. **Doubts (Ask & Solve)**
   - Create, browse, and search doubts across multiple subject domains (Computer Science, Mathematics, Physics, Chemistry, Biology, Economics, General).
   - Filter by subject and sort by Latest, Top Voted, or Unsolved.
   - Nested answer threads under each doubt with verified solution badges.
   - Toggleable upvotes (1 vote per user) on both questions and answers with instant optimistic UI updates.

3. **Notes (Share Notes Library)**
   - Community-shared study summaries, formula sheets, and topic overviews.
   - Instant search across topic titles, tags, and content keywords.
   - Support for external reference / PDF documentation links.
   - Author controls (edit/delete) for owned notes.

4. **Micro-Learning (Active Recall Flashcards)**
   - 3D flip card animation with front (question/prompt) and back (solution/explanation).
   - Configurable revision rounds (5, 10, 15 cards) and countdown timers (15s, 20s, 30s, or untimed).
   - Interactive hints and "Mark Mastered (✓)" vs "Skip (→)" tracking.
   - End-of-round summary card displaying score percentage, accuracy badges, and breakdown.
   - Automatic progress synchronization to the user profile.

---

## Quick Start (Single Command)

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Optional! If a local MongoDB daemon is not detected at `mongodb://127.0.0.1:27017/edutech`, EduTech automatically starts an embedded in-memory MongoDB instance with pre-seeded sample data.

### 2. Installation
From the project root directory:
```bash
# Install dependencies for root, server, and client
npm run install:all
```

Or install in each directory:
```bash
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Run the Platform
Run both backend and frontend concurrently with a single command:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Pre-Seeded Demo Accounts

The database auto-seeds realistic sample accounts, questions, answers, and flashcards across subjects:
- **Email**: `alex@edutech.edu`
- **Password**: `password123`
*(Or click the "Use Demo Student" button on the Sign In page)*

---

## REST API Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user & return JWT | Public |
| `POST` | `/api/auth/login` | Login user & return JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user | Private |
| `GET` | `/api/doubts` | Get doubts feed with search & filters | Public |
| `GET` | `/api/doubts/:id` | Get single doubt with nested answers | Public |
| `POST` | `/api/doubts` | Create a new doubt | Private |
| `PUT` | `/api/doubts/:id` | Update doubt | Private (Author) |
| `DELETE` | `/api/doubts/:id` | Delete doubt | Private (Author) |
| `POST` | `/api/doubts/:id/upvote` | Toggle upvote on doubt | Private |
| `POST` | `/api/doubts/:id/answers` | Post an answer to a doubt | Private |
| `POST` | `/api/doubts/:id/answers/:ansId/upvote` | Toggle upvote on answer | Private |
| `DELETE` | `/api/doubts/:id/answers/:ansId` | Delete answer | Private (Author) |
| `GET` | `/api/notes` | Get notes with search & filters | Public |
| `POST` | `/api/notes` | Create a study note | Private |
| `DELETE` | `/api/notes/:id` | Delete a study note | Private (Author) |
| `GET` | `/api/flashcards` | Get flashcard deck by subject/topic | Public |
| `GET` | `/api/flashcards/stats` | Get flashcard subject statistics | Public |
| `POST` | `/api/flashcards` | Add new flashcard | Private |
| `POST` | `/api/flashcards/session-complete` | Save revision session progress | Private |
| `GET` | `/api/users/:id` | Get user profile & activity count | Public |
| `PUT` | `/api/users/profile` | Update profile bio and name | Private |
