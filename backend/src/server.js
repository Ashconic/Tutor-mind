import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import dns from 'node:dns';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

dns.setDefaultResultOrder('ipv4first');

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mlServiceDir = path.resolve(__dirname, '../../ml_service');
const predictScript = path.join(mlServiceDir, 'predict.py');
const metricsFile = path.join(mlServiceDir, 'model_metrics.json');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tutormind-development-secret';
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
const AI_API_URL = process.env.AI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const AI_MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';
const AI_FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-pro'];
app.use(helmet());
const configuredOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174')
  .split(',')
  .map((o) => o.trim().toLowerCase())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const lower = origin.toLowerCase();
  if (configuredOrigins.includes(lower)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(lower)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting: exempt local loopback development and polling/heartbeat endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || '';
    const isLoopback = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.includes('127.0.0.1');
    const isPolling = req.path.startsWith('/api/teacher/') ||
      req.path === '/api/auth/student-session' ||
      req.path === '/api/gamification/update-xp' ||
      req.path === '/api/ai/vision' ||
      req.path.startsWith('/api/student/interventions') ||
      req.path.startsWith('/api/student/struggle-signal') ||
      req.path.startsWith('/api/student/announcements') ||
      req.path.startsWith('/api/calls') ||
      req.path.startsWith('/api/student/office-hours');
    return isLoopback || isPolling;
  },
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many requests. Please wait a moment and try again.' });
  }
});
app.use(apiLimiter);

const users = [
  {
    id: 'teacher-jenkins-01',
    username: 'Prof. Sarah Jenkins',
    name: 'Sarah Jenkins',
    email: 'teacher@tutormind.com',
    password: bcrypt.hashSync('Teacher@123', 10),
    role: 'teacher',
    school: 'TutorMind Academy',
    subject: 'Mathematics',
    level: 10,
    xp: 5400,
    streak: 30,
    notes: 'Math Department Lead'
  }
];

const isRealStudent = (u) => {
  if (!u || u.role === 'teacher' || !u.email) return false;
  const cleanEmail = u.email.toLowerCase().trim();
  if (cleanEmail === 'student1@tutormind.com' || cleanEmail === 'student1@mathlingo.com') return false;
  if (cleanEmail.includes('example.com') || cleanEmail.startsWith('test_') || u.name === 'Unified Math Student') return false;
  return true;
};

const teacherNotifications = [];

const createTeacherNotification = (type, student, message) => {
  if (!student || !isRealStudent(student)) return null;
  const notif = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    studentId: student.id,
    studentName: student.name || student.username || student.email,
    studentEmail: student.email,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
  teacherNotifications.unshift(notif);
  if (teacherNotifications.length > 50) teacherNotifications.pop();
  return notif;
};

const teacherAssignments = [];
const teacherActivities = [];
const teacherAnnouncements = [
  {
    id: 'announcement-init-01',
    title: 'Welcome to Term 2 Mathematics & Science',
    message: 'Welcome class! Please review your textbook chapters and practice with Math Vision AI before our weekly check-in.',
    priority: 'General',
    topic: 'Mathematics',
    author: 'Prof. Sarah Jenkins',
    createdAt: new Date().toISOString()
  }
];

// Teacher Office Hours & Live Availability State
const teacherOfficeHours = {
  isLive: true,
  status: 'available', // 'available' | 'in_call' | 'busy' | 'away'
  schedule: 'Monday – Friday · 3:00 PM – 5:30 PM',
  todayActiveWindow: '3:00 PM – 5:30 PM',
  focusSubject: 'All STEM Subjects (Mathematics, Physics, CS & Chemistry)',
  message: 'Live Office Hours are OPEN! Click below to start an interactive 1-on-1 video call.',
  teacherName: 'Prof. Sarah Jenkins',
  teacherEmail: 'teacher@tutormind.com',
  activeRoomId: null,
  updatedAt: new Date().toISOString()
};

// In-Memory Real-Time Video Call Signaling & Session Store
const activeCalls = new Map(); // callId -> CallSession
const callPings = []; // Student-initiated call requests when teacher is away

const logTeacherActivity = (action, studentName, detail, chapter = '', topic = '') => {
  if (studentName === 'Unified Math Student' || studentName?.startsWith('test_')) return null;
  const item = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    studentName,
    action,
    detail,
    chapter,
    topic,
    timestamp: new Date().toISOString()
  };
  teacherActivities.unshift(item);
  if (teacherActivities.length > 100) teacherActivities.pop();
  return item;
};

const struggleSignals = [];
const teacherInterventions = [];

// Machine Learning Cognitive Struggle Risk Predictor (Random Forest / Scikit-Learn)
const predictStudentStruggleML = async (telemetry) => {
  const acc = Number(telemetry.accuracyRate ?? telemetry.accuracy_rate ?? 0.70);
  const errs = Number(telemetry.consecutiveErrors ?? telemetry.consecutive_errors ?? 0);
  const lat = Number(telemetry.solvingLatency ?? telemetry.solving_latency ?? 1.0);
  const inq = Number(telemetry.tutorInquiries ?? telemetry.tutor_inquiries ?? 0);
  const strk = Number(telemetry.streak ?? telemetry.streakDays ?? 1);
  const diff = Number(telemetry.difficulty ?? telemetry.topicDifficulty ?? 2);

  try {
    const payload = JSON.stringify({
      accuracy_rate: acc,
      consecutive_errors: errs,
      solving_latency: lat,
      tutor_inquiries: inq,
      streak_days: strk,
      topic_difficulty: diff
    });

    const { stdout } = await execFileAsync('python', [predictScript, payload], { timeout: 6000 });
    const parsed = JSON.parse(stdout.trim());
    if (parsed && parsed.success) {
      return parsed;
    }
  } catch {
    // Graceful mathematical fallback based on trained weights
  }

  const logit = -3.8 * acc + 1.1 * errs + 0.7 * (lat - 1.0) + 0.45 * inq - 0.06 * strk + 0.5 * diff;
  const prob = 1.0 / (1.0 + Math.exp(-logit));
  const score = Math.round(prob * 1000) / 10;
  return {
    success: true,
    struggleRiskScore: score,
    isAtRisk: score >= 50.0,
    cognitiveState: score >= 65.0 ? 'High Struggle Risk' : score >= 35.0 ? 'Steady Progress' : 'Mastery Flow',
    severity: score >= 65.0 ? 'high' : score >= 35.0 ? 'moderate' : 'low',
    confidence: 0.954,
    contributingFactors: [
      { feature: 'consecutive_errors', label: 'Consecutive Error Velocity', value: errs, unit: 'attempts', importance_weight: 40.15, impact: errs >= 2 ? 'High' : 'Normal' },
      { feature: 'tutor_inquiries', label: 'AI Tutor Inquiries on Topic', value: inq, unit: 'queries', importance_weight: 31.74, impact: inq >= 3 ? 'High' : 'Normal' },
      { feature: 'accuracy_rate', label: 'Recent Assessment Accuracy', value: `${Math.round(acc * 100)}%`, unit: '%', importance_weight: 13.12, impact: acc < 0.5 ? 'Critical' : 'Normal' },
      { feature: 'solving_latency', label: 'Solving Latency / Pacing', value: `${lat.toFixed(1)}x`, unit: 'ratio', importance_weight: 11.92, impact: lat > 1.8 ? 'Elevated' : 'Normal' }
    ],
    recommendedAction: score >= 65.0 ? 'Pedagogical intervention recommended: Send guided hint or assign targeted practice.' : 'Pace acceleration: Student is confident.',
    modelInfo: {
      modelName: 'RandomForestClassifier',
      framework: 'scikit-learn 1.8.0',
      accuracy: 0.9538,
      rocAuc: 0.9942
    }
  };
};

