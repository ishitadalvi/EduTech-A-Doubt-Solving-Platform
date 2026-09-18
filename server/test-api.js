// Automated Integration Test Suite for EduLoop REST API
require('dotenv').config();
const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    const url = new URL(`/api${cleanPath}`, `http://127.0.0.1:${PORT}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING EDUTECH AUTOMATED API TESTS');
  console.log('========================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition, message) => {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  };

  try {
    // 1. Health check
    console.log('[1/7] Testing Health Check...');
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'ok' && health.data.app === 'EduTech API', 'GET /api/health returned 200 OK (EduTech API)');

    // 2. Auth: Signup & Login
    console.log('\n[2/7] Testing Authentication (Module 1)...');
    const testEmail = `test_${Date.now()}@edutech.edu`;
    const signupRes = await request('/auth/signup', 'POST', {
      name: 'Test Student',
      email: testEmail,
      password: 'mypassword123',
    });
    assert(signupRes.status === 201 && signupRes.data.token, 'POST /api/auth/signup creates user and issues JWT');
    const token = signupRes.data.token;
    const userId = signupRes.data.user._id;

    // Login with same credentials
    const loginRes = await request('/auth/login', 'POST', {
      email: testEmail,
      password: 'mypassword123',
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'POST /api/auth/login validates credentials and issues JWT');

    // Protected /me
    const meRes = await request('/auth/me', 'GET', null, token);
    assert(meRes.status === 200 && meRes.data.user.email === testEmail, 'GET /api/auth/me returns authenticated user');

    // 3. Security Check: Unauthenticated access blocked
    console.log('\n[3/7] Testing Route Protection (Unauthenticated 401)...');
    const unauthDoubt = await request('/doubts', 'POST', { title: 'No token', description: 'desc' });
    assert(unauthDoubt.status === 401, 'POST /api/doubts without token is rejected with 401');

    const unauthNote = await request('/notes', 'POST', { title: 'No token', topic: 't', content: 'c' });
    assert(unauthNote.status === 401, 'POST /api/notes without token is rejected with 401');

    // 4. Doubts & Nested Answers & Upvoting (Module 2)
    console.log('\n[4/7] Testing Doubts, Nested Answers & Upvoting (Module 2)...');
    const createDoubtRes = await request('/doubts', 'POST', {
      title: 'How does Dijkstra algorithm choose the next vertex?',
      subject: 'Computer Science',
      description: 'Is it using a min-heap priority queue or linear scan?',
      tags: ['algorithms', 'graphs', 'dijkstra'],
    }, token);
    assert(createDoubtRes.status === 201 && createDoubtRes.data.doubt._id, 'POST /api/doubts created doubt with author');
    const doubtId = createDoubtRes.data.doubt._id;

    // Toggle upvote on doubt
    const voteDoubtRes = await request(`/doubts/${doubtId}/upvote`, 'POST', null, token);
    assert(voteDoubtRes.status === 200 && voteDoubtRes.data.hasUpvoted === true && voteDoubtRes.data.upvoteCount === 1, 'POST /api/doubts/:id/upvote toggles upvote ON (count=1)');

    const unvoteDoubtRes = await request(`/doubts/${doubtId}/upvote`, 'POST', null, token);
    assert(unvoteDoubtRes.status === 200 && unvoteDoubtRes.data.hasUpvoted === false && unvoteDoubtRes.data.upvoteCount === 0, 'POST /api/doubts/:id/upvote toggles upvote OFF (count=0)');

    // Re-upvote
    await request(`/doubts/${doubtId}/upvote`, 'POST', null, token);

    // Post answer to doubt
    const createAnswerRes = await request(`/doubts/${doubtId}/answers`, 'POST', {
      content: 'Dijkstra extracts the unvisited vertex with minimum tentative distance, efficiently implemented via a Binary Min-Heap in O((V + E) log V).',
    }, token);
    assert(createAnswerRes.status === 201 && createAnswerRes.data.answer._id, 'POST /api/doubts/:id/answers adds nested solution');
    const answerId = createAnswerRes.data.answer._id;

    // Upvote answer
    const voteAnswerRes = await request(`/doubts/${doubtId}/answers/${answerId}/upvote`, 'POST', null, token);
    assert(voteAnswerRes.status === 200 && voteAnswerRes.data.hasUpvoted === true && voteAnswerRes.data.upvoteCount === 1, 'POST /api/doubts/:id/answers/:ansId/upvote toggles answer vote');

    // Get doubt detail
    const getDoubtRes = await request(`/doubts/${doubtId}`, 'GET', null, token);
    assert(
      getDoubtRes.status === 200 &&
      getDoubtRes.data.doubt.answers.length === 1 &&
      getDoubtRes.data.doubt.upvoteCount === 1,
      'GET /api/doubts/:id returns populated doubt with nested answers and upvotes'
    );

    // 5. Notes CRUD & Search (Module 3)
    console.log('\n[5/7] Testing Notes CRUD & Search (Module 3)...');
    const createNoteRes = await request('/notes', 'POST', {
      title: 'Graph Theory & Shortest Path Reference Sheet',
      subject: 'Computer Science',
      topic: 'Graph Algorithms',
      content: 'Dijkstra: non-negative edges only. Bellman-Ford: handles negative weights in O(VE). Floyd-Warshall: all-pairs in O(V^3).',
      resourceLink: 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm',
      tags: ['graphs', 'dijkstra', 'algorithms'],
    }, token);
    assert(createNoteRes.status === 201 && createNoteRes.data.note._id, 'POST /api/notes creates note');
    const noteId = createNoteRes.data.note._id;

    // Search note by keyword
    const searchNoteRes = await request('/notes?search=Bellman-Ford');
    assert(searchNoteRes.status === 200 && searchNoteRes.data.notes.some(n => n._id === noteId), 'GET /api/notes?search=... finds note by keyword');

    // 6. Flashcards & Micro-Learning Sessions (Module 4)
    console.log('\n[6/7] Testing Flashcards & Sessions (Module 4)...');
    const flashcardsRes = await request('/flashcards?subject=Computer+Science');
    assert(flashcardsRes.status === 200 && flashcardsRes.data.cards.length > 0, 'GET /api/flashcards retrieves subject flashcards');

    // Complete flashcard session
    const sessionRes = await request('/flashcards/session-complete', 'POST', {
      cardsReviewed: 5,
      correctCount: 4,
      skippedCount: 1,
      subject: 'Computer Science',
    }, token);
    assert(sessionRes.status === 200 && sessionRes.data.stats.sessionsCompleted >= 1, 'POST /api/flashcards/session-complete records session stats');

    // 7. User Profile & Activity Aggregations (Module 5)
    console.log('\n[7/7] Testing User Profile & Activity Aggregation...');
    const profileRes = await request(`/users/${userId}`);
    assert(
      profileRes.status === 200 &&
      profileRes.data.stats.doubtsCount >= 1 &&
      profileRes.data.stats.answersCount >= 1 &&
      profileRes.data.stats.notesCount >= 1 &&
      profileRes.data.stats.sessionsCompleted >= 1,
      'GET /api/users/:id aggregates doubts, answers, notes, and flashcard counts correctly'
    );

    console.log('\n========================================');
    console.log(`TEST RESULTS: ${passed}/${total} PASSED`);
    console.log('========================================\n');

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

// Allow server a moment to be up if run directly
setTimeout(runTests, 1500);
