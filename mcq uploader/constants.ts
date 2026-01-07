import { SubjectOption } from './types';

export const UNIVERSITIES = [
  { id: 'univ-1', name: 'Harvard University' },
  { id: 'univ-2', name: 'Stanford University' },
  { id: 'univ-3', name: 'MIT' },
  { id: 'univ-4', name: 'Caltech' },
  { id: 'univ-5', name: 'Oxford University' },
  { id: 'univ-6', name: 'Cambridge University' },
];

export const SUBJECTS: SubjectOption[] = [
  {
    value: 'Mathematics',
    label: 'Mathematics',
    topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry']
  },
  {
    value: 'English',
    label: 'English',
    topics: ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Literature']
  },
  {
    value: 'IQ Tests',
    label: 'IQ Tests',
    topics: ['Logical Reasoning', 'Pattern Recognition', 'Abstract Reasoning']
  },
  {
    value: 'General Knowledge',
    label: 'General Knowledge',
    topics: ['History', 'Geography', 'Science', 'Current Affairs']
  }
];

// Initial mock data to populate the app if empty
export const INITIAL_DATA_SEED = [
  {
    id: 'seed-1',
    question: 'What is the value of $x$ in the equation $2x + 4 = 10$?',
    options: [
      { id: '1', text: '$x = 2$', is_correct: false },
      { id: '2', text: '$x = 3$', is_correct: true },
      { id: '3', text: '$x = 4$', is_correct: false },
      { id: '4', text: '$x = 5$', is_correct: false },
    ],
    explanation: 'Subtract 4 from both sides: $2x = 6$. Divide by 2: $x = 3$.',
    subject: 'Mathematics',
    topic: 'Algebra',
    created_at: new Date().toISOString()
  },
  {
    id: 'seed-2',
    question: 'Which word is a synonym for "Happy"?',
    options: [
      { id: '1', text: 'Sad', is_correct: false },
      { id: '2', text: 'Angry', is_correct: false },
      { id: '3', text: 'Joyful', is_correct: true },
      { id: '4', text: 'Tired', is_correct: false },
    ],
    explanation: 'Joyful means feeling, expressing, or causing great pleasure and happiness.',
    subject: 'English',
    topic: 'Vocabulary',
    created_at: new Date().toISOString()
  },
  {
    id: 'seed-3',
    question: 'Calculate the integral: $$\\int_{0}^{\\pi} \\sin(x) dx$$',
    options: [
      { id: '1', text: '$0$', is_correct: false },
      { id: '2', text: '$1$', is_correct: false },
      { id: '3', text: '$2$', is_correct: true },
      { id: '4', text: '$\\pi$', is_correct: false },
    ],
    explanation: 'The integral of $\\sin(x)$ is $-\\cos(x)$. Evaluating from $0$ to $\\pi$: $(-\\cos(\\pi)) - (-\\cos(0)) = -(-1) - (-1) = 1 + 1 = 2$.',
    subject: 'Mathematics',
    topic: 'Calculus',
    created_at: new Date().toISOString()
  }
];