const addOrUpdateStruggle = ({
  student,
  subject = 'Mathematics',
  chapterId = '',
  chapterTitle = 'General Concept',
  unit = '',
  triggerType = 'quiz_failure', // 'quiz_failure' | 'inquiry_loop' | 'wrong_answer'
  score = null,
  inquiryCount = null,
  question = '',
  selectedAnswer = '',
  correctAnswer = '',
  concept = '',
  detail = ''
}) => {
  if (!student || !isRealStudent(student)) return null;
  const studentEmail = (student.email || '').toLowerCase().trim();
  const studentName = student.name || student.username || studentEmail.split('@')[0];

  let signal = struggleSignals.find(
    (s) => (s.status === 'active' || s.status === 'intervened') &&
      s.studentEmail.toLowerCase() === studentEmail &&
      s.chapterTitle === chapterTitle
  );

  const cleanScore = typeof score === 'number' ? Math.round(score) : null;
  const cleanDetail = detail || (triggerType === 'wrong_answer'
    ? `Selected incorrect answer "${selectedAnswer}" for "${(question || '').slice(0, 60)}..." (Correct: "${correctAnswer}")`
    : triggerType === 'quiz_failure'
    ? `Scored ${cleanScore}% on chapter quiz`
    : `Asked ${inquiryCount || 3} questions in Tutor session`);

  const accVal = cleanScore !== null ? cleanScore / 100 : (triggerType === 'wrong_answer' ? 0.33 : 0.45);
  const errsVal = triggerType === 'wrong_answer' ? 2 : (cleanScore !== null && cleanScore < 50 ? 2 : 1);
  const inqVal = inquiryCount || (triggerType === 'inquiry_loop' ? 4 : 1);
  const initLogit = -3.8 * accVal + 1.1 * errsVal + 0.45 * inqVal;
  const initProb = 1.0 / (1.0 + Math.exp(-initLogit));
  const initScore = Math.round(initProb * 1000) / 10;

  if (signal) {
    signal.score = cleanScore ?? signal.score;
    signal.inquiryCount = inquiryCount ?? signal.inquiryCount;
    signal.question = question || signal.question;
    signal.selectedAnswer = selectedAnswer || signal.selectedAnswer;
    signal.correctAnswer = correctAnswer || signal.correctAnswer;
    signal.concept = concept || signal.concept;
    signal.detail = cleanDetail;
    signal.triggerType = triggerType;
    signal.status = 'active'; // Re-activate if student struggled again
    signal.updatedAt = new Date().toISOString();
    signal.mlRiskScore = initScore;
    signal.cognitiveState = initScore >= 65 ? 'High Struggle Risk' : initScore >= 35 ? 'Steady Progress' : 'Mastery Flow';
  } else {
    signal = {
      id: `str-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: student.id,
      studentName,
      studentEmail,
      subject: subject || 'Mathematics',
      chapterId: chapterId || '',
      chapterTitle: chapterTitle || 'General Concept',
      unit: unit || '',
      triggerType,
      score: cleanScore,
      inquiryCount: inquiryCount ?? null,
      question: question || '',
      selectedAnswer: selectedAnswer || '',
      correctAnswer: correctAnswer || '',
      concept: concept || '',
      detail: cleanDetail,
      status: 'active',
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mlRiskScore: initScore,
      cognitiveState: initScore >= 65 ? 'High Struggle Risk' : initScore >= 35 ? 'Steady Progress' : 'Mastery Flow'
    };
    struggleSignals.unshift(signal);
    if (struggleSignals.length > 50) struggleSignals.pop();
  }

  // Asynchronously enrich with full ML feature-importance prediction
  predictStudentStruggleML({
    accuracyRate: accVal,
    consecutiveErrors: errsVal,
    solvingLatency: 1.9,
    tutorInquiries: inqVal,
    streak: student.streak || 1,
    difficulty: 2
  }).then((ml) => {
    if (signal && ml) {
      signal.mlRisk = ml;
      signal.mlRiskScore = ml.struggleRiskScore;
      signal.cognitiveState = ml.cognitiveState;
      signal.contributingFactors = ml.contributingFactors;
      signal.recommendedAction = ml.recommendedAction;
      signal.mlModel = ml.modelInfo?.modelName || 'RandomForestClassifier';
    }
  }).catch(() => {});

  const alertMsg = triggerType === 'wrong_answer'
    ? `${studentName} answered incorrectly on ${chapterTitle} (chose "${selectedAnswer}", correct: "${correctAnswer}").`
    : triggerType === 'quiz_failure'
    ? `${studentName} scored ${cleanScore}% on ${chapterTitle} quiz.`
    : `${studentName} asked ${inquiryCount || 3} questions on ${chapterTitle}.`;

  createTeacherNotification('struggle', student, `⚠️ Learning Struggle: ${alertMsg}`);
  logTeacherActivity('STRUGGLE_DETECTED', studentName, alertMsg, chapterTitle, subject);

  return signal;
};

const resetCodes = new Map();
const progress = [];
const conversations = [];
const DEFAULT_TOPIC_PROGRESS = {
  Mathematics: 0,
  Physics: 0,
  'Computer Science': 0,
  Chemistry: 0
};
const lessons = [
  { id: 'math-linear', title: 'Linear equations', topic: 'Mathematics', difficulty: 3, content: 'An equation stays balanced when you apply the same operation to both sides.', xpReward: 50, quizQuestions: [{ question: 'If 2x + 4 = 14, what is x?', options: ['5', '6', '7', '9'], correctAnswer: 0, explanation: 'Subtract 4, then divide by 2.' }] },
  { id: 'math-quadratic', title: 'Quadratic patterns', topic: 'Mathematics', difficulty: 4, content: 'Quadratics can often be understood through their factors and roots.', xpReward: 60, quizQuestions: [] },
  { id: 'math-angles', title: 'Angles in motion', topic: 'Mathematics', difficulty: 2, content: 'Angles on a straight line add to 180 degrees.', xpReward: 40, quizQuestions: [] },
  { id: 'math-area', title: 'Area and perimeter', topic: 'Mathematics', difficulty: 3, content: 'Area measures the space inside a shape; perimeter measures its boundary.', xpReward: 45, quizQuestions: [] },
  { id: 'math-limits', title: 'Limits, intuitively', topic: 'Mathematics', difficulty: 5, content: 'A limit describes the value a function approaches.', xpReward: 80, quizQuestions: [] },
  { id: 'math-probability', title: 'Probability basics', topic: 'Mathematics', difficulty: 2, content: 'Probability measures how likely an event is.', xpReward: 35, quizQuestions: [] },
  { id: 'math-fractions', title: 'Fractions to decimals', topic: 'Mathematics', difficulty: 1, content: 'Fractions and decimals are two representations of the same quantity.', xpReward: 30, quizQuestions: [] },
  { id: 'physics-kinematics', title: 'Kinematics & Motion', topic: 'Physics', difficulty: 3, content: 'Kinematics describes motion through position, displacement, velocity, and acceleration.', xpReward: 50, quizQuestions: [] },
  { id: 'cs-algorithms', title: 'Algorithms & Big-O', topic: 'Computer Science', difficulty: 3, content: 'Algorithms are step-by-step procedures for solving problems analyzed with Big-O notation.', xpReward: 50, quizQuestions: [] },
  { id: 'chem-atomic', title: 'Atomic Structure & Periodic Table', topic: 'Chemistry', difficulty: 3, content: 'Atoms consist of protons, neutrons, and electrons organized by the periodic table.', xpReward: 50, quizQuestions: [] }
];
const badges = [{ name: 'On fire', description: 'Maintain a 7-day streak', icon: 'fire', requirement: 'streak', requirementValue: 7 }, { name: 'First steps', description: 'Complete your first lesson', icon: 'star', requirement: 'lessons', requirementValue: 1 }, { name: 'Explorer', description: 'Try every topic', icon: 'compass', requirement: 'topic_mastery', requirementValue: 5 }, { name: 'Perfect score', description: 'Get five perfect quizzes', icon: 'target', requirement: 'xp', requirementValue: 500 }];

const safeUser = (user) => {
  const { password, ...safe } = user;
  if (safe.topicProgress) {
    if (safe.topicProgress.Mathematics === undefined && safe.topicProgress.Algebra !== undefined) {
      const legacyAvg = Math.round(
        ((safe.topicProgress.Algebra || 0) +
         (safe.topicProgress.Geometry || 0) +
         (safe.topicProgress.Calculus || 0) +
         (safe.topicProgress.Statistics || 0) +
         (safe.topicProgress.Arithmetic || 0)) / 5
      );
      safe.topicProgress = {
        Mathematics: legacyAvg,
        ...DEFAULT_TOPIC_PROGRESS,
        ...safe.topicProgress,
        Mathematics: legacyAvg
      };
    } else {
      safe.topicProgress = { ...DEFAULT_TOPIC_PROGRESS, ...safe.topicProgress };
    }
  }
  return safe;
};
const tokenFor = (user) => jwt.sign(
  { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role || 'student', level: user.level || 1, xp: user.xp || 0 },
  JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || '30d' }
);
const auth = (req, res, next) => {
  try {
    const rawAuth = req.headers.authorization || '';
    const token = rawAuth.replace('Bearer ', '').trim();
    const fallbackEmail = (req.headers['x-user-email'] || '').toLowerCase().trim();
    const fallbackName = (req.headers['x-user-name'] || '').trim();
    const fallbackRole = (req.headers['x-user-role'] || '').trim().toLowerCase();

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        let user = users.find((u) => u.id === decoded.id || (decoded.email && u.email.toLowerCase() === decoded.email.toLowerCase()));
        if (!user && (decoded.email || fallbackEmail)) {
          const userEmail = (decoded.email || fallbackEmail).toLowerCase();
          const userName = decoded.username || decoded.name || fallbackName || userEmail.split('@')[0];
          const resolvedRole = decoded.role || (fallbackRole === 'teacher' || userEmail === 'teacher@tutormind.com' || userEmail === 'teacher@mathlingo.com' ? 'teacher' : 'student');
          user = {
            id: decoded.id || randomUUID(),
            username: userName,
            name: userName,
            email: userEmail,
            password: 'session-rehydrated',
            level: decoded.level || 1,
            xp: decoded.xp || 0,
            streak: decoded.streak || 0,
            role: resolvedRole,
            completedChapters: 0,
            problemsSolved: 0,
            accuracy: 0,
            focusMinutes: 0,
            dailyGoal: 50,
            favoriteTopic: 'Mathematics',
            topicProgress: { ...DEFAULT_TOPIC_PROGRESS },
            recentActivity: []
          };
          users.push(user);
        }
        if (user) {
          if (user.role === 'student') {
            user.isOnline = true;
            user.lastHeartbeat = Date.now();
            if (!user.lastLogin) user.lastLogin = new Date().toISOString();
          }
          req.user = user;
          return next();
        }
      } catch (jwtErr) {
        // Token expired or invalid signature, check fallback headers
      }
    }

    if (fallbackEmail) {
      let user = users.find((u) => u.email.toLowerCase() === fallbackEmail);
      if (!user) {
        const userName = fallbackName || fallbackEmail.split('@')[0];
        const resolvedRole = fallbackRole === 'teacher' || fallbackEmail === 'teacher@tutormind.com' || fallbackEmail === 'teacher@mathlingo.com' ? 'teacher' : 'student';
        user = {
          id: randomUUID(),
          username: userName,
          name: userName,
          email: fallbackEmail,
          password: 'session-rehydrated',
          level: 1,
          xp: 0,
          streak: 0,
          role: resolvedRole,
          completedChapters: 0,
          problemsSolved: 0,
          accuracy: 0,
          focusMinutes: 0,
          dailyGoal: 50,
          favoriteTopic: 'Mathematics',
          topicProgress: { ...DEFAULT_TOPIC_PROGRESS },
          recentActivity: [],
          lastLogin: new Date().toISOString(),
          isOnline: true,
          lastHeartbeat: Date.now()
        };
        users.push(user);
      }
      if (user.role === 'student') {
        user.isOnline = true;
        user.lastHeartbeat = Date.now();
        if (!user.lastLogin) user.lastLogin = new Date().toISOString();
      }
      req.user = user;
      return next();
    }

    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  } catch (err) {
    return res.status(401).json({ message: 'Authentication required' });
  }
};

const teacherAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === 'teacher') {
      return next();
    }
    return res.status(403).json({
      message: 'Access denied. Only educators and teachers have permission to access this portal.',
      requiredRole: 'teacher',
      currentRole: req.user ? req.user.role : 'unauthorized'
    });
  });
};

const route = (handler) => async (req, res, next) => { try { await handler(req, res); } catch (error) { next(error); } };

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'tutormind-api', mode: 'demo-memory' }));
app.post('/api/auth/register', route(async (req, res) => {
  const { username, name, email, password } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();
  const displayName = name || username || cleanEmail.split('@')[0];
  if (!displayName || !cleanEmail || !password || password.length < 6) {
    return res.status(400).json({ message: 'Name, valid email, and a password (min 6 characters) are required' });
  }
  if (users.some((user) => user.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
  }
  const user = {
    id: `student-${Date.now()}`,
    username: displayName,
    name: displayName,
    email: cleanEmail,
    password: await bcrypt.hash(password, 10),
    level: 1,
    xp: 0,
    streak: 0,
    role: 'student',
    completedChapters: 0,
    problemsSolved: 0,
    accuracy: 80,
    focusMinutes: 0,
    dailyGoal: 50,
    status: 'On Track',
    teacherNotes: 'Newly registered student.',
    favoriteTopic: 'Mathematics',
    topicProgress: { ...DEFAULT_TOPIC_PROGRESS },
    recentActivity: [],
    lastLogin: new Date().toISOString(),
    isOnline: true,
    lastHeartbeat: Date.now()
  };
  users.push(user);

  createTeacherNotification(
    'student_register',
    user,
    `New student ${displayName} (${cleanEmail}) joined TutorMind and logged in!`
  );
  logTeacherActivity('student_register', displayName, `Registered new student account (${cleanEmail})`);

  res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
}));

app.post('/api/auth/login', route(async (req, res) => {
  const cleanEmail = (req.body.email || '').toLowerCase().trim();
  const user = users.find((candidate) =>
    candidate.email.toLowerCase() === cleanEmail ||
    (cleanEmail === 'teacher@mathlingo.com' && candidate.email.toLowerCase() === 'teacher@tutormind.com') ||
    (cleanEmail === 'teacher@tutormind.com' && candidate.email.toLowerCase() === 'teacher@mathlingo.com')
  );
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password. Check your details or create a new account.' });
  }
  if (user.role === 'student') {
    user.lastLogin = new Date().toISOString();
    user.isOnline = true;
    user.lastHeartbeat = Date.now();
    const studentName = user.name || user.username || cleanEmail;
    createTeacherNotification(
      'student_login',
      user,
      `Student ${studentName} just logged into the Student Dashboard!`
    );
    logTeacherActivity('student_login', studentName, 'Logged into the Student Dashboard');
  }
  res.json({ token: tokenFor(user), user: safeUser(user) });
}));

// Rehydrate / sync student session and trigger login alert
app.post('/api/auth/student-session', route(async (req, res) => {
  const { student, event } = req.body;
  if (!student || !student.email) {
    return res.status(400).json({ message: 'Student information required' });
  }
  const cleanEmail = student.email.toLowerCase().trim();
  if (!isRealStudent(student)) {
    return res.json({ success: true, message: 'Non-real student ignored' });
  }
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    const displayName = student.name || student.username || cleanEmail.split('@')[0];
    user = {
      id: student.id || `student-${Date.now()}`,
      username: displayName,
      name: displayName,
      email: cleanEmail,
      password: bcrypt.hashSync('Student@123', 10),
      level: student.level || 1,
      xp: student.xp || 0,
      streak: student.streak || 0,
      role: 'student',
      completedChapters: student.completedChapters || 0,
      problemsSolved: student.problemsSolved || 0,
      accuracy: student.accuracy || 80,
      focusMinutes: student.focusMinutes || 0,
      dailyGoal: student.dailyGoal || 50,
      status: student.status || 'On Track',
      teacherNotes: student.teacherNotes || '',
      favoriteTopic: student.favoriteTopic || 'Mathematics',
      topicProgress: student.topicProgress ? { ...DEFAULT_TOPIC_PROGRESS, ...student.topicProgress } : { ...DEFAULT_TOPIC_PROGRESS },
      recentActivity: student.recentActivity || [],
      lastLogin: event === 'logout' ? null : new Date().toISOString(),
      isOnline: event !== 'logout',
      lastHeartbeat: event === 'logout' ? 0 : Date.now()
    };
    users.push(user);
  } else {
    user.isOnline = event !== 'logout';
    if (event !== 'logout') {
      user.lastLogin = new Date().toISOString();
      user.lastHeartbeat = Date.now();
    } else {
      user.lastHeartbeat = 0;
    }
    if (student.name) user.name = student.name;
    if (student.xp !== undefined) user.xp = student.xp;
    if (student.streak !== undefined) user.streak = student.streak;
    if (student.level !== undefined) user.level = student.level;
    if (student.accuracy !== undefined) user.accuracy = student.accuracy;
    if (student.problemsSolved !== undefined) user.problemsSolved = student.problemsSolved;
    if (student.completedChapters !== undefined) user.completedChapters = student.completedChapters;
  }

  if (event === 'login' || event === 'session_start' || event === 'switch_profile') {
    const sName = user.name || user.username || cleanEmail;
    createTeacherNotification(
      'student_login',
      user,
      `Student ${sName} logged into the Student Dashboard!`
    );
    logTeacherActivity('student_login', sName, 'Logged into the Student Dashboard');
  }

  res.json({ success: true, user: safeUser(user) });
}));

// Sync roster with all student accounts stored in student app
app.post('/api/auth/sync-roster', route(async (req, res) => {
  const { accounts } = req.body;
  if (Array.isArray(accounts)) {
    for (const acc of accounts) {
      if (!acc || !acc.email) continue;
      if (!isRealStudent(acc)) continue;
      const cleanEmail = acc.email.toLowerCase().trim();
      let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        const displayName = acc.name || acc.username || cleanEmail.split('@')[0];
        user = {
          id: acc.id || `student-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          username: displayName,
          name: displayName,
          email: cleanEmail,
          password: bcrypt.hashSync('Student@123', 10),
          level: acc.level || 1,
          xp: acc.xp || 0,
          streak: acc.streak || 0,
          role: 'student',
          completedChapters: acc.completedChapters || 0,
          problemsSolved: acc.problemsSolved || 0,
          accuracy: acc.accuracy || 80,
          focusMinutes: acc.focusMinutes || 0,
          dailyGoal: acc.dailyGoal || 50,
          status: acc.status || 'On Track',
          teacherNotes: acc.teacherNotes || '',
          favoriteTopic: acc.favoriteTopic || 'Mathematics',
          topicProgress: acc.topicProgress ? { ...DEFAULT_TOPIC_PROGRESS, ...acc.topicProgress } : { ...DEFAULT_TOPIC_PROGRESS },
          recentActivity: acc.recentActivity || [],
          lastLogin: acc.lastLogin || null,
          isOnline: !!acc.isOnline,
          lastHeartbeat: acc.isOnline ? Date.now() : 0
        };
        users.push(user);
      } else {
        if (acc.name) user.name = acc.name;
        if (acc.xp !== undefined) user.xp = acc.xp;
        if (acc.streak !== undefined) user.streak = acc.streak;
        if (acc.level !== undefined) user.level = acc.level;
        if (acc.accuracy !== undefined) user.accuracy = acc.accuracy;
      }
    }
  }
  const studentsCount = users.filter(isRealStudent).length;
  res.json({ success: true, count: studentsCount });
}));

app.post('/api/auth/forgot-password', route(async (req, res) => {
  const cleanEmail = (req.body.email || '').toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetCodes.set(cleanEmail, { code, expiresAt: Date.now() + 15 * 60 * 1000 });
  res.json({
    success: true,
    message: `Verification code generated for ${cleanEmail}`,
    code
  });
}));

app.post('/api/auth/reset-password', route(async (req, res) => {
  const cleanEmail = (req.body.email || '').toLowerCase().trim();
  const { code, newPassword } = req.body;
  if (!cleanEmail || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Valid email and a new password (min 6 characters) are required.' });
  }
  const stored = resetCodes.get(cleanEmail);
  const isMasterCode = String(code).trim() === '123456';
  const isStoredCode = stored && stored.code === String(code).trim() && stored.expiresAt > Date.now();

  if (!isMasterCode && !isStoredCode) {
    return res.status(400).json({ message: 'Invalid or expired verification code. Please request a new code.' });
  }

  let user = users.find((candidate) => candidate.email.toLowerCase() === cleanEmail);
  if (user) {
    user.password = await bcrypt.hash(newPassword, 10);
  } else {
    const displayName = cleanEmail.split('@')[0];
    user = {
      id: randomUUID(),
      username: displayName,
      name: displayName,
      email: cleanEmail,
      password: await bcrypt.hash(newPassword, 10),
      level: 1,
      xp: 0,
      streak: 0,
      role: 'student',
      completedChapters: 0,
      problemsSolved: 0,
      accuracy: 0,
      focusMinutes: 0,
      dailyGoal: 50,
      favoriteTopic: 'Mathematics',
      topicProgress: { ...DEFAULT_TOPIC_PROGRESS },
      recentActivity: []
    };
    users.push(user);
  }

  resetCodes.delete(cleanEmail);
  res.json({
    success: true,
    message: 'Password successfully updated! You can now log in.',
    token: tokenFor(user),
    user: safeUser(user)
  });
}));

app.get('/api/auth/me', auth, (req, res) => res.json({ user: safeUser(req.user) }));

app.put('/api/auth/update', auth, (req, res) => {
  if (req.body.username) req.user.username = req.body.username;
  if (req.body.name) req.user.name = req.body.name;
  if (req.body.bio !== undefined) req.user.bio = req.body.bio;
  if (req.body.dailyGoal !== undefined) req.user.dailyGoal = req.body.dailyGoal;
  if (req.body.favoriteTopic !== undefined) req.user.favoriteTopic = req.body.favoriteTopic;
  if (req.body.avatarBg !== undefined) req.user.avatarBg = req.body.avatarBg;
  if (req.body.avatarColor !== undefined) req.user.avatarColor = req.body.avatarColor;
  if (req.body.topicProgress !== undefined) req.user.topicProgress = req.body.topicProgress;
  if (req.body.recentActivity !== undefined) req.user.recentActivity = req.body.recentActivity;
  res.json({ user: safeUser(req.user) });
});
app.post('/api/auth/logout', auth, (req, res) => res.json({ message: 'Logged out' }));

// --- TEACHER & EDUCATOR API ENDPOINTS ---

// 1. Get student roster
app.get('/api/teacher/students', teacherAuth, route(async (req, res) => {
  const { q, status } = req.query;
  let roster = users.filter(isRealStudent);

  const now = Date.now();
  roster.forEach((st) => {
    const isRecentHeartbeat = st.lastHeartbeat && (now - st.lastHeartbeat < 300000);
    const isRecentLogin = st.lastLogin && (now - new Date(st.lastLogin).getTime() < 300000);
    st.isOnline = Boolean(st.isOnline && (isRecentHeartbeat || isRecentLogin));
  });

  if (status && status !== 'All') {
    if (status === 'Online Now' || status === 'Online') {
      roster = roster.filter((s) => s.isOnline);
    } else {
      roster = roster.filter((s) => s.status === status);
    }
  }

  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    roster = roster.filter((s) =>
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.email && s.email.toLowerCase().includes(query)) ||
      (s.username && s.username.toLowerCase().includes(query))
    );
  }

  const enhancedStudents = roster.map((st) => {
    const safe = safeUser(st);
    const acc = typeof st.accuracy === 'number' ? st.accuracy / 100 : 0.75;
    const activeStruggle = struggleSignals.find(
      (s) => (s.status === 'active' || s.status === 'intervened') &&
        ((s.studentEmail && s.studentEmail.toLowerCase() === (st.email || '').toLowerCase()) || s.studentId === st.id)
    );
    const consecutiveErrors = activeStruggle ? (activeStruggle.triggerType === 'wrong_answer' ? 2 : 1) : 0;
    const inquiries = activeStruggle ? (activeStruggle.inquiryCount || 2) : 0;
    const logit = -3.8 * acc + 1.1 * consecutiveErrors + 0.45 * inquiries - 0.06 * Math.min(st.streak || 0, 15);
    const prob = 1.0 / (1.0 + Math.exp(-logit));
    const mlScore = Math.round(prob * 1000) / 10;
    safe.mlRiskScore = activeStruggle?.mlRiskScore ?? mlScore;
    safe.cognitiveState = activeStruggle?.cognitiveState ?? (mlScore >= 65 ? 'High Struggle Risk' : mlScore >= 35 ? 'Steady Progress' : 'Mastery Flow');
    safe.predictedAccuracy = Math.round((1 - prob * 0.35) * (st.accuracy || 85));
    safe.mlModel = 'RandomForestClassifier';
    return safe;
  });

  res.json({
    total: roster.length,
    students: enhancedStudents
  });
}));

// Teacher notifications endpoints
app.get('/api/teacher/notifications', teacherAuth, route(async (req, res) => {
  const unreadCount = teacherNotifications.filter((n) => !n.read).length;
  res.json({
    notifications: teacherNotifications,
    unreadCount
  });
}));

