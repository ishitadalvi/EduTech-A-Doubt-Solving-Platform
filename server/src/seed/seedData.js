const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doubt = require('../models/Doubt');
const Note = require('../models/Note');
const Flashcard = require('../models/Flashcard');

const initialFlashcards = [
  // Computer Science
  {
    subject: 'Computer Science',
    topic: 'Algorithms & Complexity',
    question: 'What is the worst-case time complexity of QuickSort and how can it be mitigated?',
    answer: 'O(n²) occurs when the pivot chosen is always the smallest or largest element (e.g. already sorted array). It can be mitigated using randomized pivot selection or the median-of-three technique to achieve O(n log n) expected time.',
    hint: 'Think about bad pivot choices on already sorted arrays.',
    difficulty: 'medium',
  },
  {
    subject: 'Computer Science',
    topic: 'Data Structures',
    question: 'Explain the difference between a BFS (Breadth-First Search) and DFS (Depth-First Search) data structure requirement.',
    answer: 'BFS uses a FIFO Queue to explore nodes level-by-level, whereas DFS uses a LIFO Stack (or recursion call stack) to explore as deep as possible along each branch before backtracking.',
    hint: 'Queue vs Stack',
    difficulty: 'easy',
  },
  {
    subject: 'Computer Science',
    topic: 'Databases & Web',
    question: 'What are the 4 ACID properties in database transactions?',
    answer: 'Atomicity (all or nothing), Consistency (preserves database invariants), Isolation (concurrent transactions execute independently), and Durability (committed changes persist even during crashes).',
    hint: 'A-C-I-D acronym meaning',
    difficulty: 'medium',
  },
  // Mathematics
  {
    subject: 'Mathematics',
    topic: 'Calculus',
    question: 'What does the Fundamental Theorem of Calculus state?',
    answer: 'It connects differentiation and integration: Part 1 shows that if f is continuous, the integral function F(x) has derivative f(x). Part 2 states that ∫[a, b] f(x) dx = F(b) - F(a), where F is any antiderivative of f.',
    hint: 'Relationship between derivatives and definite integrals.',
    difficulty: 'medium',
  },
  {
    subject: 'Mathematics',
    topic: 'Linear Algebra',
    question: 'What does it mean if the determinant of a square matrix is 0 (det(A) = 0)?',
    answer: 'The matrix is singular and non-invertible. Its rows/columns are linearly dependent, and the linear transformation collapses space into a lower dimension.',
    hint: 'Invertibility and linearly dependent vectors.',
    difficulty: 'easy',
  },
  {
    subject: 'Mathematics',
    topic: 'Probability',
    question: 'State Bayes’ Theorem formula and its core purpose.',
    answer: 'P(A|B) = [P(B|A) * P(A)] / P(B). It allows updating the probability of a hypothesis A given observed evidence B based on prior knowledge.',
    hint: 'Posterior probability given evidence.',
    difficulty: 'medium',
  },
  // Physics
  {
    subject: 'Physics',
    topic: 'Electromagnetism',
    question: 'What does Faraday’s Law of Electromagnetic Induction state?',
    answer: 'The induced electromotive force (EMF) in any closed circuit is equal to the negative rate of change of magnetic flux through the circuit: ε = -dΦ_B/dt (Lenz’s law gives the negative sign).',
    hint: 'Changing magnetic flux creates induced voltage.',
    difficulty: 'medium',
  },
  {
    subject: 'Physics',
    topic: 'Thermodynamics',
    question: 'What is the Second Law of Thermodynamics regarding entropy in an isolated system?',
    answer: 'The total entropy of an isolated system can never decrease over time; it can remain constant in reversible processes or increase in irreversible spontaneous processes (ΔS_total ≥ 0).',
    hint: 'Entropy never decreases in an isolated system.',
    difficulty: 'easy',
  },
  // Chemistry
  {
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    question: 'What is the difference between SN1 and SN2 reaction mechanisms?',
    answer: 'SN1 is a two-step unimolecular substitution involving a carbocation intermediate (favors tertiary carbons and polar protic solvents). SN2 is a single-step concerted bimolecular substitution with backside attack causing inversion of stereochemistry (favors primary carbons and polar aprotic solvents).',
    hint: 'Step count, carbocation formation vs backside attack.',
    difficulty: 'hard',
  },
];

