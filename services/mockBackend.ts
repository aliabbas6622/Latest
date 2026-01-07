import { Institution, InstitutionStatus, Question, University, User, UserRole, StudyMaterial, StudentAttempt } from '../types';

// Initial Mock Data
const INITIAL_USERS: User[] = [
  {
    id: 'u-super-admin',
    email: 'Admin@123',
    name: 'Super Administrator',
    role: UserRole.SUPER_ADMIN,
    password: 'Admin@123',
  },
];

const INITIAL_INSTITUTIONS: Institution[] = [];
const INITIAL_UNIVERSITIES: University[] = [
  { id: 'univ-1', name: 'Harvard University', location: 'Cambridge, MA', unlockedForIds: [] },
  { id: 'univ-2', name: 'Stanford University', location: 'Stanford, CA', unlockedForIds: [] },
  { id: 'univ-3', name: 'MIT', location: 'Cambridge, MA', unlockedForIds: [] },
];

const INITIAL_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    universityId: 'univ-1',
    subject: 'Quantitative Aptitude',
    topic: 'Time and Work',
    title: 'Concept of Efficiency',
    content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed">Time and Work problems deal with the relationship between the time taken to complete a task and the rate of work (efficiency). The fundamental concept is that <strong>Work = Rate × Time</strong>.</p>
        
        <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h4 class="font-bold text-blue-900 mb-2">The Unitary Method</h4>
          <p>If a person can do a piece of work in <strong>n</strong> days, then that person's 1 day's work is <strong>1/n</strong>.</p>
        </div>

        <h3 class="text-xl font-bold text-slate-800 mt-6">Solved Example</h3>
        <div class="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
          <p class="font-medium text-slate-900 mb-4"><strong>Problem:</strong> A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is?</p>
          <div class="text-slate-600 space-y-2">
            <p><strong>Step 1:</strong> A's 1 day work = 1/15</p>
            <p><strong>Step 2:</strong> B's 1 day work = 1/20</p>
            <p><strong>Step 3:</strong> (A + B)'s 1 day work = (1/15 + 1/20) = 7/60</p>
            <p><strong>Step 4:</strong> Work done in 4 days = 4 * (7/60) = 7/15</p>
            <p><strong>Step 5:</strong> Remaining work = 1 - 7/15 = <strong>8/15</strong></p>
          </div>
        </div>
      </div>
    `,
    summary: "Work = Rate x Time. Use LCM method for complex efficiency problems."
  },
  {
    id: 'mat-2',
    universityId: 'univ-1',
    subject: 'Computer Science',
    topic: 'Algorithms',
    title: 'Big O Notation',
    content: `
      <h3>Understanding Big O Notation</h3>
      <p>Big O notation describes the limiting behavior of a function when the argument tends towards a particular value or infinity.</p>
      <h4>Key Concepts:</h4>
      <ul>
        <li><strong>O(1)</strong>: Constant time.</li>
        <li><strong>O(n)</strong>: Linear time.</li>
        <li><strong>O(log n)</strong>: Logarithmic time.</li>
      </ul>
    `
  }
];

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    universityId: 'univ-1',
    subject: 'Computer Science',
    topic: 'Algorithms',
    text: 'What is the time complexity of binary search on a sorted array?',
    options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
    correctAnswer: 1,
    explanation: 'Binary search divides the search interval in half at each step, resulting in logarithmic time complexity.'
  },
  {
    id: 'q2',
    universityId: 'univ-1',
    subject: 'Computer Science',
    topic: 'Algorithms',
    text: 'Which of the following represents linear time complexity?',
    options: ['O(1)', 'O(n^2)', 'O(n)', 'O(log n)'],
    correctAnswer: 2,
    explanation: 'O(n) means the execution time increases linearly with the size of the input.'
  },
  {
    id: 'q3',
    universityId: 'univ-1',
    subject: 'Quantitative Aptitude',
    topic: 'Time and Work',
    text: 'A can do a bit of work in 8 days, which B alone can do in 10 days in how many days both cooperatively can do it?',
    options: ['40/9 days', '41/9 days', '42/9 days', '43/9 days'],
    correctAnswer: 0,
    explanation: 'A\'s 1 day work = 1/8. B\'s 1 day work = 1/10. Together = 9/40. Time taken = 40/9 days.'
  }
];

class MockBackendService {
  private users: User[] = [];
  private institutions: Institution[] = [];
  private universities: University[] = [];
  private questions: Question[] = [];
  private materials: StudyMaterial[] = [];
  private attempts: StudentAttempt[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedUsers = localStorage.getItem('aptivo_users');
    const storedInsts = localStorage.getItem('aptivo_institutions');
    const storedUnivs = localStorage.getItem('aptivo_universities');
    const storedQuestions = localStorage.getItem('aptivo_questions');
    const storedMaterials = localStorage.getItem('aptivo_materials');
    const storedAttempts = localStorage.getItem('aptivo_attempts');

    this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
    this.institutions = storedInsts ? JSON.parse(storedInsts) : INITIAL_INSTITUTIONS;
    this.universities = storedUnivs ? JSON.parse(storedUnivs) : INITIAL_UNIVERSITIES;
    this.questions = storedQuestions ? JSON.parse(storedQuestions) : INITIAL_QUESTIONS;
    this.materials = storedMaterials ? JSON.parse(storedMaterials) : INITIAL_MATERIALS;
    this.attempts = storedAttempts ? JSON.parse(storedAttempts) : [];
  }

  private saveToStorage() {
    localStorage.setItem('aptivo_users', JSON.stringify(this.users));
    localStorage.setItem('aptivo_institutions', JSON.stringify(this.institutions));
    localStorage.setItem('aptivo_universities', JSON.stringify(this.universities));
    localStorage.setItem('aptivo_questions', JSON.stringify(this.questions));
    localStorage.setItem('aptivo_materials', JSON.stringify(this.materials));
    localStorage.setItem('aptivo_attempts', JSON.stringify(this.attempts));
  }

  // --- Middleware / Guards ---
  private requireRole(role: UserRole | undefined, allowedRoles: UserRole[]) {
    if (!role || !allowedRoles.includes(role)) {
      throw new Error(`Forbidden: Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }
  }

  // --- Auth ---

  async login(email: string, pass: string): Promise<{ user: User; token: string }> {
    const user = this.users.find((u) => u.email === email && u.password === pass);
    if (!user) throw new Error('Invalid credentials');

    if (user.role === UserRole.INSTITUTION_ADMIN) {
      const inst = this.institutions.find(i => i.id === user.institutionId);
      if (!inst || inst.status !== InstitutionStatus.APPROVED) {
        throw new Error('Institution is not approved or has been blocked.');
      }
    }

    if (user.role === UserRole.STUDENT) {
      const inst = this.institutions.find(i => i.id === user.institutionId);
      if (!inst || inst.status !== InstitutionStatus.APPROVED) {
        throw new Error('Your institution account is inactive.');
      }
    }

    // Return mock JWT
    return { user, token: 'mock-jwt-token-' + Date.now() };
  }

  async registerInstitution(data: Omit<Institution, 'id' | 'status' | 'adminId'>): Promise<Institution> {
    const existing = this.institutions.find(i => i.officialEmail === data.officialEmail || i.domain === data.domain);
    if (existing) throw new Error('Institution with this email or domain already exists.');

    const newInst: Institution = {
      id: 'inst-' + Date.now(),
      ...data,
      status: InstitutionStatus.PENDING,
    };

    this.institutions.push(newInst);
    this.saveToStorage();
    return newInst;
  }

  // --- Super Admin Operations ---

  getInstitutions(): Institution[] {
    return this.institutions;
  }

  searchInstitutions(query: string): Institution[] {
    const lowerQuery = query.toLowerCase();
    return this.institutions.filter(inst =>
      inst.name.toLowerCase().includes(lowerQuery) ||
      inst.officialEmail.toLowerCase().includes(lowerQuery) ||
      inst.domain.toLowerCase().includes(lowerQuery) ||
      inst.status.toLowerCase().includes(lowerQuery)
    );
  }

  async approveInstitution(id: string, actingRole: UserRole): Promise<void> {
    this.requireRole(actingRole, [UserRole.SUPER_ADMIN]);
    
    const inst = this.institutions.find(i => i.id === id);
    if (!inst) throw new Error('Institution not found');
    if (inst.status === InstitutionStatus.APPROVED) return;

    const emailConflict = this.users.find(u => u.email === inst.officialEmail && u.institutionId !== inst.id);
    if (emailConflict) {
        throw new Error(`Cannot approve: Email ${inst.officialEmail} is already in use.`);
    }

    inst.status = InstitutionStatus.APPROVED;
    
    const adminPassword = 'Password@123';
    const adminUser: User = {
      id: 'u-admin-' + inst.id,
      email: inst.officialEmail,
      name: `${inst.name} Admin`,
      role: UserRole.INSTITUTION_ADMIN,
      institutionId: inst.id,
      password: adminPassword,
    };
    
    const existingAdmin = this.users.find(u => u.id === adminUser.id);
    if (!existingAdmin) {
        this.users.push(adminUser);
        inst.adminId = adminUser.id;
    } else {
        inst.adminId = existingAdmin.id;
    }

    this.saveToStorage();
  }

  async rejectInstitution(id: string, actingRole: UserRole): Promise<void> {
    this.requireRole(actingRole, [UserRole.SUPER_ADMIN]);
    
    const inst = this.institutions.find(i => i.id === id);
    if (!inst) throw new Error('Institution not found');
    inst.status = InstitutionStatus.REJECTED;
    this.saveToStorage();
  }

  // --- Content Management (Super Admin) ---
  getAllQuestions(): Question[] {
    return this.questions;
  }

  async addQuestion(q: Omit<Question, 'id'>, actingRole: UserRole): Promise<void> {
    this.requireRole(actingRole, [UserRole.SUPER_ADMIN]);
    const newQ: Question = { ...q, id: 'q-' + Date.now() };
    this.questions.push(newQ);
    this.saveToStorage();
  }

  async deleteQuestion(id: string, actingRole: UserRole): Promise<void> {
    this.requireRole(actingRole, [UserRole.SUPER_ADMIN]);
    this.questions = this.questions.filter(q => q.id !== id);
    this.saveToStorage();
  }

  getAllMaterials(): StudyMaterial[] {
    return this.materials;
  }

  async addMaterial(m: Omit<StudyMaterial, 'id'>, actingRole: UserRole): Promise<void> {
    this.requireRole(actingRole, [UserRole.SUPER_ADMIN]);
    const newM: StudyMaterial = { ...m, id: 'mat-' + Date.now() };
    this.materials.push(newM);
    this.saveToStorage();
  }
  
  async deleteMaterial(id: string, actingRole: UserRole): Promise<void> {
    this.requireRole(actingRole, [UserRole.SUPER_ADMIN]);
    this.materials = this.materials.filter(m => m.id !== id);
    this.saveToStorage();
  }

  // --- Institution Admin Operations ---

  getStudents(instId: string): User[] {
    return this.users.filter(u => u.role === UserRole.STUDENT && u.institutionId === instId);
  }

  async createStudent(instId: string, name: string, studentId: string, actingRole: UserRole): Promise<User> {
    this.requireRole(actingRole, [UserRole.INSTITUTION_ADMIN]);
    
    const inst = this.institutions.find(i => i.id === instId);
    if (!inst) throw new Error('Institution not found');

    const email = `${studentId}@${inst.domain}`;
    const existing = this.users.find(u => u.email === email);
    if (existing) throw new Error('Student with this ID already exists');

    const newUser: User = {
      id: 'u-stu-' + Date.now(),
      name,
      email,
      role: UserRole.STUDENT,
      institutionId: instId,
      password: 'Student@123', 
    };

    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  // --- Student Data Access ---
  getUniversities(): University[] {
    return this.universities;
  }
  
  getUniversity(id: string): University | undefined {
    return this.universities.find(u => u.id === id);
  }

  toggleUniversityLock(instId: string, univId: string, actingRole: UserRole) {
    this.requireRole(actingRole, [UserRole.INSTITUTION_ADMIN]);
    
    const univ = this.universities.find(u => u.id === univId);
    if (!univ) return;

    if (univ.unlockedForIds.includes(instId)) {
        univ.unlockedForIds = univ.unlockedForIds.filter(id => id !== instId);
    } else {
        univ.unlockedForIds.push(instId);
    }
    this.saveToStorage();
  }

  getCurriculumForUniversity(univId: string) {
    const items = [...this.questions, ...this.materials].filter(i => i.universityId === univId);
    const curriculum: Record<string, Record<string, { hasMaterial: boolean, hasQuestions: boolean, materialId?: string }>> = {};

    items.forEach(item => {
        if (!curriculum[item.subject]) curriculum[item.subject] = {};
        if (!curriculum[item.subject][item.topic]) {
            curriculum[item.subject][item.topic] = { hasMaterial: false, hasQuestions: false };
        }
        
        if ((item as StudyMaterial).content) {
            curriculum[item.subject][item.topic].hasMaterial = true;
            curriculum[item.subject][item.topic].materialId = item.id;
        } else {
            curriculum[item.subject][item.topic].hasQuestions = true;
        }
    });

    return curriculum;
  }

  getMaterial(id: string): StudyMaterial | undefined {
    return this.materials.find(m => m.id === id);
  }

  getQuestionsByTopic(univId: string, topic: string): Question[] {
    return this.questions.filter(q => q.universityId === univId && q.topic === topic);
  }

  // --- Learning & Attempts ---

  async recordAttempt(studentId: string, questionId: string, selectedOption: number, isCorrect: boolean, topic: string, actingRole: UserRole): Promise<void> {
    this.requireRole(actingRole, [UserRole.STUDENT]);
    
    this.attempts.push({
      id: 'att-' + Date.now(),
      studentId,
      questionId,
      selectedOption,
      isCorrect,
      timestamp: Date.now(),
      topic
    });
    this.saveToStorage();
  }

  getMistakes(studentId: string): { attempt: StudentAttempt, question: Question }[] {
    const studentAttempts = this.attempts.filter(a => a.studentId === studentId && !a.isCorrect);
    // Sort by most recent
    return studentAttempts
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(a => {
            const q = this.questions.find(q => q.id === a.questionId);
            return q ? { attempt: a, question: q } : null;
        })
        .filter(x => x !== null) as { attempt: StudentAttempt, question: Question }[];
  }

  getStudentStats(studentId: string) {
    const allAttempts = this.attempts.filter(a => a.studentId === studentId);
    const correctAttempts = allAttempts.filter(a => a.isCorrect);
    
    // Unique questions attempted
    const attemptedQIds = new Set(allAttempts.map(a => a.questionId));
    const masteredQIds = new Set(correctAttempts.map(a => a.questionId));

    return {
      totalQuestionsAttempted: attemptedQIds.size,
      totalQuestionsMastered: masteredQIds.size,
      accuracy: allAttempts.length > 0 ? Math.round((correctAttempts.length / allAttempts.length) * 100) : 0,
      totalMistakes: allAttempts.length - correctAttempts.length
    };
  }
}

export const db = new MockBackendService();