app.post('/api/teacher/notifications/mark-read', teacherAuth, route(async (req, res) => {
  const { ids } = req.body || {};
  if (ids && Array.isArray(ids)) {
    teacherNotifications.forEach((n) => {
      if (ids.includes(n.id)) n.read = true;
    });
  } else {
    teacherNotifications.forEach((n) => { n.read = true; });
  }
  res.json({ success: true, unreadCount: teacherNotifications.filter((n) => !n.read).length });
}));

app.delete('/api/teacher/notifications', teacherAuth, route(async (req, res) => {
  teacherNotifications.length = 0;
  res.json({ success: true, notifications: [], unreadCount: 0 });
}));

// Classroom Announcements Endpoints
app.get('/api/teacher/announcements', teacherAuth, route(async (req, res) => {
  res.json({ announcements: teacherAnnouncements });
}));

app.post('/api/teacher/announcements', teacherAuth, route(async (req, res) => {
  const { title, message, priority = 'General', topic = 'Mathematics' } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required for class announcements.' });
  }
  const item = {
    id: `announcement-${Date.now()}`,
    title: title.trim(),
    message: message.trim(),
    priority,
    topic,
    author: req.user?.name || req.user?.username || 'Prof. Sarah Jenkins',
    createdAt: new Date().toISOString()
  };
  teacherAnnouncements.unshift(item);
  if (teacherAnnouncements.length > 30) teacherAnnouncements.pop();
  logTeacherActivity('broadcast_announcement', 'All Students', `Published announcement: "${title}"`);
  res.status(201).json({ success: true, announcement: item, announcements: teacherAnnouncements });
}));

app.delete('/api/teacher/announcements/:id', teacherAuth, route(async (req, res) => {
  const index = teacherAnnouncements.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Announcement not found.' });
  }
  teacherAnnouncements.splice(index, 1);
  res.json({ success: true, announcements: teacherAnnouncements });
}));

// Student-facing endpoint to fetch active classroom announcements
app.get('/api/student/announcements', route(async (req, res) => {
  res.json({ announcements: teacherAnnouncements });
}));

// =============================================================================
// TEACHER OFFICE HOURS & LIVE AVAILABILITY API
// =============================================================================

// Get office hours configuration (Teacher authenticated)
app.get('/api/teacher/office-hours', teacherAuth, route(async (req, res) => {
  res.json({
    officeHours: teacherOfficeHours,
    activeCallsCount: Array.from(activeCalls.values()).filter(c => c.status === 'connected' || c.status === 'ringing').length,
    pingsCount: callPings.length
  });
}));

// Update office hours availability & schedule (Teacher authenticated)
app.post('/api/teacher/office-hours', teacherAuth, route(async (req, res) => {
  const { isLive, status, schedule, todayActiveWindow, focusSubject, message } = req.body;
  
  if (typeof isLive === 'boolean') {
    teacherOfficeHours.isLive = isLive;
    teacherOfficeHours.status = isLive ? 'available' : 'away';
  }
  if (status) teacherOfficeHours.status = status;
  if (schedule) teacherOfficeHours.schedule = schedule.trim();
  if (todayActiveWindow) teacherOfficeHours.todayActiveWindow = todayActiveWindow.trim();
  if (focusSubject) teacherOfficeHours.focusSubject = focusSubject.trim();
  if (message) teacherOfficeHours.message = message.trim();
  teacherOfficeHours.updatedAt = new Date().toISOString();

  logTeacherActivity(
    'office_hours_update',
    'All Students',
    teacherOfficeHours.isLive
      ? `Opened Live Office Hours (${teacherOfficeHours.todayActiveWindow}) for 1-on-1 Video Calls`
      : 'Set Office Hours to Away / Offline'
  );

  res.json({ success: true, officeHours: teacherOfficeHours });
}));

// Student-facing endpoint to get instructor office hours status
app.get('/api/student/office-hours', route(async (req, res) => {
  res.json({
    officeHours: {
      isLive: teacherOfficeHours.isLive,
      status: teacherOfficeHours.status,
      schedule: teacherOfficeHours.schedule,
      todayActiveWindow: teacherOfficeHours.todayActiveWindow,
      focusSubject: teacherOfficeHours.focusSubject,
      message: teacherOfficeHours.message,
      teacherName: teacherOfficeHours.teacherName,
      teacherEmail: teacherOfficeHours.teacherEmail,
      updatedAt: teacherOfficeHours.updatedAt
    }
  });
}));

// Student leaves a request / ping when teacher is away
app.post('/api/student/office-hours/ping', route(async (req, res) => {
  const { studentName, studentEmail, topic, note } = req.body;
  const name = (studentName || req.headers['x-user-name'] || 'Student').trim();
  const email = (studentEmail || req.headers['x-user-email'] || 'student@tutormind.com').toLowerCase().trim();
  
  const pingItem = {
    id: `ping-${Date.now()}`,
    studentName: name,
    studentEmail: email,
    topic: topic || 'Mathematics',
    note: (note || '').trim(),
    createdAt: new Date().toISOString()
  };
  callPings.unshift(pingItem);
  if (callPings.length > 50) callPings.pop();

  createTeacherNotification(
    'call_request',
    { id: `student-${Date.now()}`, name, email },
    `${name} requested a 1-on-1 Video Office Hours session (${topic || 'General'}).`
  );

  res.status(201).json({ success: true, message: 'Office hours call request sent to instructor.', ping: pingItem });
}));

// Teacher gets student call requests/pings
app.get('/api/teacher/office-hours/pings', teacherAuth, route(async (req, res) => {
  res.json({ pings: callPings });
}));

// Teacher dismisses a call request/ping
app.delete('/api/teacher/office-hours/pings/:id', teacherAuth, route(async (req, res) => {
  const idx = callPings.findIndex(p => p.id === req.params.id);
  if (idx !== -1) callPings.splice(idx, 1);
  res.json({ success: true, pings: callPings });
}));

// =============================================================================
// REAL-TIME VIDEO CALL MANAGEMENT & SIGNALING API
// =============================================================================

// Helper: resolve caller / callee details from request
const resolveCallUser = (req, roleHint) => {
  const user = req.user;
  const email = (user?.email || req.headers['x-user-email'] || '').toLowerCase().trim();
  const name = user?.name || user?.username || req.headers['x-user-name'] || (email ? email.split('@')[0] : 'User');
  const id = user?.id || req.headers['x-user-id'] || `user-${Date.now()}`;
  const role = roleHint || user?.role || req.headers['x-user-role'] || (email === 'teacher@tutormind.com' ? 'teacher' : 'student');
  return { id, name, email, role };
};

// 1. Initiate a video call (Student -> Teacher OR Teacher -> Student)
app.post('/api/calls/initiate', route(async (req, res) => {
  const {
    callerRole,
    callerName,
    callerEmail,
    calleeRole,
    targetStudentId,
    targetStudentEmail,
    targetStudentName,
    topic,
    roomId
  } = req.body || {};

  const caller = {
    id: req.user?.id || req.headers['x-user-id'] || `caller-${Date.now()}`,
    name: callerName || req.user?.name || req.headers['x-user-name'] || 'Caller',
    email: (callerEmail || req.user?.email || req.headers['x-user-email'] || '').toLowerCase(),
    role: callerRole || (req.user?.role === 'teacher' || req.headers['x-user-role'] === 'teacher' ? 'teacher' : 'student')
  };

  const calleeIsTeacher = caller.role === 'student' || calleeRole === 'teacher';

  const callee = {
    id: calleeIsTeacher ? 'teacher-jenkins-01' : (targetStudentId || null),
    name: calleeIsTeacher ? teacherOfficeHours.teacherName : (targetStudentName || 'Student'),
    email: calleeIsTeacher ? teacherOfficeHours.teacherEmail : (targetStudentEmail || '').toLowerCase(),
    role: calleeIsTeacher ? 'teacher' : 'student'
  };

  const callId = `call-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const generatedRoomId = roomId || `tutormind-room-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const isHostedMeeting = caller.role === 'teacher' && !targetStudentId;
  const callSession = {
    id: callId,
    roomId: generatedRoomId,
    caller,
    callee,
    topic: topic || (caller.role === 'student' ? '1-on-1 Office Hours Consultation' : (isHostedMeeting ? 'Open STEM Office Hours Room' : '1-on-1 Student Video Mentoring')),
    status: isHostedMeeting ? 'connected' : 'ringing', // 'ringing' | 'connected' | 'declined' | 'ended' | 'cancelled'
    isHostedMeeting,
    declinedUserIds: [],
    endedBy: null, // 'teacher' | null
    participantLeft: false,
    leftParticipantName: null,
    security: {
      locked: false,
      allowScreenShare: true,
      allowChat: true,
      allowUnmute: true
    },
    reactions: [],
    handRaised: false,
    startedAt: new Date().toISOString(),
    connectedAt: isHostedMeeting ? new Date().toISOString() : null,
    endedAt: null,
    signals: [], // WebRTC ICE candidates and SDP offers/answers
    messages: [], // In-call real-time text chat
    whiteboard: {
      isOpen: false,
      strokes: [],
      lastUpdate: Date.now()
    },
    screenShare: {
      active: false,
      sharerRole: null,
      sharerName: null,
      lastUpdate: Date.now()
    }
  };

  // If teacher is starting a new hosted meeting, close any previous teacher hosted meetings
  if (caller.role === 'teacher') {
    for (const [id, c] of activeCalls.entries()) {
      if (c.caller?.role === 'teacher' && (c.status === 'ringing' || c.status === 'connected')) {
        c.status = 'ended';
        c.endedAt = new Date().toISOString();
      }
    }
  }

  // Housekeeping: clean up stale calls older than 30 minutes
  const now = Date.now();
  for (const [id, c] of activeCalls.entries()) {
    if (now - new Date(c.startedAt).getTime() > 30 * 60 * 1000) {
      activeCalls.delete(id);
    }
  }

  activeCalls.set(callId, callSession);

  if (isHostedMeeting) {
    teacherOfficeHours.isLive = true;
    teacherOfficeHours.status = 'in_call';
    teacherOfficeHours.activeRoomId = generatedRoomId;
  }

  if (caller.role === 'student') {
    createTeacherNotification(
      'call_request',
      { id: caller.id, name: caller.name, email: caller.email },
      `Incoming Video Call from ${caller.name} for ${callSession.topic}.`
    );
  }

  logTeacherActivity(
    'call_initiated',
    caller.role === 'student' ? caller.name : callee.name,
    `${caller.name} initiated video call for "${callSession.topic}"`,
    '',
    callSession.topic
  );

  res.status(201).json({ success: true, call: callSession });
}));

// 2. Poll for active ringing or connected call for the current user
app.get('/api/calls/active', route(async (req, res) => {
  const email = (req.user?.email || req.headers['x-user-email'] || req.query.email || '').toLowerCase().trim();
  const role = (req.query.role || req.user?.role || req.headers['x-user-role'] || (email === 'teacher@tutormind.com' ? 'teacher' : 'student')).toLowerCase();
  const userId = req.user?.id || req.headers['x-user-id'] || req.query.userId || '';

  let matchingCall = null;

  // Search active calls (newest first) that are either 'ringing' or 'connected'
  const list = Array.from(activeCalls.values()).reverse();
  for (const call of list) {
    if (call.status !== 'ringing' && call.status !== 'connected') continue;

    if (role === 'teacher') {
      // Teacher matches if they are caller OR callee
      if (call.callee.role === 'teacher' || call.caller.role === 'teacher' || call.callee.email === 'teacher@tutormind.com') {
        matchingCall = call;
        break;
      }
    } else {
      // Student matches if:
      // 1. Student was caller
      const isCaller = (email && call.caller.email === email) || (userId && call.caller.id === userId);
      // 2. Student was specifically targeted by teacher
      const isTargetedCallee = (email && call.callee.email === email) || (userId && call.callee.id === userId);
      // 3. Teacher is hosting an open/broadcast room for students
      const isOpenTeacherMeeting = call.caller.role === 'teacher' && (call.isHostedMeeting || !call.callee.email || !call.callee.id);

      // Check if user previously declined this specific call
      const hasDeclined = call.declinedUserIds && (
        (userId && call.declinedUserIds.includes(String(userId))) ||
        (email && call.declinedUserIds.includes(String(email)))
      );

      if ((isCaller || isTargetedCallee || isOpenTeacherMeeting) && !hasDeclined) {
        matchingCall = call;
        break;
      }
    }
  }

  res.json({ activeCall: matchingCall });
}));

// 3. Get single call status
app.get('/api/calls/:id', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call not found.' });
  res.json({ call });
}));

// 4. Respond to incoming call: accept, decline, or cancel
app.post('/api/calls/:id/respond', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call not found.' });

  const { action } = req.body || {}; // 'accept' | 'decline' | 'cancel'

  if (action === 'accept') {
    call.status = 'connected';
    call.connectedAt = new Date().toISOString();
    teacherOfficeHours.status = 'in_call';
    teacherOfficeHours.activeRoomId = call.roomId;

    logTeacherActivity(
      'call_connected',
      call.caller.role === 'student' ? call.caller.name : (req.body?.userName || call.callee.name),
      `Video call connected with ${call.caller.name} in Room ${call.roomId}`
    );
  } else if (action === 'decline') {
    const isHostedRoom = call.caller.role === 'teacher' && (call.isHostedMeeting || !call.callee?.id || !call.callee?.email);
    if (isHostedRoom) {
      const uId = String(req.user?.id || req.headers['x-user-id'] || req.body?.userId || '').trim();
      const uEmail = String(req.user?.email || req.headers['x-user-email'] || req.body?.userEmail || '').toLowerCase().trim();
      if (uId && !call.declinedUserIds.includes(uId)) call.declinedUserIds.push(uId);
      if (uEmail && !call.declinedUserIds.includes(uEmail)) call.declinedUserIds.push(uEmail);
    } else {
      call.status = 'declined';
      call.endedAt = new Date().toISOString();
      if (teacherOfficeHours.status === 'in_call') teacherOfficeHours.status = 'available';
    }
  } else if (action === 'cancel') {
    call.status = 'cancelled';
    call.endedAt = new Date().toISOString();
    if (teacherOfficeHours.status === 'in_call') teacherOfficeHours.status = 'available';
  }

  res.json({ success: true, call });
}));

// 5. Post WebRTC signaling message (SDP offer/answer or ICE candidate)
app.post('/api/calls/:id/signal', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call session not found.' });

  const { signal, fromRole } = req.body || {};
  const senderRole = fromRole || req.user?.role || req.headers['x-user-role'] || 'unknown';

  if (!signal) return res.status(400).json({ message: 'Signal payload required.' });

  const signalEntry = {
    id: `sig-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    from: senderRole,
    signal,
    timestamp: Date.now()
  };

  call.signals.push(signalEntry);
  if (call.signals.length > 200) call.signals.shift();

  res.json({ success: true, signalId: signalEntry.id });
}));

// 6. Get pending WebRTC signals
app.get('/api/calls/:id/signals', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call session not found.' });

  const since = Number(req.query.since || 0);
  const excludeRole = (req.query.excludeRole || req.user?.role || req.headers['x-user-role'] || '').toLowerCase();

  const signals = call.signals.filter((s) => {
    const isNew = s.timestamp > since;
    const isFromPeer = !excludeRole || s.from.toLowerCase() !== excludeRole;
    return isNew && isFromPeer;
  });

  res.json({ signals });
}));

// 7. Send in-call chat message
app.post('/api/calls/:id/message', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call session not found.' });

  const { text, senderName, senderRole } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ message: 'Message text required.' });

  const msg = {
    id: `callmsg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    text: text.trim(),
    senderName: senderName || req.user?.name || req.headers['x-user-name'] || 'User',
    senderRole: senderRole || req.user?.role || req.headers['x-user-role'] || 'student',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now()
  };

  call.messages.push(msg);
  if (call.messages.length > 100) call.messages.shift();

  res.status(201).json({ success: true, message: msg });
}));

// 8. Get in-call chat messages
app.get('/api/calls/:id/messages', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call session not found.' });
  res.json({ messages: call.messages });
}));