const checkAndSeedData = async () => {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return; // Already initialized
  }

  console.log('[Seed] Populating initial sample data for EduTech...');

  // Create demo users
  const demoUsers = await User.create([
    {
      name: 'Alex Chen',
      email: 'alex@edutech.edu',
      password: 'password123',
      bio: 'CS sophomore enthusiastic about distributed systems & algorithms.',
      sessionsCompleted: 4,
      cardsReviewed: 28,
    },
    {
      name: 'Sophia Patel',
      email: 'sophia@edutech.edu',
      password: 'password123',
      bio: 'Pre-med student loving biochemistry and organic reaction pathways.',
      sessionsCompleted: 6,
      cardsReviewed: 45,
    },
    {
      name: 'Liam Zhang',
      email: 'liam@edutech.edu',
      password: 'password123',
      bio: 'Math & Physics major diving deep into differential equations.',
      sessionsCompleted: 3,
      cardsReviewed: 22,
    },
  ]);

  const [alex, sophia, liam] = demoUsers;

  // Create starter Doubts with nested answers
  await Doubt.create([
    {
      title: 'Why does useEffect run twice in React 18 development mode?',
      description: 'Whenever I reload my component, my `console.log` inside `useEffect(..., [])` runs twice! Is this a memory leak or a bug in React 18, and how do I properly structure side-effects to handle this?',
      subject: 'Computer Science',
      tags: ['react', 'javascript', 'hooks', 'react18'],
      author: alex._id,
      upvotes: [sophia._id, liam._id],
      answers: [
        {
          content: 'This is intentional behavior under `React.StrictMode` in development! React deliberately mounts, unmounts, and remounts components to help you identify missing cleanup logic (such as unsubscribing from event listeners, clearing intervals, or cancelling fetch requests). In production builds, it will only mount once.',
          author: liam._id,
          upvotes: [alex._id, sophia._id],
          isAccepted: true,
        },
        {
          content: 'Tip: Always return a cleanup function from your useEffect if you attach listeners or initiate timers: `return () => clearInterval(timerId);`. This ensures idempotent effect execution!',
          author: sophia._id,
          upvotes: [alex._id],
          isAccepted: false,
        },
      ],
    },
    {
      title: 'How do you intuitively understand Eigenvalues and Eigenvectors?',
      description: 'I know the equation A*v = λ*v algebraically, but visually what is happening when a matrix acts on an eigenvector versus any other vector?',
      subject: 'Mathematics',
      tags: ['linear-algebra', 'matrices', 'geometry'],
      author: liam._id,
      upvotes: [alex._id],
      answers: [
        {
          content: 'Think of a matrix as stretching, squishing, or rotating coordinate space. For most vectors, the matrix changes both their magnitude AND their direction. But eigenvectors are the special vectors whose DIRECTION remains completely unchanged along their span — they only get scaled (stretched or squished) by the factor λ (the eigenvalue)!',
          author: alex._id,
          upvotes: [liam._id, sophia._id],
          isAccepted: true,
        },
      ],
    },
    {
      title: 'Why do polar protic solvents favor SN1 over SN2 reactions?',
      description: 'I am preparing for an organic chemistry exam. Why does a solvent like water or ethanol speed up SN1 and slow down SN2?',
      subject: 'Chemistry',
      tags: ['organic-chemistry', 'reaction-mechanisms', 'solvents'],
      author: sophia._id,
      upvotes: [alex._id, liam._id],
      answers: [
        {
          content: 'Polar protic solvents have hydrogen-bonding capabilities (like -OH or -NH groups). They strongly solvate and stabilize both the leaving group anion AND the carbocation intermediate, lowering the activation energy of the rate-determining step in SN1. Conversely in SN2, protic solvents form a tight hydrogen-bonding cage around the nucleophile, dampening its reactivity and hindering backside attack.',
          author: liam._id,
          upvotes: [sophia._id],
          isAccepted: true,
        },
      ],
    },
  ]);

  // Create starter Notes
  await Note.create([
    {
      title: 'Dynamic Programming: The 5-Step Framework',
      subject: 'Computer Science',
      topic: 'Dynamic Programming',
      content: '1. Visualize Examples & Identify subproblems\n2. Define State: memo[i] or memo[i][j]\n3. Formulate the Recurrence Relation (Base cases + Transitions)\n4. Choose Iterative (Tabulation) vs Recursive (Memoization)\n5. Analyze & Optimize Space (e.g. rolling variables instead of 2D grid)',
      resourceLink: 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/',
      tags: ['algorithms', 'competitive-programming', 'dp'],
      author: alex._id,
    },
    {
      title: 'Essential Calculus Formulas: Derivatives & Integrals Sheet',
      subject: 'Mathematics',
      topic: 'Single Variable Calculus',
      content: 'Key Derivative Rules:\n- Product Rule: (uv)\' = u\'v + uv\'\n- Quotient Rule: (u/v)\' = (u\'v - uv\') / v²\n- Chain Rule: d/dx[f(g(x))] = f\'(g(x)) * g\'(x)\nIntegration by Parts:\n- ∫ u dv = uv - ∫ v du (remember LIATE rule for picking u)',
      resourceLink: 'https://tutorial.math.lamar.edu/pdf/Calculus_Cheat_Sheet_All.pdf',
      tags: ['calculus', 'cheatsheet', 'formulas'],
      author: liam._id,
    },
    {
      title: 'Key Functional Groups & IUPAC Naming Quick Guide',
      subject: 'Chemistry',
      topic: 'Organic Chemistry',
      content: 'Priority order for suffix selection:\n1. Carboxylic acid (-oic acid)\n2. Ester (-oate)\n3. Amide (-amide)\n4. Nitrile (-nitrile)\n5. Aldehyde (-al)\n6. Ketone (-one)\n7. Alcohol (-ol)\n8. Amine (-amine)\n9. Alkene (-ene)\n10. Alkyne (-yne)\n11. Alkane (-ane)',
      resourceLink: 'https://en.wikipedia.org/wiki/IUPAC_nomenclature_of_organic_chemistry',
      tags: ['organic', 'functional-groups', 'naming'],
      author: sophia._id,
    },
  ]);

  // Create Flashcards
  await Flashcard.create(
    initialFlashcards.map((c) => ({
      ...c,
      author: alex._id,
    }))
  );

  console.log('[Seed] Sample data seeded successfully! Demo accounts: alex@edutech.edu / password123');
};

module.exports = { checkAndSeedData };