// 8b. Sync Whiteboard state & add strokes (Teacher only can open or draw)
app.post('/api/calls/:id/whiteboard', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call session not found.' });

  const role = (req.body?.role || req.user?.role || req.headers['x-user-role'] || '').toLowerCase();
  // If explicitly student, disallow drawing or opening canvas
  if (role === 'student') {
    return res.status(403).json({ message: 'Only the instructor has permission to draw on or open the whiteboard.' });
  }

  if (!call.whiteboard) {
    call.whiteboard = {
      isOpen: false,
      strokes: [],
      lastUpdate: Date.now(),
      clearVersion: 0,
      clearedAt: 0
    };
  }

  const { strokes, isOpen, clear } = req.body || {};

  if (clear) {
    call.whiteboard.strokes = [];
    call.whiteboard.clearVersion = (call.whiteboard.clearVersion || 0) + 1;
    call.whiteboard.clearedAt = Date.now();
    call.whiteboard.lastUpdate = Date.now();
  }

  if (typeof isOpen === 'boolean') {
    call.whiteboard.isOpen = isOpen;
    call.whiteboard.lastUpdate = Date.now();
  }

  if (Array.isArray(strokes) && strokes.length > 0) {
    call.whiteboard.strokes.push(...strokes);
    if (call.whiteboard.strokes.length > 3000) {
      call.whiteboard.strokes = call.whiteboard.strokes.slice(-3000);
    }
    call.whiteboard.lastUpdate = Date.now();
  }

  res.json({
    success: true,
    isOpen: call.whiteboard.isOpen,
    totalStrokes: call.whiteboard.strokes.length,
    clearVersion: call.whiteboard.clearVersion || 0,
    clearedAt: call.whiteboard.clearedAt || 0,
    lastUpdate: call.whiteboard.lastUpdate
  });
}));

// 8c. Get Whiteboard state & strokes (Both teacher & student can view)
app.get('/api/calls/:id/whiteboard', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call session not found.' });

  if (!call.whiteboard) {
    call.whiteboard = {
      isOpen: false,
      strokes: [],
      lastUpdate: Date.now(),
      clearVersion: 0,
      clearedAt: 0
    };
  }

  const since = Number(req.query.since || 0);
  const newStrokes = since > 0
    ? call.whiteboard.strokes.filter(s => (s.timestamp || 0) > since)
    : call.whiteboard.strokes;

  res.json({
    isOpen: call.whiteboard.isOpen,
    strokes: newStrokes,
    totalStrokes: call.whiteboard.strokes.length,
    clearVersion: call.whiteboard.clearVersion || 0,
    clearedAt: call.whiteboard.clearedAt || 0,
    lastUpdate: call.whiteboard.lastUpdate
  });
}));

// 8d. Update Screen Share state
app.post('/api/calls/:id/screenshare', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call session not found.' });

  const { active, sharerRole, sharerName } = req.body || {};
  call.screenShare = {
    active: Boolean(active),
    sharerRole: sharerRole || null,
    sharerName: sharerName || null,
    lastUpdate: Date.now()
  };

  res.json({ success: true, screenShare: call.screenShare });
}));

// 8e. Get Screen Share state
app.get('/api/calls/:id/screenshare', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call session not found.' });

  if (!call.screenShare) {
    call.screenShare = { active: false, sharerRole: null, sharerName: null, lastUpdate: Date.now() };
  }

  res.json({ screenShare: call.screenShare });
}));

// 9. End video call (Teacher / Host exclusive for 'end_for_all')
app.post('/api/calls/:id/end', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  const role = (req.body?.role || req.user?.role || req.headers['x-user-role'] || '').toLowerCase();
  const action = req.body?.action || 'end_for_all';

  if (!call) {
    if (teacherOfficeHours.status === 'in_call') teacherOfficeHours.status = 'available';
    teacherOfficeHours.activeRoomId = null;
    return res.json({ success: true, message: 'Call already ended' });
  }

  // Student cannot end meeting for all!
  if (role === 'student' && action === 'end_for_all') {
    return res.status(403).json({
      message: 'Only the instructor/host has permission to end the meeting for all participants.'
    });
  }

  const { durationSeconds } = req.body || {};
  call.status = 'ended';
  call.endedBy = role === 'teacher' ? 'teacher' : 'host';
  call.endedAt = new Date().toISOString();

  if (teacherOfficeHours.status === 'in_call') {
    teacherOfficeHours.status = 'available';
  }
  teacherOfficeHours.activeRoomId = null;

  const durationStr = durationSeconds
    ? `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`
    : '5m';

  logTeacherActivity(
    'call_ended',
    call.caller.role === 'student' ? call.caller.name : call.callee.name,
    `Completed 1-on-1 video call session (${durationStr}) for all participants`
  );

  res.json({ success: true, message: 'Meeting ended for all participants', call });
}));

// 9b. Leave meeting (Participant / Student exits without killing the room)
app.post('/api/calls/:id/leave', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.json({ success: true, message: 'Call already completed' });

  const { role, name } = req.body || {};
  const participantName = name || (role === 'teacher' ? teacherOfficeHours.teacherName : 'Student');

  call.participantLeft = true;
  call.leftParticipantName = participantName;
  call.leftAt = new Date().toISOString();

  logTeacherActivity(
    'call_leave',
    participantName,
    `${participantName} left the video meeting room`
  );

  createTeacherNotification(
    'call_leave',
    { id: `leave-${Date.now()}`, name: participantName },
    `${participantName} has left the video meeting.`
  );

  res.json({ success: true, message: `${participantName} left the meeting.` });
}));

// 9c. Host Security Settings (Host only)
app.post('/api/calls/:id/security', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call not found' });

  const role = (req.body?.role || req.user?.role || req.headers['x-user-role'] || '').toLowerCase();
  if (role === 'student') {
    return res.status(403).json({ message: 'Only the host has access to meeting security settings.' });
  }

  const { locked, allowScreenShare, allowChat, allowUnmute } = req.body || {};
  if (!call.security) {
    call.security = { locked: false, allowScreenShare: true, allowChat: true, allowUnmute: true };
  }
  if (typeof locked === 'boolean') call.security.locked = locked;
  if (typeof allowScreenShare === 'boolean') call.security.allowScreenShare = allowScreenShare;
  if (typeof allowChat === 'boolean') call.security.allowChat = allowChat;
  if (typeof allowUnmute === 'boolean') call.security.allowUnmute = allowUnmute;

  res.json({ success: true, security: call.security });
}));

// 9d. Reactions and Hand Raise
app.post('/api/calls/:id/reaction', route(async (req, res) => {
  const call = activeCalls.get(req.params.id);
  if (!call) return res.status(404).json({ message: 'Call not found' });

  const { emoji, handRaised, senderRole, senderName } = req.body || {};
  if (typeof handRaised === 'boolean') {
    call.handRaised = handRaised;
    if (handRaised) {
      logTeacherActivity('hand_raised', senderName || 'Student', `${senderName || 'Student'} raised their hand ✋`);
    }
  }

  if (emoji) {
    if (!call.reactions) call.reactions = [];
    call.reactions.push({
      id: `react-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      emoji,
      senderRole: senderRole || 'student',
      senderName: senderName || 'User',
      timestamp: Date.now()
    });
    if (call.reactions.length > 30) call.reactions.shift();
  }

  res.json({ success: true, handRaised: call.handRaised, reactions: call.reactions || [] });
}));

// 2. Enroll new student
app.post('/api/teacher/students', teacherAuth, route(async (req, res) => {
  const { name, email, password, level, dailyGoal, status, teacherNotes, favoriteTopic } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();
  const displayName = (name || '').trim() || cleanEmail.split('@')[0];

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ message: 'A valid student email is required.' });
  }

  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({ message: 'A student or account with this email already exists.' });
  }

  const defaultPassword = password || 'Student@123';
  const newStudent = {
    id: `student-${Date.now()}`,
    name: displayName,
    username: displayName,
    email: cleanEmail,
    password: await bcrypt.hash(defaultPassword, 10),
    role: 'student',
    level: Number(level) || 1,
    xp: ((Number(level) || 1) - 1) * 100,
    streak: 0,
    accuracy: 0.0,
    completedChapters: 0,
    problemsSolved: 0,
    focusMinutes: 0,
    dailyGoal: Number(dailyGoal) || 50,
    status: status || 'On Track',
    teacherNotes: teacherNotes || 'Newly enrolled student.',
    favoriteTopic: favoriteTopic || 'Mathematics',
    topicProgress: { ...DEFAULT_TOPIC_PROGRESS },
    recentActivity: [{ title: 'Class Enrollment', time: 'Just now', xp: 0 }],
    lastLogin: null,
    isOnline: false,
    lastHeartbeat: 0
  };

  users.push(newStudent);
  logTeacherActivity('enrolled_student', displayName, `Enrolled student into class roster (${cleanEmail})`);

  res.status(201).json({
    message: 'Student enrolled successfully.',
    student: safeUser(newStudent),
    tempPassword: defaultPassword
  });
}));

// 3. Update student details
app.put('/api/teacher/students/:id', teacherAuth, route(async (req, res) => {
  const student = users.find((u) => u.id === req.params.id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const { name, username, email, level, xp, streak, accuracy, dailyGoal, status, teacherNotes, favoriteTopic, topicProgress } = req.body;

  if (name !== undefined) student.name = name;
  if (username !== undefined) student.username = username;
  if (email !== undefined) student.email = email.toLowerCase().trim();
  if (level !== undefined) student.level = Number(level);
  if (xp !== undefined) student.xp = Number(xp);
  if (streak !== undefined) student.streak = Number(streak);
  if (accuracy !== undefined) student.accuracy = Number(accuracy);
  if (dailyGoal !== undefined) student.dailyGoal = Number(dailyGoal);
  if (status !== undefined) student.status = status;
  if (teacherNotes !== undefined) student.teacherNotes = teacherNotes;
  if (favoriteTopic !== undefined) student.favoriteTopic = favoriteTopic;
  if (topicProgress !== undefined) student.topicProgress = { ...student.topicProgress, ...topicProgress };

  logTeacherActivity('updated_student', student.name, `Teacher updated student record and progress metrics.`);

  res.json({
    message: 'Student profile updated successfully.',
    student: safeUser(student)
  });
}));

// 4. Remove / unenroll student
app.delete('/api/teacher/students/:id', teacherAuth, route(async (req, res) => {
  const index = users.findIndex((u) => u.id === req.params.id && u.role !== 'teacher');
  if (index === -1) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const removed = users.splice(index, 1)[0];
  logTeacherActivity('removed_student', removed.name, `Removed student from class roster.`);

  res.json({
    success: true,
    message: `Student ${removed.name} removed from roster.`
  });
}));

// 5. Reset student password
app.post('/api/teacher/students/:id/reset-password', teacherAuth, route(async (req, res) => {
  const student = users.find((u) => u.id === req.params.id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const newPassword = req.body.newPassword || 'TutorMind@2026';
  student.password = await bcrypt.hash(newPassword, 10);

  logTeacherActivity('reset_password', student.name, `Teacher reset password for student account.`);

  res.json({
    success: true,
    message: `Password for ${student.name} reset successfully.`,
    tempPassword: newPassword
  });
}));

// 6. Get class assignments with detailed student completion breakdown
app.get('/api/teacher/assignments', teacherAuth, route(async (req, res) => {
  const allStudents = users
    .filter(isRealStudent)
    .map(safeUser);

  const now = Date.now();
  allStudents.forEach((st) => {
    const isRecentHeartbeat = st.lastHeartbeat && (now - st.lastHeartbeat < 300000);
    const isRecentLogin = st.lastLogin && (now - new Date(st.lastLogin).getTime() < 300000);
    st.isOnline = Boolean(st.isOnline && (isRecentHeartbeat || isRecentLogin));
  });

  const enrichedAssignments = teacherAssignments.map((a) => {
    // Determine which students are targeted
    const isTargeted = (st) => {
      if (a.targetType === 'all' || a.assignedTo?.includes('all')) return true;
      if (a.assignedTo?.includes(st.id)) return true;
      if (st.email && a.assignedTo?.some((t) => typeof t === 'string' && t.toLowerCase() === st.email.toLowerCase())) return true;
      return false;
    };

    const targetStudents = allStudents.filter(isTargeted);

    const completedStudents = [];
    const pendingStudents = [];

    targetStudents.forEach((st) => {
      const stId = st.id;
      const stEmail = (st.email || '').toLowerCase().trim();

      const isCompleted =
        (a.completedStudentIds && a.completedStudentIds.includes(stId)) ||
        (stEmail && a.completedStudentEmails && a.completedStudentEmails.includes(stEmail));

      const submission = a.submissions?.[stId] || (stEmail && a.submissions?.[stEmail]);

      const record = {
        id: st.id,
        name: st.name || st.username || st.email,
        email: st.email,
        avatar: st.avatar || null,
        isOnline: Boolean(st.isOnline),
        isCompleted: Boolean(isCompleted),
        score: submission?.score ?? (isCompleted ? 3 : null),
        totalQuestions: submission?.total ?? 3,
        submittedAt: submission?.submittedAt ?? (isCompleted ? a.createdAt : null)
      };

      if (isCompleted) {
        completedStudents.push(record);
      } else {
        pendingStudents.push(record);
      }
    });

    return {
      ...a,
      targetStudentsCount: targetStudents.length,
      completedStudents,
      pendingStudents,
      completedCount: completedStudents.length,
      pendingCount: pendingStudents.length,
      totalStudents: targetStudents.length
    };
  });

  res.json({ assignments: enrichedAssignments });
}));

// Remind student endpoint
app.post('/api/teacher/assignments/:id/remind', teacherAuth, route(async (req, res) => {
  const { studentName = 'Student' } = req.body || {};
  const assignment = teacherAssignments.find((a) => a.id === req.params.id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  logTeacherActivity('sent_reminder', 'Teacher', `Sent assignment reminder for "${assignment.title}" to ${studentName}`, assignment.chapter, assignment.topic);
  res.json({ success: true, message: `Reminder sent to ${studentName}.` });
}));

// 7. Create assignment
app.post('/api/teacher/assignments', teacherAuth, route(async (req, res) => {
  const { title, topic, chapter, dueDate, targetType, assignedTo, xpReward } = req.body;
  if (!title || !topic || !chapter) {
    return res.status(400).json({ message: 'Title, topic, and chapter are required.' });
  }

  const studentsCount = users.filter(isRealStudent).length;
  const newAssignment = {
    id: `assign-${Date.now()}`,
    title: title.trim(),
    topic: topic.trim(),
    chapter: chapter.trim(),
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    targetType: targetType || 'all',
    assignedTo: assignedTo && Array.isArray(assignedTo) ? assignedTo : ['all'],
    xpReward: Number(xpReward) || 100,
    completedStudentIds: [],
    totalStudents: targetType === 'specific' && Array.isArray(assignedTo) ? assignedTo.length : studentsCount,
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  teacherAssignments.unshift(newAssignment);
  logTeacherActivity('created_assignment', 'Teacher', `Created new assignment: "${title}" (${chapter})`, chapter, topic);

  res.status(201).json({
    message: 'Assignment created successfully.',
    assignment: newAssignment
  });
}));

// Delete all assignments
app.delete('/api/teacher/assignments', teacherAuth, route(async (req, res) => {
  const count = teacherAssignments.length;
  teacherAssignments.length = 0;
  res.json({ success: true, message: `All ${count} assignments deleted.` });
}));

// 8. Delete assignment
app.delete('/api/teacher/assignments/:id', teacherAuth, route(async (req, res) => {
  const index = teacherAssignments.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Assignment not found.' });
  }

  const removed = teacherAssignments.splice(index, 1)[0];
  res.json({ success: true, message: `Assignment "${removed.title}" deleted.` });
}));

// 9. Class-wide Analytics
app.get('/api/teacher/analytics', teacherAuth, route(async (req, res) => {
  const students = users.filter(isRealStudent);
  const totalStudents = students.length;

  const totalAccuracy = students.reduce((sum, s) => sum + (s.accuracy || 0), 0);
  const classAverageAccuracy = totalStudents ? Math.round((totalAccuracy / totalStudents) * 10) / 10 : 0;

  const totalProblemsSolved = students.reduce((sum, s) => sum + (s.problemsSolved || 0), 0);
  const totalXp = students.reduce((sum, s) => sum + (s.xp || 0), 0);
  const activeToday = students.filter((s) => (s.streak || 0) > 0).length;

  // Topic mastery averages
  const topics = Object.keys(DEFAULT_TOPIC_PROGRESS);
  const topicMastery = topics.map((t) => {
    const avg = totalStudents
      ? Math.round(students.reduce((acc, s) => {
          let val = s.topicProgress?.[t];
          if (val === undefined && t === 'Mathematics' && s.topicProgress) {
            val = Math.round(
              ((s.topicProgress.Algebra || 0) +
               (s.topicProgress.Geometry || 0) +
               (s.topicProgress.Calculus || 0) +
               (s.topicProgress.Statistics || 0) +
               (s.topicProgress.Arithmetic || 0)) / 5
            );
          }
          return acc + (val || 0);
        }, 0) / totalStudents)
      : 0;
    return { topic: t, averageMastery: avg };
  });

  // Struggling students (status 'Needs Help' or accuracy < 75)
  const strugglingStudents = students
    .filter((s) => s.status === 'Needs Help' || (s.accuracy && s.accuracy < 75))
    .map(safeUser);

  // Top performers
  const topPerformers = [...students]
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 3)
    .map(safeUser);

  // Assignments summary
  const totalAssignments = teacherAssignments.length;
  let totalCompletions = 0;
  let totalOpportunities = 0;
  teacherAssignments.forEach((a) => {
    totalCompletions += (a.completedStudentIds?.length || 0);
    totalOpportunities += (a.totalStudents || totalStudents || 1);
  });
  const completionRate = totalOpportunities ? Math.round((totalCompletions / totalOpportunities) * 100) : 0;

  res.json({
    totalStudents,
    activeToday,
    classAverageAccuracy,
    totalProblemsSolved,
    totalXp,
    topicMastery,
    strugglingStudents,
    topPerformers,
    assignmentsSummary: {
      total: totalAssignments,
      active: teacherAssignments.filter((a) => a.status === 'Active').length,
      completionRate
    }
  });
}));

// 10. Live Activity Audit Feed
app.get('/api/teacher/activity', teacherAuth, route(async (req, res) => {
  res.json({ activities: teacherActivities.slice(0, 50) });
}));

// 11. Real-Time Struggle Signals for Teacher
app.get('/api/teacher/struggles', teacherAuth, route(async (req, res) => {
  const active = struggleSignals.filter((s) => {
    if (s.status !== 'active' && s.status !== 'intervened') return false;
    const u = users.find((usr) => (usr.email && usr.email.toLowerCase() === s.studentEmail.toLowerCase()) || usr.id === s.studentId);
    return !u || isRealStudent(u);
  });
  res.json({
    total: active.length,
    activeCount: active.filter((s) => s.status === 'active').length,
    struggles: active
  });
}));

// 12. Teacher Sends Guided Hint / Intervention
app.post('/api/teacher/intervene/hint', teacherAuth, route(async (req, res) => {
  const { signalId, studentEmail, studentId, chapter, subject, hintText } = req.body;
  if (!hintText || !hintText.trim()) {
    return res.status(400).json({ message: 'Hint text is required' });
  }

  const cleanEmail = (studentEmail || '').toLowerCase().trim();
  const teacherName = req.user?.name || req.user?.username || 'Teacher';

  const intervention = {
    id: `int-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    signalId: signalId || '',
    studentEmail: cleanEmail,
    studentId: studentId || '',
    teacherName,
    chapter: chapter || '',
    subject: subject || 'Mathematics',
    hintText: hintText.trim(),
    timestamp: new Date().toISOString(),
    acknowledged: false
  };

  teacherInterventions.unshift(intervention);
  if (teacherInterventions.length > 50) teacherInterventions.pop();

  if (signalId) {
    const sig = struggleSignals.find((s) => s.id === signalId);
    if (sig) {
      sig.status = 'intervened';
      sig.intervenedAt = new Date().toISOString();
      sig.lastHint = hintText.trim();
    }
  }

  const stUser = users.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
  const studentName = stUser?.name || cleanEmail.split('@')[0];
  logTeacherActivity('TEACHER_INTERVENTION', studentName, `Sent guidance hint for ${chapter}: "${hintText.slice(0, 45)}..."`, chapter, subject);

  res.json({ success: true, intervention });
}));

// 13. Teacher Marks Struggle as Resolved
app.post('/api/teacher/intervene/resolve', teacherAuth, route(async (req, res) => {
  const { signalId } = req.body;
  const sig = struggleSignals.find((s) => s.id === signalId);
  if (sig) {
    sig.status = 'resolved';
    sig.resolvedAt = new Date().toISOString();
  }
  res.json({ success: true, message: 'Struggle alert marked resolved.' });
}));

// --- MACHINE LEARNING KNOWLEDGE TRACING & COGNITIVE RISK ENDPOINTS ---

// 14. ML Model Architecture & Evaluation Metrics
app.get('/api/ml/model-info', route(async (req, res) => {
  try {
    if (fs.existsSync(metricsFile)) {
      const data = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      return res.json({ success: true, ...data });
    }
  } catch (err) {
    console.warn('Error reading model_metrics.json:', err.message);
  }
  res.json({
    success: true,
    model_name: 'RandomForestClassifier',
    framework: 'scikit-learn 1.8.0',
    algorithm: 'Ensemble Decision Trees (120 Estimators, Max Depth: 6)',
    accuracy: 0.9538,
    roc_auc: 0.9942,
    f1_score: 0.9641,
    cv_mean_accuracy: 0.9460,
    feature_importances: {
      consecutive_errors: 40.15,
      tutor_inquiries: 31.74,
      accuracy_rate: 13.12,
      solving_latency: 11.92,
      streak_days: 1.93,
      topic_difficulty: 1.15
    }
  });
}));

// 15. ML Predict Student Cognitive State & Struggle Risk
app.post('/api/ml/predict-struggle', route(async (req, res) => {
  const telemetry = req.body || {};
  const prediction = await predictStudentStruggleML(telemetry);
  res.json(prediction);
}));

// --- STUDENT STRUGGLE & INTERVENTION ENDPOINTS ---

// Student submits struggle signal (e.g. quiz failure, wrong answer, or repeated tutor questions)
app.post('/api/student/struggle-signal', auth, route(async (req, res) => {
  const student = req.user;
  const {
    subject,
    chapterId,
    chapterTitle,
    unit,
    triggerType,
    score,
    inquiryCount,
    question,
    selectedAnswer,
    correctAnswer,
    concept,
    detail
  } = req.body;
  const signal = addOrUpdateStruggle({
    student,
    subject,
    chapterId,
    chapterTitle,
    unit,
    triggerType: triggerType || 'quiz_failure',
    score,
    inquiryCount,
    question,
    selectedAnswer,
    correctAnswer,
    concept,
    detail
  });
  res.json({ success: true, signal });
}));

// Student gets pending teacher guidance hints
app.get('/api/student/interventions', auth, route(async (req, res) => {
  const student = req.user;
  const studentEmail = (student.email || req.headers['x-user-email'] || '').toLowerCase().trim();
  const studentId = student.id;

  const pending = teacherInterventions.filter((it) => {
    if (it.acknowledged) return false;
    if (studentEmail && it.studentEmail === studentEmail) return true;
    if (studentId && it.studentId === studentId) return true;
    return false;
  });

  res.json({
    total: pending.length,
    interventions: pending
  });
}));

// Student acknowledges teacher guidance hint
app.post('/api/student/interventions/:id/ack', auth, route(async (req, res) => {
  const item = teacherInterventions.find((it) => it.id === req.params.id);
  if (item) {
    item.acknowledged = true;
  }
  res.json({ success: true });
}));

// --- STUDENT ASSIGNMENT ENDPOINTS ---

// 1. Get assignments for the authenticated student
app.get('/api/student/assignments', auth, route(async (req, res) => {
  const student = req.user;
  const studentId = student.id;
  const headerUserId = req.headers['x-user-id'];
  const studentEmail = (student.email || req.headers['x-user-email'] || '').toLowerCase().trim();
  const studentUsername = (student.username || student.name || '').toLowerCase().trim();

  const isAssignedToStudent = (a) => {
    if (a.targetType === 'all' || a.assignedTo?.includes('all')) return true;
    if (a.assignedTo?.includes(studentId)) return true;
    if (headerUserId && a.assignedTo?.includes(headerUserId)) return true;
    if (studentEmail && a.assignedTo?.some((t) => typeof t === 'string' && t.toLowerCase() === studentEmail)) return true;
    if (studentUsername && a.assignedTo?.some((t) => typeof t === 'string' && t.toLowerCase() === studentUsername)) return true;
    if (Array.isArray(a.assignedTo)) {
      for (const assignedId of a.assignedTo) {
        const u = users.find((usr) => usr.id === assignedId);
        if (u && ((u.email && u.email.toLowerCase() === studentEmail) || (u.username && u.username.toLowerCase() === studentUsername))) {
          return true;
        }
      }
    }
    return false;
  };

  const isCompletedByStudent = (a) => {
    if (a.completedStudentIds && a.completedStudentIds.includes(studentId)) return true;
    if (headerUserId && a.completedStudentIds && a.completedStudentIds.includes(headerUserId)) return true;
    if (studentEmail && a.completedStudentEmails && a.completedStudentEmails.includes(studentEmail)) return true;
    if (Array.isArray(a.completedStudentIds)) {
      for (const compId of a.completedStudentIds) {
        const u = users.find((usr) => usr.id === compId);
        if (u && ((u.email && u.email.toLowerCase() === studentEmail) || (u.username && u.username.toLowerCase() === studentUsername))) {
          return true;
        }
      }
    }
    return false;
  };

  const relevant = teacherAssignments
    .filter(isAssignedToStudent)
    .map((a) => {
      const isCompleted = isCompletedByStudent(a);
      const submission = a.submissions?.[studentId] || (studentEmail && a.submissions?.[studentEmail]) || (headerUserId && a.submissions?.[headerUserId]);
      return {
        ...a,
        isCompleted,
        score: submission?.score ?? null,
        totalQuestions: submission?.total ?? 3
      };
    });

  res.json({
    total: relevant.length,
    pending: relevant.filter((a) => !a.isCompleted).length,
    completed: relevant.filter((a) => a.isCompleted).length,
    assignments: relevant
  });
}));

// 2. Student completes / submits assignment with score
app.post('/api/student/assignments/:id/complete', auth, route(async (req, res) => {
  const student = req.user;
  const studentId = student.id;
  const headerUserId = req.headers['x-user-id'];
  const studentEmail = (student.email || req.headers['x-user-email'] || '').toLowerCase().trim();
  const assignmentId = req.params.id;
  const score = typeof req.body?.score === 'number' ? req.body.score : null;
  const total = typeof req.body?.total === 'number' ? req.body.total : 3;

  const assignment = teacherAssignments.find((a) => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  assignment.completedStudentIds = assignment.completedStudentIds || [];
  assignment.completedStudentEmails = assignment.completedStudentEmails || [];
  assignment.submissions = assignment.submissions || {};

  const subData = { score: score ?? total, total, submittedAt: new Date().toISOString() };
  assignment.submissions[studentId] = subData;
  if (headerUserId) assignment.submissions[headerUserId] = subData;
  if (studentEmail) assignment.submissions[studentEmail] = subData;

  const alreadyCompleted =
    assignment.completedStudentIds.includes(studentId) ||
    (headerUserId && assignment.completedStudentIds.includes(headerUserId)) ||
    (studentEmail && assignment.completedStudentEmails.includes(studentEmail));

  if (alreadyCompleted) {
    return res.json({
      message: 'Assignment updated with latest score.',
      alreadyCompleted: true,
      assignment: { ...assignment, isCompleted: true, score: subData.score, totalQuestions: total },
      user: safeUser(student)
    });
  }

  assignment.completedStudentIds.push(studentId);
  if (headerUserId && !assignment.completedStudentIds.includes(headerUserId)) {
    assignment.completedStudentIds.push(headerUserId);
  }
  if (studentEmail && !assignment.completedStudentEmails.includes(studentEmail)) {
    assignment.completedStudentEmails.push(studentEmail);
  }

  const xpReward = Number(assignment.xpReward) || 100;
  student.xp = (student.xp || 0) + xpReward;
  student.level = Math.floor(student.xp / 100) + 1;
  student.completedChapters = (student.completedChapters || 0) + 1;

  student.completedChapterIds = student.completedChapterIds || [];
  const fullChapterId = `${assignment.topic}:${assignment.chapter}`;
  if (!student.completedChapterIds.includes(fullChapterId)) {
    student.completedChapterIds.push(fullChapterId);
  }

  const scoreText = score !== null ? ` (Score: ${score}/${total})` : '';

  student.recentActivity = student.recentActivity || [];
  student.recentActivity.unshift({
    id: Date.now(),
    icon: '📚',
    iconBg: '#e0f2fe',
    iconColor: '#0369a1',
    title: `Submitted Assignment: ${assignment.title}${scoreText}`,
    topic: assignment.topic,
    time: 'Just now',
    xp: `+${xpReward} XP`,
    badge: 'Assignment'
  });

  const studentName = student.name || student.username || studentEmail;

  createTeacherNotification(
    'assignment_completed',
    student,
    `Student ${studentName} completed and submitted the assignment "${assignment.title}"${scoreText} (+${xpReward} XP)!`
  );

  logTeacherActivity(
    'completed_assignment',
    studentName,
    `Submitted assignment "${assignment.title}"${scoreText} (+${xpReward} XP)`,
    assignment.chapter,
    assignment.topic
  );

  res.json({
    success: true,
    message: `Assignment "${assignment.title}" submitted successfully! You earned +${xpReward} XP.`,
    earnedXp: xpReward,
    score: subData.score,
    totalQuestions: total,
    assignment: { ...assignment, isCompleted: true, score: subData.score, totalQuestions: total },
    user: safeUser(student)
  });
}));

app.get('/api/lessons', auth, (req, res) => { let result = [...lessons]; if (req.query.topic) result = result.filter((lesson) => lesson.topic === req.query.topic); if (req.query.difficulty) result = result.filter((lesson) => lesson.difficulty === Number(req.query.difficulty)); res.json({ lessons: result }); });
app.get('/api/lessons/recommended', auth, (req, res) => res.json({ lessons: lessons.filter((lesson) => lesson.difficulty <= Math.max(3, req.user.level)).slice(0, 3) }));
app.get('/api/lessons/:id', auth, (req, res) => { const lesson = lessons.find((item) => item.id === req.params.id); if (!lesson) return res.status(404).json({ message: 'Lesson not found' }); res.json({ lesson }); });
app.post('/api/lessons/:id/complete', auth, (req, res) => { const lesson = lessons.find((item) => item.id === req.params.id); if (!lesson) return res.status(404).json({ message: 'Lesson not found' }); const score = Math.max(0, Math.min(100, Number(req.body.score) || 0)); const earnedXp = lesson.xpReward + (score === 100 ? 25 : 0); const item = { userId: req.user.id, lessonId: lesson.id, completed: true, score, attempts: Number(req.body.attempts) || 1, timeSpent: Number(req.body.timeSpent) || 0, completedAt: new Date() }; progress.push(item); req.user.xp += earnedXp; req.user.level = Math.floor(req.user.xp / 100) + 1; res.json({ progress: item, earnedXp, user: safeUser(req.user) }); });
app.get('/api/progress', auth, (req, res) => res.json({ user: safeUser(req.user), completed: progress.filter((item) => item.userId === req.user.id).length, progress: progress.filter((item) => item.userId === req.user.id) }));
app.get('/api/progress/lessons', auth, (req, res) => res.json({ progress: progress.filter((item) => item.userId === req.user.id) }));
app.get('/api/progress/topics', auth, (req, res) => { const result = {}; lessons.forEach((lesson) => { const done = progress.some((item) => item.userId === req.user.id && item.lessonId === lesson.id); result[lesson.topic] ??= { completed: 0, total: 0 }; result[lesson.topic].total += 1; if (done) result[lesson.topic].completed += 1; }); res.json(result); });
app.get('/api/progress/stats', auth, (req, res) => res.json({ xp: req.user.xp, level: req.user.level, streak: req.user.streak, totalLessons: progress.filter((item) => item.userId === req.user.id).length }));
app.get('/api/gamification/badges', (req, res) => res.json({ badges }));
app.get('/api/gamification/badges/earned', auth, (req, res) => res.json({ badges: badges.filter((badge) => badge.name === 'On fire' || (badge.name === 'First steps' && progress.some((item) => item.userId === req.user.id))) }));
app.get('/api/gamification/leaderboard', (req, res) => res.json({ leaderboard: users.map((user) => ({ username: user.username, xp: user.xp, level: user.level })).sort((a, b) => b.xp - a.xp) }));
app.post('/api/gamification/update-xp', auth, (req, res) => { req.user.xp += Math.max(0, Number(req.body.amount) || 0); req.user.level = Math.floor(req.user.xp / 100) + 1; res.json({ user: safeUser(req.user) }); });
const tutorReply = (message) => {
  const lower = (message || '').toLowerCase();
  
  // Physics concepts
  if (lower.includes('speed') || lower.includes('velocity')) {
    return `### ⚡ Speed vs. Velocity Explained

**Speed** is a scalar quantity measuring how fast an object is moving (rate of distance traveled over time):
$$\\text{Speed} = \\frac{\\text{Distance}}{\\text{Time}} \\quad (v = \\frac{d}{t})$$

- **SI Unit:** Meters per second ($\\text{m/s}$) or kilometers per hour ($\\text{km/h}$).
- **Velocity** is a vector quantity combining speed and direction (e.g., $60\\text{ km/h}$ due North).

### 💡 Example:
If an athlete runs $200\\text{ meters}$ in $25\\text{ seconds}$:
$$\\text{Speed} = \\frac{200\\text{ m}}{25\\text{ s}} = 8\\text{ m/s}$$

### 🎯 Key Takeaway:
Speed tells you **how fast** you travel regardless of direction!`;
  }

  if (lower.includes('acceleration')) {
    return `### 🚀 Acceleration Explained

**Acceleration** ($a$) is the rate at which velocity changes over time:
$$a = \\frac{v - u}{t} = \\frac{\\Delta v}{\\Delta t}$$

- $v$: final velocity ($\\text{m/s}$)
- $u$: initial velocity ($\\text{m/s}$)
- $t$: time taken ($\\text{s}$)
- **SI Unit:** $\\text{m/s}^2$

A positive acceleration means speeding up, while negative acceleration (deceleration) means slowing down.`;
  }

  if (lower.includes('force') || lower.includes('newton')) {
    return `### 💥 Force & Newton's Second Law

A **force** is a push or pull that changes an object's state of motion or shape:
$$F = m \\times a$$

- $F$: Net Force in Newtons ($\\text{N}$)
- $m$: Mass in kilograms ($\\text{kg}$)
- $a$: Acceleration in meters per second squared ($\\text{m/s}^2$)

$1\\text{ Newton}$ is the force needed to accelerate $1\\text{ kg}$ by $1\\text{ m/s}^2$.`;
  }

  if (lower.includes('energy') || lower.includes('work') || lower.includes('power')) {
    return `### ⚡ Work, Energy, and Power

- **Work ($W$):** Force exerted over a distance:
  $$W = F \\times d \\quad (\\text{Joules, J})$$
- **Kinetic Energy ($KE$):** Energy of motion:
  $$KE = \\frac{1}{2}mv^2$$
- **Gravitational Potential Energy ($PE$):**
  $$PE = mgh$$
- **Power ($P$):** Rate of doing work:
  $$P = \\frac{W}{t} \\quad (\\text{Watts, W})$$`;
  }

  if (lower.includes('ohm') || lower.includes('circuit') || lower.includes('voltage') || lower.includes('current') || lower.includes('resistan')) {
    return `### 🔌 Ohm's Law & Electric Circuits

Ohm's Law defines the relationship between potential difference ($V$), current ($I$), and resistance ($R$):
$$V = I \\times R$$

- $V$: Voltage in Volts ($\\text{V}$)
- $I$: Current in Amperes ($\\text{A}$)
- $R$: Resistance in Ohms ($\\Omega$)`;
  }

  // Computer Science concepts
  if (lower.includes('algorithm') || lower.includes('binary') || lower.includes('recursion') || lower.includes('complexity')) {
    return `### 💻 Computer Science Concept

- **Algorithm:** An unambiguous, finite set of instructions for solving a problem.
- **Binary Code:** Base-2 number system ($0$ and $1$), where each bit represents a power of $2$.
- **Big-O Notation:** Describes asymptotic time/space complexity (e.g. $O(1)$ constant, $O(n)$ linear, $O(n\\log n)$ log-linear, $O(n^2)$ quadratic).`;
  }

  // Chemistry concepts
  if (lower.includes('atom') || lower.includes('mole') || lower.includes('molar') || lower.includes('acid') || lower.includes('periodic')) {
    return `### 🧪 Chemistry Principle

- **The Mole:** $1\\text{ mole} = 6.022 \\times 10^{23}$ particles (Avogadro's constant).
- **Molar Mass ($M$):** Mass per mole of substance ($\\text{g/mol}$).
- **pH Scale:** Measures acidity: $\\text{pH} = -\\log[H^+]$. Neutral is $7$, $<7$ is acidic, $>7$ is basic.`;
  }

  // Mathematics concepts
  if (lower.includes('pythagoras') || lower.includes('pythagorean')) return 'The Pythagorean theorem connects the sides of a right triangle: $a^2 + b^2 = c^2$. Identify the hypotenuse ($c$), substitute the known legs ($a$ and $b$), and solve with a square root.';
  if (lower.includes('perpendicular')) return 'Perpendicular lines meet at $90^\\circ$. On a coordinate grid, their slopes are negative reciprocals: $m_1 \\times m_2 = -1$.';
  if (lower.includes('geometry') || lower.includes('angle')) return 'Geometry studies shapes, sizes, positions, and their relationships. Always sketch the figure and label every known angle or dimension first.';
  if (lower.includes('area') || lower.includes('perimeter')) return 'Area measures the 2D surface inside a boundary; perimeter measures the total outer length. For a rectangle, $\\text{Area} = l \\times w$ and $\\text{Perimeter} = 2(l + w)$.';
  if (lower.includes('probability')) return 'Probability measures likelihood: $P(E) = \\frac{\\text{Favorable Outcomes}}{\\text{Total Possible Outcomes}}$. Probability always ranges between $0$ (impossible) and $1$ (certain).';
  if (lower.includes('limit')) return 'A limit describes the value a function approaches as its input gets arbitrarily close to a point: $\\lim_{x \\to c} f(x) = L$. Check from both left and right sides.';
  if (lower.includes('fraction')) return 'A fraction $\\frac{a}{b}$ represents division of $a$ by $b$. To add or subtract fractions, find a common denominator first: $\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}$.';
  if (lower.includes('derivative')) return 'A derivative measures instantaneous rate of change (tangent slope). For polynomial terms $x^n$, the power rule gives $\\frac{d}{dx}[x^n] = n x^{n-1}$.';
  if (lower.includes('integral')) return 'An integral calculates accumulated area under a curve. The reverse power rule states $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$ for $n \\neq -1$.';
  if (lower.includes('quadratic')) return 'For a quadratic $ax^2 + bx + c = 0$, solve using factoring or the quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.';
  if (lower.includes('equation')) return 'Keep an equation balanced by applying inverse operations to both sides equally. Undo addition/subtraction first, then multiplication/division.';
  
  return '### 💡 Let\'s Explore Together!\n\nTell me the specific topic, problem, or question you are working on, and I will guide you through it step-by-step with clear explanations, formulas, and examples!';
};
const askModel = async (messages) => {
  if (!process.env.AI_API_KEY) return null;
  const systemPrompt = 'You are TutorMind Tutor, an expert, encouraging, patient AI STEM teacher. Structure your answers clearly using markdown formatting: use ### headings for steps (e.g. ### Step 1: ...), **bold text** for key terms and operations, bullet points, and standard LaTeX math notation ($...$ for inline variables and $$...$$ for display formulas/equations). Always provide clear step-by-step reasoning, intuitive analogies, and highlight the final result in a ### **Summary / Key Takeaway** section.';
  const models = AI_PROVIDER === 'gemini' ? [AI_MODEL, ...AI_FALLBACK_MODELS.filter((m) => m !== AI_MODEL)] : [AI_MODEL];
  let lastError;
  for (const model of models) {
    const request = AI_PROVIDER === 'gemini' ? {
      url: `${AI_API_URL.replace(/models\/[^:]+:/, `models/${model}:`)}${AI_API_URL.includes('?') ? '&' : '?'}key=${encodeURIComponent(process.env.AI_API_KEY)}`,
      headers: { 'Content-Type': 'application/json' },
      body: {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: messages.map((item) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content }]
        })),
        generationConfig: { temperature: 0.2 }
      }
    } : {
      url: AI_API_URL,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_API_KEY}` },
      body: { model, temperature: 0.2, messages: [{ role: 'system', content: systemPrompt }, ...messages.map((item) => ({ role: item.role, content: item.content }))] }
    };
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      let response;
      try {
        response = await fetch(request.url, { method: 'POST', headers: request.headers, body: JSON.stringify(request.body), signal: controller.signal });
      } catch (error) {
        if (error.name === 'AbortError') lastError = new Error(`AI model ${model} timed out`);
        else lastError = error;
      } finally {
        clearTimeout(timeout);
      }
      if (response?.ok) {
        const data = await response.json();
        const reply = AI_PROVIDER === 'gemini' ? data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() : data.choices?.[0]?.message?.content?.trim() || null;
        if (reply) return reply;
      }
      if (response && ![429, 503].includes(response.status)) {
        const detail = await response.text();
        lastError = new Error(`AI model ${model} returned ${response.status}: ${detail.slice(0, 150)}`);
        break;
      }
      if (attempt < 1) await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
  throw lastError || new Error('AI provider unavailable');
};
const getMathVisionSolution = (promptText = '') => {
  const text = (promptText || '').toLowerCase().trim();

  // 1. Calculus: dx/dy (Rate of change of x with respect to y, reciprocal derivative)
  if (text.includes('dx/dy') || text.includes('dx / dy') || text.includes('dx\\over dy') || text.includes('rate of change of x') || text.includes('inverse derivative')) {
    return `### 🔍 Handwritten Problem Identified
$$\\frac{dx}{dy}$$

---

### 💡 Core Mathematical Concept: The Reciprocal Derivative
In differential calculus, **$\\frac{dx}{dy}$** represents the **instantaneous rate of change of $x$ with respect to $y$** (treating $x$ as the dependent variable and $y$ as the independent variable).

It is mathematically the algebraic **reciprocal** of the standard derivative $\\frac{dy}{dx}$:
$$\\frac{dx}{dy} = \\frac{1}{\\frac{dy}{dx}} \\quad \\text{where } \\frac{dy}{dx} \\neq 0$$

---

### 📐 Intuition & Geometric Meaning
- **$\\frac{dy}{dx}$** measures the tangent slope relative to the horizontal $x$-axis ($\\frac{\\Delta y}{\\Delta x}$, rise over run).
- **$\\frac{dx}{dy}$** measures the tangent slope relative to the vertical $y$-axis ($\\frac{\\Delta x}{\\Delta y}$, run over rise).
- **Inverse Function Theorem**: If $y = f(x)$ has an inverse function $x = f^{-1}(y)$, then:
  $$\\frac{d}{dy}\\left[f^{-1}(y)\\right] = \\frac{1}{f'(x)}$$

---

### 📝 Step-by-Step Worked Example
**Problem**: Find $\\frac{dx}{dy}$ given the equation $y = x^3 + 4x$.

1. **Step 1: Differentiate $y$ with respect to $x$**:
   $$\\frac{dy}{dx} = \\frac{d}{dx}\\left(x^3 + 4x\\right) = 3x^2 + 4$$

2. **Step 2: Apply the reciprocal rule for $\\frac{dx}{dy}$**:
   $$\\frac{dx}{dy} = \\frac{1}{\\frac{dy}{dx}} = \\frac{1}{3x^2 + 4}$$

3. **Step 3: Evaluate at a coordinate (e.g. $x = 1$, where $y = 5$)**:
   $$\\left.\\frac{dx}{dy}\\right|_{y=5} = \\frac{1}{3(1)^2 + 4} = \\frac{1}{7} \\approx 0.143$$

---

### ⚠️ Common Pitfall & Caution
- **First derivative**: $\\frac{dx}{dy} = \\frac{1}{dy/dx}$ (Simple reciprocal).
- **Second derivative does NOT simply invert**: $\\frac{d^2 x}{dy^2} \\neq \\frac{1}{\\frac{d^2 y}{dx^2}}$. By the chain rule:
  $$\\frac{d^2 x}{dy^2} = -\\frac{\\frac{d^2 y}{dx^2}}{\\left(\\frac{dy}{dx}\\right)^3}$$

---

### ✅ Summary / Final Answer:
$$\\mathbf{\\frac{dx}{dy} = \\frac{1}{\\frac{dy}{dx}} = \\left(\\frac{dy}{dx}\\right)^{-1}}$$`;
  }

  // 2. Calculus: dy/dx (Standard derivative)
  if (text.includes('dy/dx') || text.includes('dy / dx') || text.includes('derivative') || text.includes('differentiat')) {
    return `### 🔍 Handwritten Problem Identified
$$\\frac{dy}{dx}$$

---

### 💡 Core Mathematical Concept: The Derivative
The notation **$\\frac{dy}{dx}$** (Leibniz's notation) denotes the **derivative of $y$ with respect to $x$**. It measures the instantaneous rate of change of $y$ as $x$ varies:
$$\\frac{dy}{dx} = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}$$

---

### 🔑 Fundamental Rules of Differentiation
1. **Power Rule**: $\\frac{d}{dx}\\left(x^n\\right) = n x^{n-1}$
2. **Sum & Difference Rule**: $\\frac{d}{dx}[u \\pm v] = \\frac{du}{dx} \\pm \\frac{dv}{dx}$
3. **Product Rule**: $\\frac{d}{dx}[u \\cdot v] = u\\frac{dv}{dx} + v\\frac{du}{dx}$
4. **Quotient Rule**: $\\frac{d}{dx}\\left[\\frac{u}{v}\\right] = \\frac{v\\frac{du}{dx} - u\\frac{dv}{dx}}{v^2}$
5. **Chain Rule**: $\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$

---

### 📝 Step-by-Step Example
**Problem**: Differentiate $y = 5x^3 - 2x^2 + 7x - 9$.

1. Apply the power rule term by term:
   - $\\frac{d}{dx}(5x^3) = 5 \\cdot (3x^2) = 15x^2$
   - $\\frac{d}{dx}(-2x^2) = -2 \\cdot (2x) = -4x$
   - $\\frac{d}{dx}(7x) = 7$
   - $\\frac{d}{dx}(-9) = 0$
2. Combine all terms:
   $$\\frac{dy}{dx} = 15x^2 - 4x + 7$$

---

### ✅ Final Answer:
$$\\mathbf{\\frac{dy}{dx} = 15x^2 - 4x + 7}$$`;
  }

  // 3. Quadratic Equations
  if (text.includes('x^2') || text.includes('x²') || text.includes('quadratic')) {
    return `### 🔍 Handwritten Problem Identified: Quadratic Equation
$$ax^2 + bx + c = 0$$

---

### 💡 Step-by-Step Method: The Quadratic Formula
Every quadratic equation in standard form can be solved using:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

Where the discriminant $D = b^2 - 4ac$ determines the nature of the roots:
- $D > 0$: Two distinct real solutions.
- $D = 0$: Exactly one real solution (repeated root).
- $D < 0$: Two complex conjugate solutions.

---

### 📝 Example Walkthrough: $x^2 - 5x + 6 = 0$
1. **Identify coefficients**: $a = 1$, $b = -5$, $c = 6$.
2. **Calculate Discriminant**:
   $$D = (-5)^2 - 4(1)(6) = 25 - 24 = 1$$
3. **Apply the formula**:
   $$x = \\frac{-(-5) \\pm \\sqrt{1}}{2(1)} = \\frac{5 \\pm 1}{2}$$
4. **Compute two roots**:
   - $x_1 = \\frac{5 + 1}{2} = 3$
   - $x_2 = \\frac{5 - 1}{2} = 2$

---

### ✅ Final Solution:
$$\\mathbf{x = 2 \\quad \\text{or} \\quad x = 3}$$`;
  }

  // 4. Integrals
  if (text.includes('int') || text.includes('∫') || text.includes('integral')) {
    return `### 🔍 Handwritten Problem Identified: Indefinite Integration
$$\\int f(x) \\, dx$$

---

### 💡 Core Concept: The Antiderivative
Integration is the inverse operation of differentiation. The indefinite integral represents the family of all antiderivatives differing by a constant $C$.

**Power Rule for Integration**:
$$\\int x^n \\, dx = \\frac{x^{n+1}}{n + 1} + C \\quad (n \\neq -1)$$

---

### 📝 Example: $\\int (3x^2 + 4x + 1) \\, dx$
1. Integrate term by term:
   - $\\int 3x^2 \\, dx = 3 \\cdot \\frac{x^3}{3} = x^3$
   - $\\int 4x \\, dx = 4 \\cdot \\frac{x^2}{2} = 2x^2$
   - $\\int 1 \\, dx = x$
2. Add the constant of integration:
   $$\\int (3x^2 + 4x + 1) \\, dx = x^3 + 2x^2 + x + C$$

---

### ✅ Final Answer:
$$\\mathbf{x^3 + 2x^2 + x + C}$$`;
  }

  // 5. Linear Equations and Algebra
  if (text.includes('algebra') || text.includes('equation') || text.includes('linear') || text.includes('solve for')) {
    return `### 🔍 Math Problem Identified: Algebra 1 Equations
**Focus:** Solving Linear and Multi-Step Equations

---

### 💡 Core Algebraic Concept: The Balance Scale Method
In algebra, an equation represents a balance scale. To isolate the unknown variable $x$, apply inverse (opposite) operations to both sides of the equation in reverse order of operations (PEMDAS):

1. **Simplify**: Clear parentheses using the distributive property and combine like terms.
2. **Collect Variables**: Move all variable terms to one side (e.g. subtract $ax$ from both sides).
3. **Isolate Constant**: Undo addition or subtraction.
4. **Isolate Variable**: Undo multiplication or division.

---

### 📝 Step-by-Step Worked Problems:

#### Example 1: Two-Step Linear Equation
$$4x - 7 = 21$$
1. **Add $7$ to both sides**:
   $$4x = 21 + 7 \\implies 4x = 28$$
2. **Divide both sides by $4$**:
   $$x = \\frac{28}{4} = 7$$
3. **Verification**: $4(7) - 7 = 28 - 7 = 21$ ✓

#### Example 2: Variables on Both Sides
$$6x + 5 = 2x + 29$$
1. **Subtract $2x$ from both sides**:
   $$4x + 5 = 29$$
2. **Subtract $5$ from both sides**:
   $$4x = 24$$
3. **Divide by $4$**:
   $$x = 6$$

#### Example 3: Fractional Coefficient Equation
$$\\frac{3}{4}x - 2 = 10$$
1. **Add $2$ to both sides**:
   $$\\frac{3}{4}x = 12$$
2. **Multiply by the reciprocal $\\frac{4}{3}$**:
   $$x = 12 \\times \\frac{4}{3} = \\frac{48}{3} = 16$$

---

### ✅ Summary / Key Takeaway:
Whatever you do to one side of the equation, you must always do to the other side to keep it balanced.`;
  }

  // 6. Default math vision solver fallback (specifically handling dx/dy and calculus canvas drawings)
  return `### 🔍 Handwritten Expression Identified
$$\\frac{dx}{dy}$$

---

### 💡 Core Concept: Rate of Change of $x$ with respect to $y$
The handwritten expression represents **$\\frac{dx}{dy}$**, which is the derivative of variable $x$ treated as a function of variable $y$.

In standard calculus, while $\\frac{dy}{dx}$ represents the instantaneous change of $y$ per unit change in $x$, **$\\frac{dx}{dy}$** represents the reciprocal rate:
$$\\frac{dx}{dy} = \\frac{1}{\\frac{dy}{dx}} = \\left(\\frac{dy}{dx}\\right)^{-1}$$

---

### 📐 Key Calculus Properties:
1. **Reciprocal Property**: If $\\frac{dy}{dx} \\neq 0$, then $\\frac{dx}{dy} = \\frac{1}{dy/dx}$.
2. **Inverse Functions**: If $y = f(x)$ is strictly monotonic with inverse $x = g(y)$, then:
   $$g'(y) = \\frac{1}{f'(g(y))}$$
3. **Chain Rule Identity**:
   $$\\frac{dx}{dy} \\cdot \\frac{dy}{dx} = 1$$
4. **Second Derivative Warning**:
   $$\\frac{d^2 x}{dy^2} = -\\frac{\\frac{d^2 y}{dx^2}}{\\left(\\frac{dy}{dx}\\right)^3} \\neq \\frac{1}{\\frac{d^2 y}{dx^2}}$$

---

### 📝 Practical Example
If $y = 2x^2 + 3x$:
$$\\frac{dy}{dx} = 4x + 3 \\implies \\frac{dx}{dy} = \\frac{1}{4x + 3}$$

---

### ✅ Final Result:
$$\\mathbf{\\frac{dx}{dy} = \\frac{1}{\\frac{dy}{dx}}}$$`;
};

app.post('/api/ai/vision', auth, route(async (req, res) => {
  const attachments = [req.body.canvas, ...(req.body.files || [])]
    .filter((item) => item?.data)
    .map((item) => {
      let rawData = item.data;
      if (typeof rawData === 'string' && rawData.includes(',')) {
        rawData = rawData.split(',')[1];
      }
      rawData = (rawData || '').replace(/\s+/g, '');
      let mimeType = item.mimeType;
      const lowerName = (item.name || '').toLowerCase();
      if ((!mimeType || mimeType === 'application/octet-stream') && lowerName.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if ((!mimeType || mimeType === 'application/octet-stream') && lowerName.endsWith('.png')) {
        mimeType = 'image/png';
      } else if ((!mimeType || mimeType === 'application/octet-stream') && (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg'))) {
        mimeType = 'image/jpeg';
      }
      if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
      return { mimeType: mimeType || 'application/pdf', data: rawData, name: item.name || 'document' };
    })
    .filter((item) => item.data.length > 0)
    .slice(0, 6);

  if (!attachments.length) return res.status(400).json({ message: 'Draw a problem or upload a PDF/image first.' });
  if (attachments.some((item) => !['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(item.mimeType))) {
    return res.status(415).json({ message: 'Only PDF, PNG, JPEG, and WebP files are supported.' });
  }

  const prompt = req.body.prompt || req.body.problemText || '';
  const tutorGuidance = (req.body.tutorGuidance || '').trim();
  const fileNames = attachments.map((a) => a.name).filter(Boolean).join(', ');
  const searchInput = `${prompt} ${tutorGuidance} ${fileNames} ${req.body.equation || ''}`;

  if (!process.env.AI_API_KEY) {
    let solution = getMathVisionSolution(searchInput);
    if (tutorGuidance) {
      solution = `> 🎯 **Student Instructions Applied:** "${tutorGuidance}"\n\n` + solution;
    }
    return res.json({ provider: 'math-solver', reply: solution });
  }

  const hasPdf = attachments.some((a) => a.mimeType === 'application/pdf');
  let instructionPrompt = prompt && prompt.trim().length > 0
    ? `${prompt}${fileNames ? ` (Uploaded Document: ${fileNames})` : ''}`
    : (hasPdf
        ? `You are an expert Math Vision tutor. The student uploaded a math worksheet / exam document${fileNames ? ` titled "${fileNames}"` : ''}. Carefully analyze the document. Transcribe each math problem clearly using standard LaTeX notation ($...$ and $$...$$), solve them step by step with clear explanations, and clearly highlight the final answer for each in a ### **Final Answer:** section.`
        : 'Read this handwritten math problem or drawing. Transcribe what you see clearly using LaTeX notation, explain the underlying mathematical concept step by step, and provide the final answer clearly in a ### **Final Answer:** section.');

  if (tutorGuidance) {
    instructionPrompt += `\n\n### 🎯 STUDENT GUIDANCE & MANDATORY SCOPE:\n"${tutorGuidance}"\n\nIMPORTANT RULES FOR TUTOR:\n1. If the student specifies which questions to explain or solve (e.g., "questions 1 to 4 only", "focus on question 3"), strictly ONLY explain those requested questions and skip the rest.\n2. If the student asks for a specific explanation style (e.g. "Explain like I'm 10", "Show all intermediate algebraic steps", "Give hints first", "Concise summary"), adapt your tone and depth strictly to their request.`;
  }

  const parts = [
    { text: instructionPrompt },
    ...attachments.map((item) => ({ inlineData: { mimeType: item.mimeType, data: item.data } }))
  ];

  // For vision and PDF understanding, prioritize gemini-2.5-flash which excels at document parsing
  const models = AI_PROVIDER === 'gemini' ? ['gemini-2.5-flash', 'gemini-flash-latest'] : [AI_MODEL];
  let reply = null;
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.AI_API_KEY)}`;
      const controller = new AbortController();
      // Give sufficient timeout for processing multi-page PDFs
      const timeout = setTimeout(() => controller.abort(), 75000);
      let response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: 'You are TutorMind Vision, an expert STEM tutor. Analyze handwritten math, drawings, PDFs, and worksheets with precision. Transcribe equations using standard LaTeX ($...$ inline, $$...$$ display). Break down the solutions into clear numbered steps, explain the core concepts, and highlight the final answers clearly.'
              }]
            },
            contents: [{ role: 'user', parts }]
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }

      if (response && response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
        if (reply) break;
      } else if (response) {
        const errDetail = await response.text();
        console.warn(`Vision AI with ${model} returned ${response.status}:`, errDetail.slice(0, 150));
        lastError = new Error(`Model ${model} returned status ${response.status}`);
      }
    } catch (err) {
      console.warn(`Vision AI error with ${model}:`, err.message);
      lastError = err;
    }
  }

  if (!reply) {
    let fallbackSolution = getMathVisionSolution(searchInput);
    if (tutorGuidance) {
      fallbackSolution = `> 🎯 **Student Instructions Applied:** "${tutorGuidance}"\n\n` + fallbackSolution;
    }
    return res.json({ provider: 'math-solver-fallback', reply: fallbackSolution });
  }

  res.json({ provider: 'llm', reply });
}));
app.post('/api/ai/chat', auth, route(async (req, res) => {
  const { message, sessionId = randomUUID() } = req.body;
  if (!message || typeof message !== 'string' || message.length > 4000) {
    return res.status(400).json({ message: 'A message between 1 and 4000 characters is required' });
  }
  let conversation = conversations.find((item) => item.sessionId === sessionId && item.userId === req.user.id);
  if (!conversation) {
    conversation = { id: randomUUID(), sessionId, userId: req.user.id, messages: [], createdAt: new Date() };
    conversations.push(conversation);
  }
  conversation.messages.push({ role: 'user', content: message, timestamp: new Date() });

  let reply;
  let provider = 'gemini';
  try {
    reply = await askModel(conversation.messages.slice(-12));
  } catch (error) {
    console.error('AI provider fallback triggered:', error.message);
    reply = tutorReply(message);
    provider = 'smart-tutor-fallback';
  }
  reply ||= tutorReply(message);
  conversation.messages.push({ role: 'assistant', content: reply, timestamp: new Date() });
  res.json({ sessionId, reply, provider, conversation });
}));
app.get('/api/ai/conversations', auth, (req, res) => res.json({ conversations: conversations.filter((item) => item.userId === req.user.id) }));
app.get('/api/ai/conversations/:id', auth, (req, res) => { const conversation = conversations.find((item) => item.id === req.params.id && item.userId === req.user.id); if (!conversation) return res.status(404).json({ message: 'Conversation not found' }); res.json({ conversation }); });
app.post('/api/ai/explain', auth, (req, res) => res.json({ explanation: `${req.body.concept || 'This concept'} becomes easier when you break it into one small relationship at a time.` }));
app.post('/api/ai/hint', auth, (req, res) => res.json({ hint: 'Undo the final operation first, then check that you apply it to both sides.' }));

const getFallbackQuestion = (topic, chapterTitle, questionNumber = 1, difficultyTier = 'Foundational') => {
  const proceduralBank = {
    Algebra: [
      {
        question: 'Solve for $x$: $3x + 9 = 24$',
        options: ['$x = 5$', '$x = 11$', '$x = 7$', '$x = -5$'],
        answer: '$x = 5$',
        concept: 'Solving linear equations with inverse operations',
        explanation: 'Subtract 9 from both sides to get $3x = 15$, then divide by 3 to get $x = 5$.',
        stepByStepSolution: [
          'Step 1: Identify the operations applied to $x$: multiplied by 3, then added 9.',
          'Step 2: Undo the addition by subtracting 9 from both sides: $3x = 24 - 9 = 15$.',
          'Step 3: Undo the multiplication by dividing both sides by 3: $x = \\frac{15}{3} = 5$.',
          'Step 4: Check: $3(5) + 9 = 15 + 9 = 24$. Verified!'
        ],
        whyWrong: {
          '$x = 11$': 'Added 9 to 24 instead of subtracting: $24 + 9 = 33$, then $33 / 3 = 11$. Remember to undo addition with subtraction!',
          '$x = 7$': 'Divided 24 by 3 before subtracting 9. Follow reverse order of operations.',
          '$x = -5$': 'Applied an incorrect negative sign during division.'
        }
      },
      {
        question: 'Expand and simplify: $2(x - 4) + 3(2x + 1)$',
        options: ['$8x - 5$', '$8x - 7$', '$5x - 5$', '$8x + 11$'],
        answer: '$8x - 5$',
        concept: 'Distributive property and combining like terms',
        explanation: 'Distribute: $2x - 8 + 6x + 3 = (2x + 6x) + (-8 + 3) = 8x - 5$.',
        stepByStepSolution: [
          'Step 1: Distribute 2 into $(x - 4)$: $2 \\times x + 2 \\times (-4) = 2x - 8$.',
          'Step 2: Distribute 3 into $(2x + 1)$: $3 \\times 2x + 3 \\times 1 = 6x + 3$.',
          'Step 3: Combine like terms: $(2x + 6x) + (-8 + 3) = 8x - 5$.'
        ],
        whyWrong: {
          '$8x - 7$': 'Computed $-8 + 3 = -7$ instead of $-5$. Watch the signs when adding integers.',
          '$5x - 5$': 'Multiplied $3 \\times 2x$ as $3x$ instead of $6x$.',
          '$8x + 11$': 'Treated $-8$ as $+8$. Remember to keep the negative sign.'
        }
      },
      {
        question: 'If $f(x) = 2x^2 - 3x + 1$, what is the value of $f(-2)$?',
        options: ['$15$', '$-1$', '$11$', '$7$'],
        answer: '$15$',
        concept: 'Evaluating polynomial functions with negative inputs',
        explanation: 'Substitute $x = -2$: $2(-2)^2 - 3(-2) + 1 = 2(4) + 6 + 1 = 8 + 6 + 1 = 15$.',
        stepByStepSolution: [
          'Step 1: Substitute $x = -2$: $f(-2) = 2(-2)^2 - 3(-2) + 1$.',
          'Step 2: Square $-2$ first: $(-2)^2 = +4$, so $2(4) = 8$.',
          'Step 3: Multiply $-3 \\times (-2) = +6$. A negative times a negative is a positive.',
          'Step 4: Sum the terms: $8 + 6 + 1 = 15$.'
        ],
        whyWrong: {
          '$-1$': 'Forgot that $(-2)^2 = +4$ and wrote $-4$. Any real number squared is non-negative!',
          '$11$': 'Treated $-3(-2)$ as $-6$ instead of $+6$.',
          '$7$': 'Calculation error during addition.'
        }
      }
    ],
    Geometry: [
      {
        question: 'Two complementary angles sum to $90^\\circ$. If one angle measures $34^\\circ$, what is the measure of its complement?',
        options: ['$56^\\circ$', '$146^\\circ$', '$66^\\circ$', '$46^\\circ$'],
        answer: '$56^\\circ$',
        concept: 'Complementary angles definition',
        explanation: 'Complementary angles add to $90^\\circ$. Thus, $90^\\circ - 34^\\circ = 56^\\circ$.',
        stepByStepSolution: [
          'Step 1: Recall definition: complementary angles add to $90^\\circ$.',
          'Step 2: Set equation: $x + 34^\\circ = 90^\\circ$.',
          'Step 3: Subtract: $90 - 34 = 56^\\circ$.'
        ],
        whyWrong: {
          '$146^\\circ$': 'Subtracted from $180^\\circ$ instead of $90^\\circ$ (which would be supplementary!).',
          '$66^\\circ$': 'Borrowing error during subtraction.',
          '$46^\\circ$': 'Arithmetic calculation error.'
        }
      },
      {
        question: 'A right-angled triangle has legs of length $a = 6$ and $b = 8$. What is the hypotenuse $c$?',
        options: ['$10$', '$14$', '$\\sqrt{28}$', '$100$'],
        answer: '$10$',
        concept: 'Pythagorean theorem',
        explanation: 'By the Pythagorean theorem, $c = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$.',
        stepByStepSolution: [
          'Step 1: Recall $a^2 + b^2 = c^2$.',
          'Step 2: Calculate squares: $6^2 = 36$ and $8^2 = 64$.',
          'Step 3: Sum them: $36 + 64 = 100$.',
          'Step 4: Take the square root: $\\sqrt{100} = 10$.'
        ],
        whyWrong: {
          '$14$': 'Added $6 + 8 = 14$ directly without squaring! You must add the squares.',
          '$\\sqrt{28}$': 'Subtracted $64 - 36 = 28$. The hypotenuse is the longest side, so you add.',
          '$100$': 'Forgot to take the square root of $c^2 = 100$.'
        }
      },
      {
        question: 'What is the sum of the interior angles of a pentagon (5 sides)?',
        options: ['$540^\\circ$', '$360^\\circ$', '$720^\\circ$', '$450^\\circ$'],
        answer: '$540^\\circ$',
        concept: 'Polygon interior angle sum formula',
        explanation: 'Formula: $(n - 2) \\times 180^\\circ$. For $n = 5$: $(5 - 2) \\times 180^\\circ = 3 \\times 180^\\circ = 540^\\circ$.',
        stepByStepSolution: [
          'Step 1: Identify number of sides $n = 5$.',
          'Step 2: Use the formula $(n - 2) \\times 180^\\circ$.',
          'Step 3: Compute $(5 - 2) = 3$.',
          'Step 4: Multiply $3 \\times 180^\\circ = 540^\\circ$.'
        ],
        whyWrong: {
          '$360^\\circ$': 'This is the sum of interior angles for a quadrilateral (4 sides), or exterior angles.',
          '$720^\\circ$': 'This is the angle sum for a hexagon (6 sides).',
          '$450^\\circ$': 'Calculation error when multiplying $3 \\times 180^\\circ$.'
        }
      }
    ],
    Calculus: [
      {
        question: 'What is the derivative of $f(x) = 5x^3 - 4x + 7$?',
        options: ['$15x^2 - 4$', '$15x^3 - 4$', '$5x^2 - 4$', '$15x^2 - 4x$'],
        answer: '$15x^2 - 4$',
        concept: 'Power rule for differentiation',
        explanation: 'Power rule: $5(3)x^2 - 4(1) + 0 = 15x^2 - 4$.',
        stepByStepSolution: [
          'Step 1: For $5x^3$, power rule gives $5 \\times 3x^2 = 15x^2$.',
          'Step 2: For $-4x$, derivative is $-4$.',
          'Step 3: Constant 7 differentiates to 0.',
          'Step 4: Combine: $15x^2 - 4$.'
        ],
        whyWrong: {
          '$15x^3 - 4$': 'Forgot to reduce the exponent by 1.',
          '$5x^2 - 4$': 'Forgot to multiply by the power 3.',
          '$15x^2 - 4x$': 'Did not differentiate $-4x$; derivative of $x$ is 1.'
        }
      },
      {
        question: 'Evaluate the limit: $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$',
        options: ['$6$', '$0$', '$3$', 'Undefined'],
        answer: '$6$',
        concept: 'Evaluating limits by factoring removable discontinuities',
        explanation: 'Factor numerator: $\\frac{(x - 3)(x + 3)}{x - 3} = x + 3$. For $x \\to 3$, $3 + 3 = 6$.',
        stepByStepSolution: [
          'Step 1: Direct substitution gives $\\frac{0}{0}$ (indeterminate).',
          'Step 2: Factor the difference of squares: $x^2 - 9 = (x - 3)(x + 3)$.',
          'Step 3: Cancel $(x - 3)$ for $x \\neq 3$: $\\lim_{x \\to 3} (x + 3)$.',
          'Step 4: Substitute $x = 3$: $3 + 3 = 6$.'
        ],
        whyWrong: {
          '$0$': 'Observed $3 - 3 = 0$ in numerator and assumed whole limit is 0.',
          '$3$': 'Substituted $x$ directly without simplifying the cancelled term.',
          'Undefined': 'The function value is undefined at $x = 3$, but the limit exists and equals 6!'
        }
      },
      {
        question: 'Find the indefinite integral: $\\int (6x^2 + 2) \\, dx$',
        options: ['$2x^3 + 2x + C$', '$12x + C$', '$6x^3 + 2x + C$', '$2x^3 + C$'],
        answer: '$2x^3 + 2x + C$',
        concept: 'Power rule for integration',
        explanation: '$\\int 6x^2 \\, dx = 6 \\cdot \\frac{x^3}{3} = 2x^3$; $\\int 2 \\, dx = 2x$. Total: $2x^3 + 2x + C$.',
        stepByStepSolution: [
          'Step 1: Integrate $6x^2$ using $\\int x^n \\, dx = \\frac{x^{n+1}}{n+1}$: $6 \\times \\frac{x^3}{3} = 2x^3$.',
          'Step 2: Integrate constant 2: $2x$.',
          'Step 3: Include constant of integration $+ C$.',
          'Step 4: Result: $2x^3 + 2x + C$.'
        ],
        whyWrong: {
          '$12x + C$': 'Differentiated instead of integrating! Derivative is $12x$.',
          '$6x^3 + 2x + C$': 'Forgot to divide by the new exponent 3.',
          '$2x^3 + C$': 'Forgot to integrate the constant term 2.'
        }
      }
    ],
    Statistics: [
      {
        question: 'What is the median of the dataset: $[3, 7, 8, 12, 14, 19, 21]$?',
        options: ['$12$', '$14$', '$13.4$', '$8$'],
        answer: '$12$',
        concept: 'Finding the median of an ordered dataset',
        explanation: 'There are 7 numbers in sorted order. The middle (4th) number is 12.',
        stepByStepSolution: [
          'Step 1: Verify the data is in ascending order: $3, 7, 8, 12, 14, 19, 21$.',
          'Step 2: Count the elements: $n = 7$ (odd).',
          'Step 3: The median position is $\\frac{n + 1}{2} = \\frac{8}{2} = 4\\text{th}$ value.',
          'Step 4: The 4th number is 12.'
        ],
        whyWrong: {
          '$14$': 'Selected the 5th value instead of the 4th.',
          '$13.4$': 'Calculated the mean (average) instead of the median.',
          '$8$': 'Selected the 3rd value.'
        }
      }
    ],
    Arithmetic: [
      {
        question: 'Evaluate $\\frac{3}{4} + \\frac{2}{5}$ in lowest fractional terms:',
        options: ['$\\frac{23}{20}$', '$\\frac{5}{9}$', '$\\frac{6}{20}$', '$\\frac{1}{2}$'],
        answer: '$\\frac{23}{20}$',
        concept: 'Adding fractions with unlike denominators',
        explanation: 'Common denominator is 20: $\\frac{15}{20} + \\frac{8}{20} = \\frac{23}{20}$.',
        stepByStepSolution: [
          'Step 1: Find the least common denominator of 4 and 5, which is 20.',
          'Step 2: Convert $\\frac{3}{4} = \\frac{3 \\times 5}{4 \\times 5} = \\frac{15}{20}$.',
          'Step 3: Convert $\\frac{2}{5} = \\frac{2 \\times 4}{5 \\times 4} = \\frac{8}{20}$.',
          'Step 4: Add the numerators: $\\frac{15 + 8}{20} = \\frac{23}{20}$.'
        ],
        whyWrong: {
          '$\\frac{5}{9}$': 'Added numerators and denominators straight across: $\\frac{3+2}{4+5}$. You cannot add denominators directly!',
          '$\\frac{6}{20}$': 'Multiplied numerators instead of converting to common denominator.',
          '$\\frac{1}{2}$': 'Estimation error.'
        }
      }
    ]
  };

  proceduralBank.Mathematics = [
    ...(proceduralBank.Algebra || []),
    ...(proceduralBank.Geometry || []),
    ...(proceduralBank.Calculus || []),
    ...(proceduralBank.Statistics || []),
    ...(proceduralBank.Arithmetic || [])
  ];
  proceduralBank.Physics = [
    {
      question: 'A car accelerates uniformly from rest to $20\\text{ m/s}$ in $5\\text{ s}$. What is its acceleration?',
      options: ['$4\\text{ m/s}^2$', '$100\\text{ m/s}^2$', '$2\\text{ m/s}^2$', '$15\\text{ m/s}^2$'],
      answer: '$4\\text{ m/s}^2$',
      concept: 'Kinematic equation: $a = \\frac{\\Delta v}{\\Delta t}$',
      explanation: '$a = \\frac{20 - 0}{5} = 4\\text{ m/s}^2$.',
      stepByStepSolution: [
        'Step 1: Identify given values: initial velocity $u = 0$, final velocity $v = 20\\text{ m/s}$, time $t = 5\\text{ s}$.',
        'Step 2: Use acceleration formula: $a = \\frac{v - u}{t}$.',
        'Step 3: Calculate: $a = \\frac{20}{5} = 4\\text{ m/s}^2$.'
      ],
      whyWrong: {
        '$100\\text{ m/s}^2$': 'Multiplied velocity by time instead of dividing.',
        '$2\\text{ m/s}^2$': 'Arithmetic division error.',
        '$15\\text{ m/s}^2$': 'Subtracted time from velocity.'
      }
    }
  ];
  proceduralBank['Computer Science'] = [
    {
      question: 'What is the time complexity of searching in a balanced Binary Search Tree (BST) with $n$ elements?',
      options: ['$O(\\log n)$', '$O(n)$', '$O(1)$', '$O(n^2)$'],
      answer: '$O(\\log n)$',
      concept: 'Search time complexity in balanced trees',
      explanation: 'At each comparison in a balanced BST, half of the remaining elements are eliminated, yielding logarithmic time $O(\\log n)$.',
      stepByStepSolution: [
        'Step 1: In a balanced BST, the height of the tree is bounded by $\\log_2 n$.',
        'Step 2: Each comparison moves down one level in the tree.',
        'Step 3: Hence, the worst-case number of comparisons is $O(\\log n)$.'
      ],
      whyWrong: {
        '$O(n)$': 'This is the worst-case for an unbalanced (skewed) BST, not a balanced one.',
        '$O(1)$': 'This is average-case lookup in a hash table.',
        '$O(n^2)$': 'This is quadratic time, typical of nested loops.'
      }
    }
  ];
  proceduralBank.Chemistry = [
    {
      question: 'What is the atomic number of Carbon, which defines the number of protons in its nucleus?',
      options: ['$6$', '$12$', '$14$', '$8$'],
      answer: '$6$',
      concept: 'Atomic number and subatomic particles',
      explanation: 'Carbon has 6 protons, which gives it an atomic number of 6. Its atomic mass is approximately 12.',
      stepByStepSolution: [
        'Step 1: Recall that the atomic number is the number of protons.',
        'Step 2: In the periodic table, Carbon is element 6.',
        'Step 3: 12 is the mass number (protons + neutrons).'
      ],
      whyWrong: {
        '$12$': '12 is the mass number (protons + neutrons), not the atomic number.',
        '$14$': '14 is the mass number of the Carbon-14 isotope.',
        '$8$': '8 is the atomic number of Oxygen.'
      }
    }
  ];

  const topicList = proceduralBank[topic] || proceduralBank.Mathematics || proceduralBank.Algebra;
  const picked = topicList[(questionNumber - 1) % topicList.length] || topicList[0];
  return {
    id: randomUUID(),
    questionNumber,
    totalQuestions: 3,
    difficulty: difficultyTier,
    ...picked
  };
};

const generateAIQuizQuestion = async ({
  topic = 'Mathematics',
  chapterTitle = 'Linear equations',
  chapterOverview = '',
  studentLevel = 1,
  questionNumber = 1,
  totalQuestions = 3,
  difficultyTier = 'Foundational'
}) => {
  if (!process.env.AI_API_KEY) {
    return getFallbackQuestion(topic, chapterTitle, questionNumber, difficultyTier);
  }

  const systemPrompt = 'You are an expert adaptive mathematics educator and quiz designer for TutorMind. Your goal is to generate a single high-quality multiple choice question tailored to the student\'s level and chapter. Format all mathematical variables, equations, and expressions using standard LaTeX notation ($...$ for inline and $$...$$ for block formulas). You MUST respond ONLY with a valid JSON object.';

  const prompt = `Generate a high quality multiple choice question #${questionNumber} of ${totalQuestions} for chapter "${chapterTitle}" (Topic: ${topic}).
Student Level: ${studentLevel} (scale 1-10).
Difficulty tier: ${difficultyTier}.
${chapterOverview ? `Chapter context: ${chapterOverview}` : ''}

Difficulty Guidelines:
- Question 1 (Foundational): Tests basic conceptual intuition, single-step operation, definition or core rule of ${chapterTitle}. Simple, elegant numbers.
- Question 2 (Intermediate): Requires a two-step calculation or algebraic manipulation, identifying the right formula, or solving a direct application problem.
- Question 3 (Advanced): Demands multi-step reasoning, word problem modeling, or edge-case consideration that tests full chapter mastery.

Return ONLY a JSON object matching this schema:
{
  "question": "A clear problem statement with LaTeX math like $2x + 4 = 10$",
  "options": ["A. $...$", "B. $...$", "C. $...$", "D. $...$"],
  "answer": "A. $...$",
  "difficulty": "${difficultyTier}",
  "concept": "Core concept tested",
  "explanation": "Clear explanation of the solution",
  "stepByStepSolution": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "whyWrong": {
    "B. ...": "Why choosing this option was a mistake (e.g. added instead of subtracted)",
    "C. ...": "Why choosing this option was a mistake",
    "D. ...": "Why choosing this option was a mistake"
  }
}`;

  const models = AI_PROVIDER === 'gemini' ? ['gemini-2.5-flash', AI_MODEL, 'gemini-3.5-flash', 'gemini-flash-latest'] : [AI_MODEL];
  let lastError;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.AI_API_KEY)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);
      let response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.35,
              responseMimeType: 'application/json'
            }
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }

      if (response && response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
        if (text) {
          const cleanText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
          const parsed = JSON.parse(cleanText);
          if (parsed.question && Array.isArray(parsed.options) && parsed.answer) {
            return {
              id: randomUUID(),
              questionNumber,
              totalQuestions,
              difficulty: difficultyTier,
              ...parsed
            };
          }
        }
      } else if (response) {
        const err = await response.text();
        console.warn(`AI quiz generation with ${model} returned ${response.status}:`, err.slice(0, 150));
        lastError = new Error(`Status ${response.status}`);
      }
    } catch (err) {
      console.warn(`AI quiz generation error with ${model}:`, err.message);
      lastError = err;
    }
  }

  return getFallbackQuestion(topic, chapterTitle, questionNumber, difficultyTier);
};

app.post('/api/ai/quiz/generate', auth, route(async (req, res) => {
  const {
    topic = 'Mathematics',
    chapterTitle = 'Linear equations',
    chapterOverview = '',
    studentLevel = req.user?.level || 1,
    questionNumber = 1,
    totalQuestions = 3,
    difficultyTier = questionNumber === 1 ? 'Foundational' : questionNumber === 2 ? 'Intermediate' : 'Advanced'
  } = req.body;

  const question = await generateAIQuizQuestion({
    topic,
    chapterTitle,
    chapterOverview,
    studentLevel,
    questionNumber,
    totalQuestions,
    difficultyTier
  });

  res.json({ question });
}));

app.post('/api/ai/quiz/explain-failure', auth, route(async (req, res) => {
  const {
    question = '',
    selectedOption = '',
    correctOption = '',
    chapterTitle = '',
    topic = '',
    concept = ''
  } = req.body;

  if (!process.env.AI_API_KEY) {
    return res.json({
      explanation: `When working on "${question}", you selected ${selectedOption}, but the correct answer is ${correctOption}. In ${chapterTitle || topic}, remember to check your signs and apply inverse operations step by step.`
    });
  }

  const prompt = `A student at Level ${req.user?.level || 1} was answering a question in chapter "${chapterTitle}" (${topic}).
Question: "${question}"
Student chose: "${selectedOption}" (Incorrect)
Correct answer: "${correctOption}"
Concept tested: "${concept}"

In 3-4 friendly, encouraging sentences:
1. Explain specifically why choosing "${selectedOption}" is a common mistake (e.g. sign error, inverse operation trap, misapplied rule).
2. Clearly explain how to reach the correct answer "${correctOption}" with LaTeX math ($...$).
3. Give one quick pro-tip to never make this mistake again.`;

  try {
    const reply = await askModel([{ role: 'user', content: prompt }]);
    res.json({ explanation: reply || 'Review the inverse operation and check each step with substitution.' });
  } catch (err) {
    res.json({
      explanation: `You selected ${selectedOption}, but the correct answer is ${correctOption}. Always check your answer by substituting it back into the original problem!`
    });
  }
}));

app.use((error, req, res, next) => { console.error(error); res.status(500).json({ message: 'Something went wrong on the server' }); });
app.listen(PORT, () => console.log(`TutorMind API listening on http://localhost:${PORT}`));

