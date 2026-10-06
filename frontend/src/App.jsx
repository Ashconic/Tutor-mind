import React, { useEffect, useState, useRef, useMemo } from 'react';
import api from './api';
import EnhancedProfile, { getTrailing7Days, getTrailing28Days } from './ProfilePage';
import { useTranslation } from './i18n/LanguageContext';
import LanguageSelector from './components/LanguageSelector';
import MathMessage from './components/MathMessage';
import TextbookReader from './components/TextbookReader';
import AssignmentSolverModal from './components/AssignmentSolverModal';
import {
  textbookData,
  SUBJECT_ORDER,
  SUBJECT_THEMES,
  getChaptersForSubject,
  getTextbookChapterById
} from './data/textbookData';
import { AnimatePresence, motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Alert, AppBar, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, IconButton, InputAdornment, LinearProgress, List, ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select, Snackbar, Stack, TextField, Toolbar, Typography, useMediaQuery, Tooltip as MuiTooltip, Checkbox, FormControlLabel, Badge, Tab, Tabs } from '@mui/material';
import { AutoAwesome, BarChart as BarIcon, MenuBook, ChevronRight, ChevronLeft, Close, DeleteOutline, EditNote, Email, Insights, Lock, Menu, Person, Psychology, Send, Undo, UploadFile, Whatshot, SwapHoriz, Group, CheckCircle, AddCircleOutline, PersonAdd, School, Speed, Timer, Functions, Lightbulb, Quiz, Logout, Visibility, VisibilityOff, LockReset, ArrowBack, VpnKey, Assignment, CalendarToday, TaskAlt, AssignmentTurnedIn, PlayCircleOutline, YouTube, Campaign, Videocam, Call, CallEnd, AccessTime } from '@mui/icons-material';
import TeacherPortal from './TeacherPortal';
import IncomingCallDialog from './components/IncomingCallDialog';
import VirtualMeetingRoom from './components/VirtualMeetingRoom';
import VideoCallHub from './components/VideoCallHub';

// Clean up any legacy demo student data from localStorage
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('tutormind_accounts_student1@tutormind.com');
    window.localStorage.removeItem('tutormind_student_student1@tutormind.com');
    window.localStorage.removeItem('mathlingo_accounts_student1@mathlingo.com');
    window.localStorage.removeItem('mathlingo_student_student1@mathlingo.com');
    const rawSaved = window.localStorage.getItem('tutormind_saved_emails') || window.localStorage.getItem('mathlingo_saved_emails');
    if (rawSaved) {
      const parsedSaved = JSON.parse(rawSaved);
      if (Array.isArray(parsedSaved)) {
        const cleanedSaved = parsedSaved.filter(
          (e) => e && e.toLowerCase() !== 'student1@tutormind.com' && e.toLowerCase() !== 'student1@mathlingo.com'
        );
        if (cleanedSaved.length !== parsedSaved.length) {
          window.localStorage.setItem('tutormind_saved_emails', JSON.stringify(cleanedSaved));
          window.localStorage.setItem('mathlingo_saved_emails', JSON.stringify(cleanedSaved));
        }
      }
    }
    const storedUser = window.localStorage.getItem('tutormind-user') || window.localStorage.getItem('mathlingo-user');
    if (storedUser) {
      const parsedU = JSON.parse(storedUser);
      if (parsedU?.email && (parsedU.email.toLowerCase() === 'student1@tutormind.com' || parsedU.email.toLowerCase() === 'student1@mathlingo.com')) {
        window.localStorage.removeItem('tutormind-user');
        window.localStorage.removeItem('tutormind-token');
        window.localStorage.removeItem('mathlingo-user');
        window.localStorage.removeItem('mathlingo-token');
      }
    }
  }
} catch {}

// --- Multi-Account and Email Suggestion Helpers ---
export function getSavedEmails() {
  try {
    const list = JSON.parse(localStorage.getItem('tutormind_saved_emails') || localStorage.getItem('mathlingo_saved_emails') || '[]');
    return list.filter((e) => {
      if (!e) return false;
      const clean = e.toLowerCase().trim();
      if (clean === 'student1@tutormind.com' || clean === 'student1@mathlingo.com' || clean.includes('example.com') || clean.startsWith('test_')) return false;
      return true;
    });
  } catch {
    return [];
  }
}

export function saveEmailToHistory(email) {
  if (!email) return;
  const clean = email.trim().toLowerCase();
  if (clean === 'student1@tutormind.com' || clean === 'student1@mathlingo.com' || clean.includes('example.com') || clean.startsWith('test_')) return;
  try {
    const list = getSavedEmails();
    if (!list.includes(clean)) {
      list.unshift(clean);
      localStorage.setItem('tutormind_saved_emails', JSON.stringify(list.slice(0, 10)));
      localStorage.setItem('mathlingo_saved_emails', JSON.stringify(list.slice(0, 10)));
    }
  } catch {}
}

export function getAccountsForEmail(email) {
  if (!email) return [];
  const clean = email.trim().toLowerCase();
  if (clean === 'student1@tutormind.com' || clean === 'student1@mathlingo.com' || clean.includes('example.com') || clean.startsWith('test_')) return [];
  try {
    const raw = localStorage.getItem(`tutormind_accounts_${clean}`) || localStorage.getItem(`mathlingo_accounts_${clean}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Migration check for legacy mathlingo_student_${email}
    const legacy = localStorage.getItem(`tutormind_student_${clean}`) || localStorage.getItem(`mathlingo_student_${clean}`);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      parsed.accountId = parsed.accountId || '1';
      parsed.accountName = parsed.accountName || 'Learner 1';
      localStorage.setItem(`tutormind_accounts_${clean}`, JSON.stringify([parsed]));
      localStorage.setItem(`mathlingo_accounts_${clean}`, JSON.stringify([parsed]));
      return [parsed];
    }
    return [];
  } catch {
    return [];
  }
}

export function saveAccountsForEmail(email, accounts) {
  if (!email) return;
  const clean = email.trim().toLowerCase();
  try {
    localStorage.setItem(`tutormind_accounts_${clean}`, JSON.stringify(accounts.slice(0, 2)));
    localStorage.setItem(`mathlingo_accounts_${clean}`, JSON.stringify(accounts.slice(0, 2)));
    saveEmailToHistory(clean);
  } catch {}
}

export function createNewLearnerProfile(name, email, accountId = '1', customProps = {}) {
  const cleanEmail = email.trim().toLowerCase();
  const displayName = name?.trim() || (accountId === '2' ? 'Second Learner' : cleanEmail.split('@')[0]);
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || (accountId === '2' ? 'L2' : 'L1');

  const todayStr = new Date().toISOString().split('T')[0];
  return {
    accountId,
    accountName: accountId === '2' ? 'Learner 2' : 'Learner 1',
    name: displayName,
    email: cleanEmail,
    initials,
    avatarBg: accountId === '2' ? '#84b98a' : '#ec735e',
    avatarColor: accountId === '2' ? '#16331a' : '#ffffff',
    xp: 0,
    streak: 0,
    completedChapters: 0,
    completedChapterIds: [],
    problemsSolved: 0,
    accuracy: 100,
    focusMinutes: 0,
    dailyGoal: 50,
    favoriteTopic: 'Mathematics',
    topicProgress: { Mathematics: 0, Physics: 0, 'Computer Science': 0, Chemistry: 0 },
    dailyActivity: {
      [todayStr]: { minutes: 0, xp: 0, problemsSolved: 0 }
    },
    createdDate: new Date().toISOString(),
    lastActiveDate: todayStr,
    recentActivity: [
      {
        id: Date.now(),
        icon: '✦',
        iconBg: '#eee8fb',
        iconColor: '#6f56b0',
        title: accountId === '2' ? 'Second Learner Profile Created' : 'Account Created',
        topic: 'Welcome to TutorMind',
        time: 'Just now',
        xp: '+0 XP',
        badge: 'Welcome'
      }
    ],
    ...customProps
  };
}

const lessons=[{id:1,title:'Linear equations',topic:'Mathematics',difficulty:3,xp:50,done:true,desc:'Solve for unknowns using inverse operations.'},{id:2,title:'Quadratic patterns',topic:'Mathematics',difficulty:4,xp:60,desc:'Recognize and factor common quadratic forms.'},{id:3,title:'Angles in motion',topic:'Mathematics',difficulty:2,xp:40,desc:'Use angle relationships to map a shape.'},{id:4,title:'Area and perimeter',topic:'Mathematics',difficulty:3,xp:45,done:true,desc:'Measure the world with reliable formulas.'},{id:5,title:'Limits, intuitively',topic:'Mathematics',difficulty:5,xp:80,desc:'See what a function approaches before it arrives.'},{id:6,title:'Probability basics',topic:'Mathematics',difficulty:2,xp:35,desc:'Make better predictions from simple events.'},{id:7,title:'Fractions to decimals',topic:'Mathematics',difficulty:1,xp:30,desc:'Move between representations with confidence.'}];

const mathCatalogChapters = [
  ['Basic operations','Add, subtract, multiply, divide','Build accuracy and fluency with everyday numbers.'],
  ['Fractions','Parts of a whole','Compare, simplify, and operate on fractions.'],
  ['Decimals','Place value','Move confidently between decimal representations.'],
  ['Percentages','Parts per hundred','Connect percentages to fractions and real situations.'],
  ['Word problems','Mathematics in context','Translate a real situation into a solvable plan.'],
  ['Foundations of variables','Variables, constants, and coefficients','Learn how symbols represent unknown values.'],
  ['Expressions and simplification','Order of operations and like terms','Turn messy expressions into clear, equivalent forms.'],
  ['Linear equations','Balance and inverse operations','Solve for an unknown one careful step at a time.'],
  ['Quadratic equations','Factors, roots, and patterns','Recognize the structure behind second-degree equations.'],
  ['Inequalities','Comparing quantities','Represent solution sets on a number line.'],
  ['Shapes and their properties','Points, lines, and polygons','Name shapes by their defining properties.'],
  ['Angles','Measuring turns','Use degrees and angle relationships to reason.'],
  ['Area and perimeter','Inside space and boundaries','Choose the right formula for a two-dimensional shape.'],
  ['Volume','Space in three dimensions','Measure what a solid object can hold.'],
  ['Trigonometry','Triangles and ratios','Connect angles to side lengths in right triangles.'],
  ['Limits','Approaching a value','Understand what a function gets close to.'],
  ['Derivatives','Rate of change','Measure how quickly a quantity changes.'],
  ['Integrals','Accumulation','Build a total from many small pieces.'],
  ['Differential equations','Change and relationships','Model how a system evolves over time.'],
  ['Mean, median, and mode','Describing a dataset','Summarize data without losing its story.'],
  ['Probability','Measuring chance','Compare favorable outcomes with all possible outcomes.'],
  ['Data distributions','Shape and spread','Read patterns, variation, and outliers.'],
  ['Hypothesis testing','Evidence and decisions','Use data to test a claim carefully.']
];

const chapterCatalog = {
  Mathematics: mathCatalogChapters,
  Physics: [
    ['Kinematics and motion','1D/2D kinematics & motion equations','Master displacement, velocity, acceleration, and projectile motion.'],
    ['Newton laws and forces','Dynamics and free body diagrams','Explore inertia, net force, action-reaction pairs, and friction.'],
    ['Work energy and power','Conservation laws & mechanical energy','Calculate work, kinetic energy, potential energy, and power output.'],
    ['Waves sound and light','Oscillations, optics, and wave mechanics','Understand wave speed, frequency, superposition, and Snell’s law.']
  ],
  'Computer Science': [
    ['Algorithms and Big-O','Complexity analysis and search/sort','Measure asymptotic performance, divide-and-conquer, and sorting algorithms.'],
    ['Data structures','Arrays, lists, stacks, trees & hash tables','Choose the right structures for constant-time lookup and traversal.'],
    ['Binary and digital logic','Bits, bytes, logic gates, and arithmetic','Understand boolean algebra, two’s complement, and digital circuit design.'],
    ['Recursion and divide-conquer','Base cases, recursive call stacks & trees','Solve complex problems by breaking them into self-similar subproblems.']
  ],
  Chemistry: [
    ['Atomic structure and periodic table','Subatomic particles & electron orbitals','Examine protons, neutrons, electrons, electron configuration, and periodic trends.'],
    ['Chemical bonding and molecules','Ionic, covalent, and metallic bonds','Analyze valence electrons, Lewis structures, electronegativity, and molecular geometry.'],
    ['Stoichiometry and reactions','Mole concept & reaction balancing','Convert between grams, moles, and particles to predict chemical yields.'],
    ['Thermodynamics and acids','Enthalpy, entropy, pH and neutralization','Explore exothermic/endothermic heat, equilibrium, and acid-base equilibria.']
  ],
  // Fallback branches for backwards compatibility:
  Algebra: mathCatalogChapters.slice(5, 10),
  Geometry: mathCatalogChapters.slice(10, 15),
  Calculus: mathCatalogChapters.slice(15, 19),
  Statistics: mathCatalogChapters.slice(19, 23),
  Arithmetic: mathCatalogChapters.slice(0, 5)
};
const chapterQuizzes={'Shapes and their properties':{question:'How many sides does a triangle have?',options:['2','3','4','5'],answer:'3'},Angles:{question:'A right angle measures how many degrees?',options:['45°','90°','180°','360°'],answer:'90°'},'Area and perimeter':{question:'What is the area of a 5 × 4 rectangle?',options:['9','18','20','25'],answer:'20'},Volume:{question:'What unit measures the space inside a solid?',options:['Square units','Cubic units','Degrees','Percent'],answer:'Cubic units'},Trigonometry:{question:'In a right triangle, what is the longest side called?',options:['Base','Leg','Radius','Hypotenuse'],answer:'Hypotenuse'},Limits:{question:'A limit describes what a function...',options:['Starts with','Approaches','Multiplies by','Never reaches'],answer:'Approaches'},Derivatives:{question:'A derivative measures...',options:['Total area','Rate of change','Probability','Perimeter'],answer:'Rate of change'},Integrals:{question:'An integral is commonly used to find...',options:['Accumulation','A password','An angle only','A prime number'],answer:'Accumulation'},Probability:{question:'What is the probability of heads on a fair coin?',options:['0%','25%','50%','100%'],answer:'50%'},'Mean, median, and mode':{question:'What is the mean of 2, 4, and 6?',options:['2','4','6','12'],answer:'4'},Fractions:{question:'What is 1/2 as a decimal?',options:['0.2','0.5','1.2','2.0'],answer:'0.5'},Decimals:{question:'What is 0.7 + 0.2?',options:['0.09','0.5','0.9','9'],answer:'0.9'},Percentages:{question:'What is 10% of 50?',options:['0.5','5','10','50'],answer:'5'},'Linear equations':{question:'If 2x + 4 = 14, what is x?',options:['5','6','7','9'],answer:'5'}};
const chapterGuides={'Shapes and their properties':{idea:'Shapes are classified by their sides, vertices, and angles.',visual:'△  triangle  →  3 sides  ·  3 vertices',steps:['Count the straight sides','Mark each corner, called a vertex','Use those properties to name the shape']},Angles:{idea:'An angle measures the amount of turn between two rays.',visual:'────┐  90°\n    │  right angle',steps:['Find the vertex where the rays meet','Compare the turn with a right angle','Measure in degrees']},'Area and perimeter':{idea:'Area is the inside space; perimeter is the distance around the outside.',visual:'┌────────┐\n│  area  │  5 × 4 = 20\n└────────┘  perimeter = 2(5 + 4) = 18',steps:['Choose the correct formula','Substitute the measurements','Label square units for area']},Volume:{idea:'Volume measures the three-dimensional space inside a solid.',visual:'cube:  3 × 3 × 3 = 27 cubic units',steps:['Identify length, width, and height','Multiply the three dimensions','Write the answer in cubic units']},Trigonometry:{idea:'Right-triangle ratios connect an angle to its side lengths.',visual:'        /|  c = hypotenuse\n       / |\n      /__|  opposite / adjacent',steps:['Identify the right angle','Name the sides relative to your angle','Choose sine, cosine, or tangent']},Limits:{idea:'A limit describes the value a function approaches near a point.',visual:'x → 2   ·····  f(x) → 4',steps:['Move toward the input from both sides','Look for the output pattern','State the value approached']},Derivatives:{idea:'A derivative is the instant rate of change, like the slope of a curve.',visual:'rise / run  =  slope  =  rate of change',steps:['Identify what changes','Find the slope at the point','Interpret the result with units']},Integrals:{idea:'An integral adds many tiny pieces to find a total accumulation.',visual:'▁▂▃▄▅  tiny pieces  →  total area',steps:['Choose the quantity being accumulated','Add the small changes','Interpret the total']},Probability:{idea:'Probability compares favorable outcomes with all possible outcomes.',visual:'P(event) = favorable outcomes / total outcomes',steps:['List all possible outcomes','Count the favorable outcomes','Divide and express the result']},'Mean, median, and mode':{idea:'These measures summarize the center of a dataset.',visual:'2 · 4 · 6   mean = (2 + 4 + 6) / 3 = 4',steps:['Mean: add and divide','Median: find the middle','Mode: find the most frequent']},Fractions:{idea:'A fraction represents equal parts of a whole and can be converted to a decimal.',visual:'1/2  =  1 ÷ 2  =  0.5',steps:['Read the numerator as selected parts','Read the denominator as total equal parts','Divide to convert to a decimal']},Decimals:{idea:'Decimal place value shows tenths, hundredths, and smaller parts.',visual:'0.7 + 0.2  =  0.9',steps:['Align decimal points','Add each place value','Bring the decimal point straight down']},Percentages:{idea:'A percentage is a number out of one hundred.',visual:'10%  =  10/100  =  0.10',steps:['Convert the percent to a fraction','Simplify or convert to a decimal','Multiply by the whole amount']},'Linear equations':{idea:'An equation is a balance. The same operation must happen on both sides.',visual:'2x + 4 = 14  →  2x = 10  →  x = 5',steps:['Undo addition or subtraction','Undo multiplication or division','Check the answer in the original equation']}};
const activity=[{day:'Mon',minutes:18},{day:'Tue',minutes:27},{day:'Wed',minutes:21},{day:'Thu',minutes:31},{day:'Fri',minutes:25},{day:'Sat',minutes:38},{day:'Sun',minutes:19}];
const topics=[['Mathematics',70,'#ec735e'],['Physics',65,'#4f46e5'],['Computer Science',70,'#0d9488'],['Chemistry',55,'#e11d48']];
const nav=[['overview','Overview',Insights],['assignments','Assignments',Assignment],['learn','Learn',MenuBook],['tutor','Ask TutorMind Tutor',Psychology],['videocall','Video Call Teacher',Videocam],['vision','Math Vision',EditNote],['analytics','Analytics',BarIcon],['profile','Profile',Person]];
const fade={hidden:{opacity:0,y:12},show:{opacity:1,y:0,transition:{duration:.35}}};
const Panel=({children,sx={}})=><Card sx={{border:'1px solid #e6e2d9',boxShadow:'0 10px 30px rgba(44,39,27,.055)',background:'#fffdf8',minWidth:0,boxSizing:'border-box',...sx}}><CardContent>{children}</CardContent></Card>;
const Eyebrow=({children})=><Typography sx={{fontFamily:'DM Mono, monospace',fontSize:10,letterSpacing:1,color:'#9b9991',mb:1}}>{children}</Typography>;

function getPasswordStrength(pwd = '') {
  if (!pwd) return { score: 0, label: '', color: '#e0e0e0' };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 8) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd) || (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd))) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#e53935' };
  if (score === 2) return { score: 2, label: 'Fair', color: '#fb8c00' };
  if (score === 3) return { score: 3, label: 'Good', color: '#1e88e5' };
  return { score: 4, label: 'Strong', color: '#43a047' };
}

function Login({ onLogin, onOpenTeacherPortal }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('signin'); // 'signin' | 'register_new' | 'register_second' | 'forgot_password'
  const [selectedAccountId, setSelectedAccountId] = useState('1');
  const [savedEmails, setSavedEmails] = useState(() => getSavedEmails());

  // Forgot password & reset state
  const [resetState, setResetState] = useState({
    step: 1, // 1: request code, 2: enter code & new password
    code: '',
    newPassword: '',
    confirmNewPassword: '',
    demoCodeHint: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const cleanEmail = (email || '').trim().toLowerCase();
  const existingAccounts = cleanEmail.includes('@') ? getAccountsForEmail(cleanEmail) : [];
  const isMaxAccounts = existingAccounts.length >= 2;

  // Auto-sync selected account if accounts list changes
  useEffect(() => {
    if (existingAccounts.length > 0) {
      if (!existingAccounts.some((acc) => (acc.accountId || '1') === selectedAccountId)) {
        setSelectedAccountId(existingAccounts[0].accountId || '1');
      }
    }
  }, [cleanEmail]);

  const handleKeyModifier = (e) => {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  };

  const handleSelectSavedEmail = (savedMail) => {
    setEmail(savedMail);
    setError('');
    setSuccess('');
    const accs = getAccountsForEmail(savedMail);
    if (accs.length > 0) {
      setSelectedAccountId(accs[0].accountId || '1');
      setMode('signin');
    }
  };

  const handleCreateSecondLearner = () => {
    if (isMaxAccounts) {
      setError(t('auth.max_accounts_reached') || 'Maximum 2 learner accounts allowed per email.');
      return;
    }
    setMode('register_second');
    setName('');
    setError('');
    setSuccess('');
  };

  const handleRequestResetCode = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(t('auth.invalid_email') || 'Please enter a valid email address.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: cleanEmail });
      setResetState((prev) => ({
        ...prev,
        step: 2,
        demoCodeHint: res.data?.code || '123456'
      }));
      setSuccess(`Verification code generated! Code: ${res.data?.code || '123456'}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!resetState.code.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!resetState.newPassword || resetState.newPassword.length < 6) {
      setError(t('auth.invalid_password') || 'New password must be at least 6 characters.');
      return;
    }
    if (resetState.newPassword !== resetState.confirmNewPassword) {
      setError(t('auth.passwords_dont_match') || 'New password and confirmation do not match.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: cleanEmail,
        code: resetState.code.trim(),
        newPassword: resetState.newPassword
      });

      setSuccess('🎉 Password updated successfully! You can now sign in with your new password.');
      setPassword(resetState.newPassword);
      setConfirmPassword(resetState.newPassword);
      setMode('signin');
      setResetState({ step: 1, code: '', newPassword: '', confirmNewPassword: '', demoCodeHint: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(t('auth.invalid_email'));
      return;
    }
    if (!password || password.length < 6) {
      setError(t('auth.invalid_password'));
      return;
    }
    if (mode === 'register_new' || mode === 'register_second') {
      if (!name.trim()) {
        setError(t('auth.enter_name'));
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setError(t('auth.passwords_dont_match') || 'Passwords do not match.');
        return;
      }
    }
    if (mode === 'register_second' && isMaxAccounts) {
      setError(t('auth.max_accounts_reached') || 'Maximum 2 learner accounts reached for this email.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register_new' || mode === 'register_second') {
        const targetAccountId = mode === 'register_second' ? '2' : (existingAccounts.length === 1 ? '2' : '1');

        let token = `token_${Date.now()}`;
        try {
          const res = await api.post('/auth/register', {
            username: name.trim(),
            name: name.trim(),
            email: cleanEmail,
            password
          });
          if (res?.data?.token) token = res.data.token;
        } catch (err) {
          if (err.response?.status !== 409) {
            // pass
          }
        }

        const newProfile = createNewLearnerProfile(name.trim(), cleanEmail, targetAccountId);
        const currentAccounts = getAccountsForEmail(cleanEmail);
        const updatedAccounts = currentAccounts.filter((acc) => (acc.accountId || '1') !== targetAccountId);
        updatedAccounts.push(newProfile);
        saveAccountsForEmail(cleanEmail, updatedAccounts);

        localStorage.setItem('tutormind-user', JSON.stringify(newProfile));
        localStorage.setItem('tutormind-token', token);
        localStorage.setItem('mathlingo-user', JSON.stringify(newProfile));
        localStorage.setItem('mathlingo-token', token);
        if (rememberMe) {
          saveEmailToHistory(cleanEmail);
          setSavedEmails(getSavedEmails());
        }
        api.post('/auth/student-session', { student: newProfile, event: 'register' }).catch(() => {});
        onLogin(newProfile);
      } else {
        // Sign In
        let token = `token_${Date.now()}`;
        let backendUser = null;
        try {
          const res = await api.post('/auth/login', { email: cleanEmail, password });
          if (res?.data?.token) token = res.data.token;
          if (res?.data?.user) backendUser = res.data.user;
        } catch (err) {
          if (err.response?.status === 401) {
            const accs = getAccountsForEmail(cleanEmail);
            if (accs.length === 0) {
              setError(err.response?.data?.message || t('auth.invalid_password'));
              setLoading(false);
              return;
            }
          }
        }

        const accs = getAccountsForEmail(cleanEmail);
        let activeProfile = accs.find((acc) => (acc.accountId || '1') === selectedAccountId);

        if (!activeProfile && accs.length > 0) {
          activeProfile = accs[0];
        }

        if (!activeProfile) {
          activeProfile = createNewLearnerProfile(
            backendUser?.name || cleanEmail.split('@')[0],
            cleanEmail,
            '1'
          );
          saveAccountsForEmail(cleanEmail, [activeProfile]);
        }

        if (backendUser) {
          activeProfile = { ...activeProfile, ...backendUser };
        }

        localStorage.setItem('tutormind-user', JSON.stringify(activeProfile));
        localStorage.setItem('tutormind-token', token);
        localStorage.setItem('mathlingo-user', JSON.stringify(activeProfile));
        localStorage.setItem('mathlingo-token', token);
        if (rememberMe) {
          saveEmailToHistory(cleanEmail);
          setSavedEmails(getSavedEmails());
        }
        await api.post('/auth/student-session', { student: activeProfile, event: 'login' }).catch(() => {});
        onLogin(activeProfile);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProfileObj = existingAccounts.find((acc) => (acc.accountId || '1') === selectedAccountId);
  const activeStrength = getPasswordStrength(mode === 'forgot_password' ? resetState.newPassword : password);

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: { xs: 1.5, sm: 3 }, background: '#f7f5ef' }}>
      <Paper
        sx={{
          width: 'min(500px, 100%)',
          p: { xs: 2.5, sm: 4 },
          border: '1px solid #e6e2d9',
          background: '#fffdf8',
          borderRadius: 3.5,
          boxShadow: '0 14px 40px rgba(32,33,31,0.06)'
        }}
      >
        {/* Top Header with Brand Logo and Language Selector */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Avatar sx={{ bgcolor: '#ec735e', borderRadius: 2, width: 38, height: 38, fontWeight: 800 }}>T</Avatar>
            <Typography fontWeight={800} fontSize={20}>
              Tutor<span style={{ color: '#ec735e' }}>Mind</span>
            </Typography>
          </Stack>
          <LanguageSelector />
        </Stack>

        {/* Tab Toggle: Sign In vs Create Account (when not resetting password) */}
        {mode !== 'forgot_password' && mode !== 'register_second' && (
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              p: 0.5,
              mb: 3,
              bgcolor: '#f2eee6',
              borderRadius: 2.5,
              border: '1px solid #e5e0d5'
            }}
          >
            <Button
              fullWidth
              size="small"
              onClick={() => {
                setMode('signin');
                setError('');
                setSuccess('');
              }}
              sx={{
                borderRadius: 2,
                py: 0.8,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: mode === 'signin' ? '#ffffff' : 'transparent',
                color: mode === 'signin' ? '#20211f' : '#77756f',
                boxShadow: mode === 'signin' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                '&:hover': { bgcolor: mode === 'signin' ? '#ffffff' : '#e8e4dc' }
              }}
            >
              {t('auth.sign_in_btn') || 'Sign In'}
            </Button>
            <Button
              fullWidth
              size="small"
              onClick={() => {
                if (isMaxAccounts) {
                  setError('This email already has 2 learner profiles. Please sign in or switch profiles.');
                  return;
                }
                setMode(existingAccounts.length === 1 ? 'register_second' : 'register_new');
                setError('');
                setSuccess('');
              }}
              sx={{
                borderRadius: 2,
                py: 0.8,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: mode !== 'signin' ? '#ffffff' : 'transparent',
                color: mode !== 'signin' ? '#20211f' : '#77756f',
                boxShadow: mode !== 'signin' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                '&:hover': { bgcolor: mode !== 'signin' ? '#ffffff' : '#e8e4dc' }
              }}
            >
              {t('auth.create_account_title') || 'Create Account'}
            </Button>
          </Paper>
        )}

        {/* Header Titles */}
        {mode === 'forgot_password' ? (
          <Box mb={2.5}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <LockReset sx={{ color: '#ec735e', fontSize: 24 }} />
              <Typography variant="h5" fontWeight={800} fontSize={{ xs: 20, sm: 24 }}>
                {t('auth.reset_password_title') || 'Reset Password'}
              </Typography>
            </Stack>
            <Typography color="text.secondary" fontSize={13}>
              {resetState.step === 1
                ? (t('auth.reset_password_sub') || 'Enter your registered email address to receive a verification code and create a new password.')
                : `Step 2: Enter the 6-digit code sent to ${cleanEmail} and choose your new password.`}
            </Typography>
          </Box>
        ) : (
          <Box mb={2}>
            <Eyebrow>
              {mode === 'register_second'
                ? 'LEARNER PROFILE 2 (MAX 2)'
                : mode === 'register_new'
                ? t('auth.create_account_title').toUpperCase()
                : t('auth.welcome_back').toUpperCase()}
            </Eyebrow>

            <Typography variant="h4" mb={0.5} fontWeight={800} fontSize={{ xs: 22, sm: 26 }}>
              {mode === 'register_second'
                ? 'Add 2nd Learner Account'
                : mode === 'register_new'
                ? t('auth.create_account_title')
                : t('auth.welcome_back')}
            </Typography>

            <Typography color="text.secondary" fontSize={13}>
              {mode === 'register_second'
                ? 'Set up a distinct profile with independent XP, progress, and streak for this email.'
                : mode === 'register_new'
                ? t('auth.create_account_sub')
                : t('auth.sign_in_sub')}
            </Typography>
          </Box>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 2, fontSize: 12, borderRadius: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: 12, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Caps Lock Warning Banner */}
        {capsLock && (
          <Alert severity="warning" icon={false} sx={{ mb: 2, py: 0.2, px: 1.5, fontSize: 11, borderRadius: 2, bgcolor: '#fff4e5' }}>
            ⚠️ <b>Caps Lock is ON</b>. Please check your casing.
          </Alert>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW A: FORGOT PASSWORD RESET WORKFLOW                        */}
        {/* ------------------------------------------------------------- */}
        {mode === 'forgot_password' ? (
          <Box>
            {resetState.step === 1 ? (
              <Stack component="form" onSubmit={handleRequestResetCode} spacing={2}>
                <TextField
                  label={t('auth.email_label')}
                  type="email"
                  placeholder={t('auth.email_placeholder')}
                  fullWidth
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ fontSize: 18, color: '#9b9991' }} />
                      </InputAdornment>
                    )
                  }}
                  required
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    bgcolor: '#ec735e',
                    py: 1.2,
                    fontWeight: 700,
                    fontSize: 13,
                    '&:hover': { bgcolor: '#d95f4c' }
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : (t('auth.send_code_btn') || 'Send 6-Digit Verification Code')}
                </Button>

                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => {
                    setMode('signin');
                    setError('');
                    setSuccess('');
                  }}
                  sx={{ color: '#77756f', fontSize: 12, textTransform: 'none' }}
                >
                  {t('auth.back_to_signin') || 'Back to Sign In'}
                </Button>
              </Stack>
            ) : (
              <Stack component="form" onSubmit={handleResetPasswordSubmit} spacing={2}>
                {/* Demo Code Auto-fill Chip */}
                {resetState.demoCodeHint && (
                  <Paper sx={{ p: 1.2, bgcolor: '#fbf9f4', border: '1px dashed #ec735e', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography fontSize={11} fontWeight={700} color="#ec735e">
                        Demo Verification Code: <b>{resetState.demoCodeHint}</b>
                      </Typography>
                      <Typography fontSize={10} color="text.secondary">
                        Click chip to auto-populate code into input
                      </Typography>
                    </Box>
                    <Chip
                      label={`Use ${resetState.demoCodeHint}`}
                      size="small"
                      clickable
                      onClick={() => setResetState((prev) => ({ ...prev, code: prev.demoCodeHint }))}
                      sx={{ bgcolor: '#ec735e', color: '#fff', fontSize: 11, fontWeight: 700 }}
                    />
                  </Paper>
                )}

                <TextField
                  label={t('auth.enter_code') || '6-Digit Verification Code'}
                  placeholder="e.g., 123456"
                  fullWidth
                  size="small"
                  value={resetState.code}
                  onChange={(e) => setResetState((prev) => ({ ...prev, code: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKey sx={{ fontSize: 18, color: '#9b9991' }} />
                      </InputAdornment>
                    )
                  }}
                  required
                  autoFocus
                />

                <TextField
                  label={t('auth.new_password') || 'New Password'}
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  fullWidth
                  size="small"
                  value={resetState.newPassword}
                  onChange={(e) => setResetState((prev) => ({ ...prev, newPassword: e.target.value }))}
                  onKeyDown={handleKeyModifier}
                  onKeyUp={handleKeyModifier}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ fontSize: 18, color: '#9b9991' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowNewPassword(!showNewPassword)} edge="end" aria-label="Toggle password visibility">
                          {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  required
                />

                <TextField
                  label={t('auth.confirm_password') || 'Confirm New Password'}
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  fullWidth
                  size="small"
                  value={resetState.confirmNewPassword}
                  onChange={(e) => setResetState((prev) => ({ ...prev, confirmNewPassword: e.target.value }))}
                  onKeyDown={handleKeyModifier}
                  onKeyUp={handleKeyModifier}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ fontSize: 18, color: '#9b9991' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} edge="end" aria-label="Toggle password visibility">
                          {showConfirmNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  required
                />

                {/* Password Strength Meter */}
                {resetState.newPassword && (
                  <Box sx={{ mt: -0.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography fontSize={11} color="text.secondary">Password Strength:</Typography>
                      <Typography fontSize={11} fontWeight={700} sx={{ color: activeStrength.color }}>
                        {activeStrength.label}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      {[1, 2, 3, 4].map((step) => (
                        <Box
                          key={step}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 1,
                            bgcolor: step <= activeStrength.score ? activeStrength.color : '#e0e0e0',
                            transition: 'all 0.2s ease'
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    bgcolor: '#ec735e',
                    py: 1.2,
                    fontWeight: 700,
                    fontSize: 13,
                    '&:hover': { bgcolor: '#d95f4c' }
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : (t('auth.change_password_btn') || 'Reset & Save New Password')}
                </Button>

                <Stack direction="row" justifyContent="space-between">
                  <Button
                    size="small"
                    onClick={() => setResetState((prev) => ({ ...prev, step: 1 }))}
                    sx={{ color: '#77756f', fontSize: 11, textTransform: 'none' }}
                  >
                    ← Change Email
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setSuccess('');
                    }}
                    sx={{ color: '#77756f', fontSize: 11, textTransform: 'none' }}
                  >
                    {t('auth.back_to_signin') || 'Back to Sign In'}
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        ) : (
          /* ------------------------------------------------------------- */
          /* VIEW B: SIGN IN & CREATE ACCOUNT WORKFLOWS                    */
          /* ------------------------------------------------------------- */
          <Box>
            {/* Email Suggestions Bar */}
            {savedEmails.length > 0 && (
              <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#fbf9f4', borderRadius: 2, border: '1px solid #ece8de' }}>
                <Typography fontSize={11} fontWeight={700} color="#73726a" mb={1} display="flex" alignItems="center" gap={0.5}>
                  💡 {t('auth.saved_emails') || 'Saved Emails on this device:'}
                </Typography>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {savedEmails.map((saved) => (
                    <Chip
                      key={saved}
                      label={saved}
                      size="small"
                      onClick={() => handleSelectSavedEmail(saved)}
                      color={cleanEmail === saved.toLowerCase() ? 'primary' : 'default'}
                      variant={cleanEmail === saved.toLowerCase() ? 'filled' : 'outlined'}
                      sx={{
                        fontSize: 11,
                        cursor: 'pointer',
                        bgcolor: cleanEmail === saved.toLowerCase() ? '#ec735e' : '#fff',
                        borderColor: cleanEmail === saved.toLowerCase() ? '#ec735e' : '#e6e2d9',
                        color: cleanEmail === saved.toLowerCase() ? '#fff' : '#333'
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Display Accounts for entered email (Max 2 accounts) */}
            {existingAccounts.length > 0 && mode !== 'register_second' && (
              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography fontSize={11} fontWeight={700} color="#73726a">
                    {t('auth.accounts_for_email', { email: cleanEmail }) || `Learner Profiles for ${cleanEmail} (Max 2)`}
                  </Typography>
                  <Chip
                    label={`${existingAccounts.length}/2 Accounts`}
                    size="small"
                    sx={{
                      fontSize: 10,
                      height: 20,
                      bgcolor: existingAccounts.length >= 2 ? '#fff0eb' : '#f0f7ee',
                      color: existingAccounts.length >= 2 ? '#ec735e' : '#2e7d32',
                      fontWeight: 700
                    }}
                  />
                </Stack>

                <Stack spacing={1.2}>
                  {existingAccounts.map((acc) => {
                    const accId = acc.accountId || '1';
                    const isSelected = selectedAccountId === accId && mode === 'signin';
                    return (
                      <Paper
                        key={accId}
                        onClick={() => {
                          setSelectedAccountId(accId);
                          setMode('signin');
                          setError('');
                        }}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: isSelected ? '#ec735e' : '#e6e2d9',
                          bgcolor: isSelected ? '#fff8f5' : '#ffffff',
                          transition: 'all 0.15s ease',
                          '&:hover': { borderColor: '#ec735e', bgcolor: '#fffdfa' }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            sx={{
                              bgcolor: acc.avatarBg || (accId === '2' ? '#84b98a' : '#ec735e'),
                              color: acc.avatarColor || '#fff',
                              width: 36,
                              height: 36,
                              fontSize: 13,
                              fontWeight: 700
                            }}
                          >
                            {acc.initials || 'ST'}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography fontWeight={700} fontSize={13} noWrap>
                                {acc.name}
                              </Typography>
                              <Chip
                                label={accId === '2' ? 'Learner 2' : 'Learner 1'}
                                size="small"
                                sx={{
                                  fontSize: 9,
                                  height: 18,
                                  bgcolor: accId === '2' ? '#e8f4ea' : '#fae8e2',
                                  color: accId === '2' ? '#2e7d32' : '#ec735e',
                                  fontWeight: 700
                                }}
                              />
                            </Stack>
                            <Typography fontSize={11} color="text.secondary">
                              Level {Math.floor((acc.xp || 0) / 100) + 1} · {acc.xp || 0} XP · {acc.streak || 0}🔥 streak
                            </Typography>
                          </Box>
                          {isSelected ? (
                            <CheckCircle sx={{ color: '#ec735e', fontSize: 20 }} />
                          ) : (
                            <Typography fontSize={11} color="text.secondary">
                              Select
                            </Typography>
                          )}
                        </Stack>
                      </Paper>
                    );
                  })}

                  {!isMaxAccounts && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PersonAdd />}
                      onClick={handleCreateSecondLearner}
                      sx={{
                        borderStyle: 'dashed',
                        borderColor: '#ec735e',
                        color: '#ec735e',
                        py: 0.8,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#fff5f2', borderColor: '#ec735e' }
                      }}
                    >
                      {t('auth.create_second_profile') || '+ Create 2nd Learner Profile (1/2 used)'}
                    </Button>
                  )}
                </Stack>
              </Box>
            )}

            <Stack component="form" onSubmit={handleSubmit} spacing={2}>
              {(mode === 'register_new' || mode === 'register_second') && (
                <TextField
                  label={mode === 'register_second' ? 'Learner 2 Name / Nickname' : t('auth.full_name')}
                  placeholder={mode === 'register_second' ? 'e.g., Sam Learner' : t('auth.full_name_placeholder')}
                  fullWidth
                  size="small"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              )}

              <TextField
                label={t('auth.email_label')}
                type="email"
                placeholder={t('auth.email_placeholder')}
                fullWidth
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ fontSize: 18, color: '#9b9991' }} />
                    </InputAdornment>
                  )
                }}
                required
              />

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography fontSize={12} color="#555" fontWeight={600}>
                    {t('auth.password_label')}
                  </Typography>
                  {mode === 'signin' && (
                    <Button
                      size="small"
                      onClick={() => {
                        setMode('forgot_password');
                        setError('');
                        setSuccess('');
                        setResetState({ step: 1, code: '', newPassword: '', confirmNewPassword: '', demoCodeHint: '' });
                      }}
                      sx={{
                        p: 0,
                        minWidth: 0,
                        fontSize: 11,
                        color: '#ec735e',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                      }}
                    >
                      {t('auth.forgot_password') || 'Forgot password?'}
                    </Button>
                  )}
                </Stack>
                <TextField
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.password_placeholder')}
                  fullWidth
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyModifier}
                  onKeyUp={handleKeyModifier}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ fontSize: 18, color: '#9b9991' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  required
                />
              </Box>

              {/* Confirm Password (when creating new account or 2nd profile) */}
              {(mode === 'register_new' || mode === 'register_second') && (
                <Box>
                  <TextField
                    label={t('auth.confirm_password') || 'Confirm Password'}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password to confirm"
                    fullWidth
                    size="small"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyModifier}
                    onKeyUp={handleKeyModifier}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ fontSize: 18, color: '#9b9991' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            aria-label="Toggle confirm password visibility"
                          >
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    required
                  />

                  {/* Password Strength Meter in Registration */}
                  {password && (
                    <Box sx={{ mt: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.4}>
                        <Typography fontSize={11} color="text.secondary">Strength:</Typography>
                        <Typography fontSize={11} fontWeight={700} sx={{ color: activeStrength.color }}>
                          {activeStrength.label}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        {[1, 2, 3, 4].map((step) => (
                          <Box
                            key={step}
                            sx={{
                              flex: 1,
                              height: 4,
                              borderRadius: 1,
                              bgcolor: step <= activeStrength.score ? activeStrength.color : '#e0e0e0',
                              transition: 'all 0.2s ease'
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              )}

              {/* Remember Me Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: '#bbb',
                      p: 0.5,
                      '&.Mui-checked': { color: '#ec735e' }
                    }}
                  />
                }
                label={
                  <Typography fontSize={12} color="text.secondary">
                    {t('auth.remember_me') || 'Remember my email on this device'}
                  </Typography>
                }
                sx={{ ml: -0.5, mt: -0.5 }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 0.5,
                  bgcolor: '#ec735e',
                  py: 1.2,
                  fontWeight: 700,
                  fontSize: 14,
                  '&:hover': { bgcolor: '#d95f4c' }
                }}
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : mode === 'register_second' ? (
                  'Create 2nd Learner Profile'
                ) : mode === 'register_new' ? (
                  t('auth.create_account_btn')
                ) : selectedProfileObj ? (
                  `Sign In as ${selectedProfileObj.name} (${selectedProfileObj.accountId === '2' ? 'Learner 2' : 'Learner 1'})`
                ) : (
                  t('auth.sign_in_btn')
                )}
                {!loading && <ChevronRight sx={{ ml: 'auto' }} />}
              </Button>

              <Stack direction="row" justifyContent="center" alignItems="center">
                {mode !== 'signin' ? (
                  <Button
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setSuccess('');
                    }}
                    color="inherit"
                    sx={{ fontSize: 12, textTransform: 'none', color: '#66655f' }}
                  >
                    {t('auth.have_account')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (isMaxAccounts) {
                        setError('This email already has 2 learner profiles (max limit). Select a profile above.');
                        return;
                      }
                      setMode(existingAccounts.length === 1 ? 'register_second' : 'register_new');
                      setError('');
                      setSuccess('');
                    }}
                    color="inherit"
                    sx={{ fontSize: 12, textTransform: 'none', color: '#66655f' }}
                  >
                    {existingAccounts.length === 1
                      ? '+ Create 2nd Learner Profile'
                      : t('auth.need_account')}
                  </Button>
                )}
              </Stack>
            </Stack>

            <Divider sx={{ my: 2.5, borderColor: '#ece8de' }} />

            {/* Direct Link to Educator Portal */}
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => {
                if (onOpenTeacherPortal) onOpenTeacherPortal();
                else window.open('http://localhost:5174', '_blank');
              }}
              startIcon={<School sx={{ color: '#0ea5e9' }} />}
              sx={{
                bgcolor: '#f0f9ff',
                color: '#0369a1',
                borderColor: '#bae6fd',
                fontSize: 12,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { bgcolor: '#e0f2fe', borderColor: '#0284c7' }
              }}
            >
              Are you an Educator? Launch Educator Portal 👨‍🏫
            </Button>
          </Box>
        )}

        {/* Terms and Privacy Policy notice */}
        <Typography fontSize={10} color="#999" textAlign="center" sx={{ mt: 3, px: 2, lineHeight: 1.4 }}>
          {t('auth.terms_privacy') || "By signing in, you agree to TutorMind's Terms of Service and Privacy Policy."}
        </Typography>
      </Paper>
    </Box>
  );
}

function ProfileSwitcherDialog({ open, onClose, user, onSwitchAccount, onToast }) {
  const { t } = useTranslation();
  const [newLearnerName, setNewLearnerName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  if (!user?.email) return null;
  const accounts = getAccountsForEmail(user.email);
  const canAddSecond = accounts.length < 2;

  const handleCreateSecond = () => {
    if (!newLearnerName.trim()) {
      setError(t('auth.enter_name') || 'Please enter a name for Learner 2');
      return;
    }
    const newProfile = createNewLearnerProfile(newLearnerName.trim(), user.email, '2');
    const updated = [...accounts.filter((a) => (a.accountId || '1') !== '2'), newProfile];
    saveAccountsForEmail(user.email, updated);
    onSwitchAccount?.(newProfile);
    onToast?.(`🎉 Created & switched to Learner 2: ${newProfile.name}!`);
    setCreating(false);
    setNewLearnerName('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: { xs: 1, sm: 1.5 },
          bgcolor: '#fffdf8',
          border: '1px solid #e6e2d9'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Group sx={{ color: '#ec735e' }} />
          <Typography fontWeight={800} fontSize={16}>
            {t('auth.switch_learner') || 'Learner Profiles'}
          </Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography fontSize={11} color="text.secondary" mb={2}>
          {t('auth.accounts_for_email', { email: user.email }) || `Learner Profiles for ${user.email} (Max 2)`}
        </Typography>

        <Stack spacing={1.5}>
          {accounts.map((acc) => {
            const accId = acc.accountId || '1';
            const isActive = accId === (user.accountId || '1');
            return (
              <Paper
                key={accId}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor: isActive ? '#ec735e' : '#e6e2d9',
                  bgcolor: isActive ? '#fff8f5' : '#ffffff',
                  cursor: isActive ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': { borderColor: '#ec735e', bgcolor: '#fffdfa' }
                }}
                onClick={() => {
                  if (!isActive) {
                    onSwitchAccount?.(acc);
                    onToast?.(`Switched to ${acc.name} (${accId === '2' ? 'Learner 2' : 'Learner 1'})`);
                    onClose();
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    sx={{
                      bgcolor: acc.avatarBg || (accId === '2' ? '#84b98a' : '#ec735e'),
                      color: acc.avatarColor || '#fff',
                      width: 38,
                      height: 38,
                      fontWeight: 700
                    }}
                  >
                    {acc.initials || 'ST'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography fontWeight={700} fontSize={13} noWrap>
                        {acc.name}
                      </Typography>
                      <Chip
                        label={accId === '2' ? 'Learner 2' : 'Learner 1'}
                        size="small"
                        sx={{
                          fontSize: 9,
                          height: 18,
                          bgcolor: accId === '2' ? '#e8f4ea' : '#fae8e2',
                          color: accId === '2' ? '#2e7d32' : '#ec735e',
                          fontWeight: 700
                        }}
                      />
                    </Stack>
                    <Typography fontSize={11} color="text.secondary">
                      Level {Math.floor((acc.xp || 0) / 100) + 1} · {acc.xp || 0} XP · {acc.streak || 0}🔥 streak
                    </Typography>
                  </Box>
                  {isActive ? (
                    <Chip label="Active" color="success" size="small" sx={{ fontWeight: 700, fontSize: 10, height: 22 }} />
                  ) : (
                    <Button size="small" variant="outlined" sx={{ fontSize: 11, py: 0.3, minWidth: 64, textTransform: 'none' }}>
                      Switch
                    </Button>
                  )}
                </Stack>
              </Paper>
            );
          })}

          {canAddSecond && (
            <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #e6e2d9' }}>
              {!creating ? (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PersonAdd />}
                  onClick={() => setCreating(true)}
                  sx={{
                    borderStyle: 'dashed',
                    borderColor: '#ec735e',
                    color: '#ec735e',
                    py: 1,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#fff5f2', borderColor: '#ec735e' }
                  }}
                >
                  {t('auth.create_second_profile') || '+ Create 2nd Learner Profile (1/2 used)'}
                </Button>
              ) : (
                <Stack spacing={1.5} sx={{ bgcolor: '#faf9f5', p: 2, borderRadius: 2, border: '1px solid #e6e2d9' }}>
                  <Typography fontWeight={700} fontSize={12} color="#20211f">
                    Add 2nd Learner Profile (under {user.email})
                  </Typography>
                  {error && (
                    <Alert severity="error" sx={{ py: 0, fontSize: 11 }}>
                      {error}
                    </Alert>
                  )}
                  <TextField
                    size="small"
                    placeholder="Learner 2 Name / Nickname"
                    value={newLearnerName}
                    onChange={(e) => {
                      setNewLearnerName(e.target.value);
                      setError('');
                    }}
                    autoFocus
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" onClick={() => setCreating(false)} sx={{ fontSize: 11 }}>
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleCreateSecond}
                      sx={{ fontSize: 11, bgcolor: '#ec735e', '&:hover': { bgcolor: '#d95f4c' } }}
                    >
                      Create & Switch
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Box>
          )}

          {!canAddSecond && (
            <Typography fontSize={11} color="text.secondary" textAlign="center" sx={{ pt: 1 }}>
              ✓ Maximum 2 learner profiles active for this email.
            </Typography>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function Layout({
  page,
  setPage,
  user,
  onLogout,
  onSwitchAccount,
  onToast,
  onOpenTeacherPortal,
  pendingAssignmentsCount = 0,
  officeHours = null,
  activeLiveMeeting = null,
  onJoinLiveMeeting = null,
  onDismissLiveMeetingBanner = null,
  onCallTeacher = null,
  onSendPing = null,
  children
}) {
  const { t } = useTranslation();
  const mobile = useMediaQuery('(max-width:900px)');
  const [drawer, setDrawer] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const val = localStorage.getItem('tutormind_sidebar_collapsed') || localStorage.getItem('mathlingo_sidebar_collapsed');
      return val === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapsed = (val) => {
    const next = typeof val === 'boolean' ? val : !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem('tutormind_sidebar_collapsed', String(next));
      localStorage.setItem('mathlingo_sidebar_collapsed', String(next));
    } catch {}
  };

  const isMini = !mobile && collapsed;
  const drawerWidth = isMini ? 72 : 248;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f7f5ef' }}>
      <Drawer
        variant={mobile ? 'temporary' : 'permanent'}
        open={!mobile || drawer}
        onClose={() => setDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: '#20211f',
            color: '#f9f6ee',
            p: isMini ? 1 : 2,
            overflowX: 'hidden',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box',
            borderRight: '1px solid #333430',
            cursor: isMini ? 'pointer' : 'default'
          }
        }}
        PaperProps={{
          onClick: (e) => {
            if (isMini && e.target === e.currentTarget) {
              handleToggleCollapsed(false);
            }
          }
        }}
      >
        {/* Top Brand & Minimize/Expand Toggle */}
        {!isMini ? (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ p: 1, mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: '#ec735e', borderRadius: 2, width: 34, height: 34, fontWeight: 800 }}>T</Avatar>
              <Typography fontWeight={800} fontSize={18} noWrap>
                Tutor<span style={{ color: '#ec735e' }}>Mind</span>
              </Typography>
            </Stack>
            {!mobile && (
              <MuiTooltip title="Minimize to symbols" placement="right" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleToggleCollapsed(true)}
                  sx={{
                    color: '#8c8d88',
                    bgcolor: 'rgba(255,255,255,0.04)',
                    '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                  aria-label="Minimize sidebar"
                >
                  <ChevronLeft fontSize="small" />
                </IconButton>
              </MuiTooltip>
            )}
          </Stack>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, pt: 0.5 }}>
            <MuiTooltip title="TutorMind · Click to expand" placement="right" arrow>
              <IconButton
                onClick={() => handleToggleCollapsed(false)}
                sx={{
                  p: 0.5,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.08)' }
                }}
              >
                <Avatar sx={{ bgcolor: '#ec735e', borderRadius: 2, width: 34, height: 34, fontWeight: 800 }}>T</Avatar>
              </IconButton>
            </MuiTooltip>
            <MuiTooltip title="Expand sidebar" placement="right" arrow>
              <IconButton
                size="small"
                onClick={() => handleToggleCollapsed(false)}
                sx={{
                  mt: 0.5,
                  color: '#8c8d88',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  '&:hover': { color: '#ec735e', bgcolor: 'rgba(236,115,94,0.15)' }
                }}
                aria-label="Expand sidebar"
              >
                <ChevronRight sx={{ fontSize: 16 }} />
              </IconButton>
            </MuiTooltip>
          </Box>
        )}

        {/* User Profile Mini vs Expanded */}
        {!isMini ? (
          <>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1, mb: 1 }}>
              <Avatar sx={{ bgcolor: user?.avatarBg || '#d8c6a7', color: user?.avatarColor || '#35342d', width: 34, height: 34 }}>
                {user.initials}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontSize={11} fontWeight={700} noWrap>
                  {user.name}
                </Typography>
                <Typography fontSize={10} color="#9c9d98">
                  {t('nav.level_learner', { level: Math.floor(user.xp / 100) + 1 })} · {user.accountId === '2' ? 'Learner 2' : 'Learner 1'}
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              size="small"
              startIcon={<SwapHoriz fontSize="small" />}
              onClick={() => setSwitcherOpen(true)}
              sx={{
                color: '#c7b9e9',
                justifyContent: 'flex-start',
                fontSize: 11,
                textTransform: 'none',
                px: 1,
                py: 0.5,
                mb: 2,
                bgcolor: 'rgba(199,185,233,0.08)',
                borderRadius: 1.5,
                '&:hover': { bgcolor: 'rgba(199,185,233,0.18)' }
              }}
            >
              {t('auth.switch_learner') || 'Switch Learner Profile'}
            </Button>
          </>
        ) : (
          <MuiTooltip title={`${user.name} (${user.accountId === '2' ? 'Learner 2' : 'Learner 1'}) · Click to switch`} placement="right" arrow>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
              <Avatar
                onClick={(e) => {
                  e.stopPropagation();
                  setSwitcherOpen(true);
                }}
                sx={{
                  bgcolor: user?.avatarBg || '#d8c6a7',
                  color: user?.avatarColor || '#35342d',
                  width: 36,
                  height: 36,
                  cursor: 'pointer',
                  border: '1.5px solid #3b3c39',
                  transition: 'transform 0.15s',
                  '&:hover': { transform: 'scale(1.08)', borderColor: '#ec735e' }
                }}
              >
                {user.initials}
              </Avatar>
            </Box>
          </MuiTooltip>
        )}

        <Divider sx={{ borderColor: '#3b3c39', my: isMini ? 0.5 : 1 }} />

        {/* Navigation List */}
        <List sx={{ mt: 1, p: 0 }}>
          {nav.map(([id, label, Icon]) => {
            const isSelected = page === id;
            const button = (
              <ListItemButton
                key={id}
                selected={isSelected}
                onClick={(e) => {
                  setPage(id);
                  if (isMini) {
                    handleToggleCollapsed(false);
                  }
                  if (mobile) setDrawer(false);
                }}
                sx={{
                  borderRadius: 2,
                  color: isSelected ? '#fff' : '#a7a8a2',
                  justifyContent: isMini ? 'center' : 'initial',
                  px: isMini ? 1 : 1.5,
                  py: 0.9,
                  mb: 0.6,
                  minHeight: 42,
                  '&.Mui-selected': {
                    bgcolor: '#343532',
                    color: '#fff',
                    '& .MuiListItemIcon-root': { color: id === 'tutor' ? '#ec735e' : '#fff' }
                  },
                  '&:hover': {
                    color: '#fff',
                    bgcolor: '#2b2c29'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? (id === 'tutor' || id === 'assignments' || id === 'videocall' ? (id === 'videocall' ? '#34d399' : '#ec735e') : '#fff') : (id === 'videocall' && officeHours?.isLive ? '#34d399' : 'inherit'),
                    minWidth: isMini ? 0 : 35,
                    justifyContent: 'center',
                    mr: isMini ? 0 : 'auto'
                  }}
                >
                  {id === 'assignments' && pendingAssignmentsCount > 0 ? (
                    <Badge
                      badgeContent={pendingAssignmentsCount}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: 9,
                          height: 16,
                          minWidth: 16,
                          bgcolor: '#ea580c'
                        }
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </Badge>
                  ) : id === 'videocall' && (activeLiveMeeting || officeHours?.isLive) ? (
                    <Badge
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: activeLiveMeeting ? '#ef4444' : '#10b981',
                          boxShadow: activeLiveMeeting ? '0 0 8px #ef4444' : '0 0 8px #10b981',
                          width: 8,
                          height: 8,
                          borderRadius: '50%'
                        }
                      }}
                    >
                      <Icon sx={{ fontSize: 20, color: activeLiveMeeting ? '#ef4444' : '#10b981' }} />
                    </Badge>
                  ) : (
                    <Icon sx={{ fontSize: 20 }} />
                  )}
                </ListItemIcon>
                {!isMini && (
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                    <ListItemText
                      primary={t(`nav.${id}`) || label}
                      primaryTypographyProps={{ fontSize: 12, fontWeight: 600, noWrap: true }}
                    />
                    {id === 'assignments' && pendingAssignmentsCount > 0 && (
                      <Chip
                        label={pendingAssignmentsCount}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: 800,
                          bgcolor: '#ea580c',
                          color: '#fff',
                          px: 0.2
                        }}
                      />
                    )}
                    {id === 'videocall' && (activeLiveMeeting || officeHours?.isLive) && (
                      <Chip
                        label={activeLiveMeeting ? 'MEETING' : 'LIVE'}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 9,
                          fontWeight: 800,
                          bgcolor: activeLiveMeeting ? '#dc2626' : '#059669',
                          color: '#fff',
                          px: 0.2
                        }}
                      />
                    )}
                  </Stack>
                )}
              </ListItemButton>
            );

            return isMini ? (
              <MuiTooltip key={id} title={t(`nav.${id}`) || label} placement="right" arrow>
                {button}
              </MuiTooltip>
            ) : (
              button
            );
          })}
        </List>

        {/* Bottom Section: Streak & Logout */}
        <Box sx={{ mt: 'auto', p: isMini ? 0.5 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {isMini ? (
            <>
              <MuiTooltip title={t('nav.streak_label', { streak: user.streak || 0 })} placement="right" arrow>
                <Paper
                  onClick={() => handleToggleCollapsed(false)}
                  sx={{
                    bgcolor: '#2c2d2a',
                    color: '#fff',
                    p: 0.8,
                    mb: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    width: 44,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#383935', transform: 'scale(1.05)' }
                  }}
                >
                  <Whatshot sx={{ color: '#f6c857', fontSize: 20 }} />
                  <Typography fontSize={10} fontWeight={800} sx={{ mt: 0.2 }}>
                    {user.streak || 0}
                  </Typography>
                </Paper>
              </MuiTooltip>

              <MuiTooltip title={t('nav.logout')} placement="right" arrow>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  sx={{
                    color: '#ec735e',
                    bgcolor: 'rgba(236, 115, 94, 0.12)',
                    border: '1px solid rgba(236, 115, 94, 0.4)',
                    borderRadius: 2,
                    p: 1.1,
                    width: 42,
                    height: 42,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(236, 115, 94, 0.25)',
                      borderColor: '#ec735e',
                      color: '#ff8a73',
                      transform: 'translateY(-1px)'
                    }
                  }}
                  aria-label="Log out"
                >
                  <Logout sx={{ fontSize: 18 }} />
                </IconButton>
              </MuiTooltip>
            </>
          ) : (
            <>
              <Paper sx={{ bgcolor: '#2c2d2a', color: '#fff', p: 1.5, mb: 1, width: '100%' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Whatshot sx={{ color: '#f6c857' }} />
                  <Box>
                    <Typography fontSize={11} fontWeight={700}>
                      {t('nav.streak_label', { streak: user.streak || 0 })}
                    </Typography>
                    <Typography fontSize={10} color="#92938f">
                      {t('nav.keep_momentum')}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Logout sx={{ fontSize: 16 }} />}
                onClick={onLogout}
                sx={{
                  color: '#ec735e',
                  borderColor: 'rgba(236, 115, 94, 0.4)',
                  bgcolor: 'rgba(236, 115, 94, 0.08)',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 0.9,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(236, 115, 94, 0.2)',
                    borderColor: '#ec735e',
                    color: '#ff8a73',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {t('nav.logout')}
              </Button>
            </>
          )}
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          ml: mobile ? 0 : `${drawerWidth}px`,
          width: mobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#f7f5ef', color: '#20211f', borderBottom: '1px solid #e6e2d9' }}>
          <Toolbar sx={{ px: { xs: 2, md: 6 } }}>
            {mobile ? (
              <IconButton onClick={() => setDrawer(true)}>
                <Menu />
              </IconButton>
            ) : (
              <MuiTooltip title={isMini ? "Expand sidebar" : "Minimize sidebar"} arrow>
                <IconButton
                  size="small"
                  onClick={() => handleToggleCollapsed()}
                  sx={{
                    mr: 1.5,
                    color: '#6e6d67',
                    bgcolor: '#ece9e0',
                    '&:hover': { color: '#20211f', bgcolor: '#e2ded4' }
                  }}
                  aria-label="Toggle sidebar"
                >
                  {isMini ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
                </IconButton>
              </MuiTooltip>
            )}
            <Typography fontSize={11} color="text.secondary">
              {t('nav.workspace')} / <b style={{ color: '#20211f' }}>{t(`nav.${page}`) || page}</b>
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                icon={<SwapHoriz sx={{ fontSize: 16 }} />}
                label={`${user.accountId === '2' ? 'Learner 2' : 'Learner 1'}: ${user.name}`}
                size="small"
                onClick={() => setSwitcherOpen(true)}
                sx={{
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: user.accountId === '2' ? '#e8f4ea' : '#fae8e2',
                  color: user.accountId === '2' ? '#2e7d32' : '#ec735e',
                  borderColor: user.accountId === '2' ? '#c5e1a5' : '#f5d5cb',
                  border: '1px solid',
                  '&:hover': { bgcolor: user.accountId === '2' ? '#dcedc8' : '#f5d5cb' }
                }}
              />
              <LanguageSelector />
              <Avatar
                onClick={() => setPage('profile')}
                sx={{
                  bgcolor: user?.avatarBg || '#d8c6a7',
                  color: user?.avatarColor || '#35342d',
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  border: '1.5px solid #e6e2d9',
                  transition: 'transform 0.15s ease',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
                title={user.name}
              >
                {user.initials}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Real-Time Teacher Meeting Live Alert Banner */}
        {activeLiveMeeting && (
          <Paper
            elevation={0}
            sx={{
              bgcolor: '#064e3b',
              color: '#ecfdf5',
              px: { xs: 2, md: 6 },
              py: 1.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #059669',
              flexWrap: 'wrap',
              gap: 1.5
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#34d399',
                  boxShadow: '0 0 10px #34d399'
                }}
              />
              <Typography variant="body2" fontWeight={700} color="#ffffff">
                🔴 Live Meeting in Progress: {activeLiveMeeting.caller?.name || 'Prof. Sarah Jenkins'}
              </Typography>
              <Chip
                label={activeLiveMeeting.topic || 'Office Hours Meeting Room'}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#a7f3d0', fontSize: 11, fontWeight: 600 }}
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                size="small"
                startIcon={<Videocam />}
                onClick={() => onJoinLiveMeeting && onJoinLiveMeeting(activeLiveMeeting)}
                sx={{
                  bgcolor: '#10b981',
                  color: '#ffffff',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: 12,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Join Meeting
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => onDismissLiveMeetingBanner && onDismissLiveMeetingBanner(activeLiveMeeting.id)}
                sx={{ color: '#a7f3d0', textTransform: 'none', fontSize: 11 }}
              >
                Dismiss
              </Button>
            </Stack>
          </Paper>
        )}

        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 6 } }}>
          {children}
        </Container>
      </Box>

      <ProfileSwitcherDialog
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        user={user}
        onSwitchAccount={onSwitchAccount}
        onToast={onToast}
      />
    </Box>
  );
}

function Overview({ user, setPage, onToast, assignments = [], onOpenChapter, onSolveAssignment, announcements = [], dismissedAnnouncements = [], onDismissAnnouncement, officeHours = null, onCallTeacher = null, onSendPing = null }) {
  const { t } = useTranslation();
  const pendingAssignments = assignments.filter((a) => !a.isCompleted);
  const activeAnnouncement = announcements.find((a) => !dismissedAnnouncements.includes(a.id));
  const streak = user?.streak || 0;
  const xp = user?.xp || 0;
  const completedChapterIds = user?.completedChapterIds || [];
  const completedUnits = completedChapterIds.length;
  const focusMinutes = user?.focusMinutes || 0;
  const weeklyGoal = (user?.dailyGoal || 50) * 7;
  const weeklyProgress = Math.min(100, Math.round((xp / weeklyGoal) * 100));

  const mathVal = user?.topicProgress?.Mathematics ?? (
    user?.topicProgress ? Math.round(
      ((user.topicProgress.Algebra || 0) +
       (user.topicProgress.Geometry || 0) +
       (user.topicProgress.Calculus || 0) +
       (user.topicProgress.Statistics || 0) +
       (user.topicProgress.Arithmetic || 0)) / 5
    ) : 0
  );
  const physicsVal = user?.topicProgress?.Physics ?? 0;
  const csVal = user?.topicProgress?.['Computer Science'] ?? 0;
  const chemVal = user?.topicProgress?.Chemistry ?? 0;

  const adaptiveChapters = [
    { id: 'Mathematics:Linear equations', title: 'Linear equations', desc: 'Meet the balance scale' },
    { id: 'Mathematics:Foundations of variables', title: 'Variables', desc: 'Symbols and unknowns' },
    { id: 'Mathematics:Basic operations', title: 'Basic operations', desc: 'Number fluency' },
    { id: 'Mathematics:Shapes and their properties', title: 'Shapes & properties', desc: 'Geometry foundations' },
    { id: 'Mathematics:Limits', title: 'Limits', desc: 'Calculus foundations' }
  ];

  const firstUnfinishedIdx = adaptiveChapters.findIndex((ch) =>
    !completedChapterIds.some((id) => id === ch.id || id.endsWith(':' + ch.title))
  );
  const currentChapterIdx = firstUnfinishedIdx >= 0 ? firstUnfinishedIdx : adaptiveChapters.length - 1;
  const nextLessonTitle = adaptiveChapters[currentChapterIdx]?.title || 'Linear equations';
  const nextLessonDesc = adaptiveChapters[currentChapterIdx]?.desc || 'Solve for unknowns';

  const isDemo = false;
  const now = new Date();
  const dateEyebrow = now.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? t('overview.good_morning') : hour < 17 ? t('overview.good_afternoon') : t('overview.good_evening');

  const momentumData = getTrailing7Days(user?.dailyActivity || {}, isDemo, focusMinutes, streak);

  return (
    <motion.div variants={fade} initial="hidden" animate="show">
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'end' }} gap={2} mb={4}>
        <Box>
          <Eyebrow>{dateEyebrow}</Eyebrow>
          <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 34 } }}>
            {timeGreeting}, {(user?.name || 'Learner').split(' ')[0]} <span style={{ color: '#ec735e' }}>✦</span>
          </Typography>
          <Typography color="text.secondary" fontSize={13}>
            {xp > 0 ? t('overview.hero_active') : t('overview.hero_new')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            label={focusMinutes > 0 ? `⏱️ ${(focusMinutes / 60).toFixed(1)} hrs online` : '⏱️ Just started session'}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700, borderColor: '#e6e2d9', bgcolor: '#fff', fontSize: 11 }}
          />
          <Button variant="contained" endIcon={<ChevronRight />} onClick={() => setPage('learn')}>
            {xp > 0 ? t('overview.continue_learning') : t('overview.start_learning')}
          </Button>
        </Stack>
      </Stack>



      {/* Teacher Classroom Broadcast Announcement Banner */}
      {activeAnnouncement && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            background: activeAnnouncement.priority === 'Urgent Alert'
              ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)'
              : activeAnnouncement.priority === 'Exam Tip'
              ? 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
              : activeAnnouncement.priority === 'Assignment Notice'
              ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
              : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: activeAnnouncement.priority === 'Urgent Alert'
              ? '1.5px solid #f43f5e'
              : activeAnnouncement.priority === 'Exam Tip'
              ? '1.5px solid #a855f7'
              : activeAnnouncement.priority === 'Assignment Notice'
              ? '1.5px solid #f59e0b'
              : '1.5px solid #3b82f6',
            boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
            position: 'relative'
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} gap={2}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Avatar
                sx={{
                  bgcolor: activeAnnouncement.priority === 'Urgent Alert'
                    ? '#f43f5e'
                    : activeAnnouncement.priority === 'Exam Tip'
                    ? '#a855f7'
                    : activeAnnouncement.priority === 'Assignment Notice'
                    ? '#f59e0b'
                    : '#3b82f6',
                  color: '#fff',
                  width: 40,
                  height: 40
                }}
              >
                <Campaign />
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5} flexWrap="wrap">
                  <Chip
                    size="small"
                    label={activeAnnouncement.priority || 'General Notice'}
                    sx={{
                      fontWeight: 800,
                      fontSize: 11,
                      height: 22,
                      bgcolor: activeAnnouncement.priority === 'Urgent Alert' ? '#ffe4e6' : activeAnnouncement.priority === 'Exam Tip' ? '#f3e8ff' : '#ede9fe',
                      color: activeAnnouncement.priority === 'Urgent Alert' ? '#e11d48' : activeAnnouncement.priority === 'Exam Tip' ? '#9333ea' : '#7c3aed'
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    From {activeAnnouncement.author || 'Your Teacher'} · {activeAnnouncement.topic || 'Mathematics'}
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize={16}>
                  {activeAnnouncement.title}
                </Typography>
                <Typography variant="body2" color="#334155" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                  {activeAnnouncement.message}
                </Typography>
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={() => onDismissAnnouncement?.(activeAnnouncement.id)}
              sx={{ color: '#64748b', '&:hover': { color: '#0f172a' } }}
              title="Dismiss announcement"
            >
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </Paper>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
        {[
          [
            t('overview.current_streak'),
            `${streak} ${t('overview.days')}`,
            Whatshot,
            '#fbedb5',
            streak > 0 ? t('overview.active_momentum', { streak }) : t('overview.start_streak_today'),
            Math.min(100, Math.round((streak / 7) * 100)),
            '#ec735e'
          ],
          [
            t('overview.total_xp'),
            xp.toLocaleString(),
            AutoAwesome,
            '#fbe4be',
            xp > 0 ? t('overview.level_learner', { level: Math.floor(xp / 100) + 1 }) : t('overview.ready_chapter_1'),
            xp % 100,
            '#f6c857'
          ],
          [
            'Chapters Mastered',
            `${completedUnits} / 23`,
            MenuBook,
            '#e8f4ea',
            completedUnits > 0 ? `${completedUnits} completed across subjects` : 'Start your first chapter',
            Math.min(100, Math.round((completedUnits / 23) * 100)),
            '#2e7d32'
          ],
          [
            'Total Study Time',
            focusMinutes >= 60 ? `${(focusMinutes / 60).toFixed(1)} hrs` : `${focusMinutes} mins`,
            Insights,
            '#eee8fb',
            focusMinutes > 0 ? 'Live recorded online time' : 'Active timer running',
            Math.min(100, Math.round((focusMinutes / 120) * 100)),
            '#5e62d6'
          ]
        ].map(([label, value, Icon, bg, sub, progressVal, barColor]) => (
          <Panel key={label}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: bg, color: '#20211f', width: 25, height: 25 }}>
                <Icon sx={{ fontSize: 15 }} />
              </Avatar>
              <Typography fontSize={11} color="text.secondary" fontWeight={700}>
                {label}
              </Typography>
            </Stack>
            <Typography variant="h4" mt={1.5} fontSize={{ xs: 22, sm: 26 }}>
              {value}
            </Typography>
            <Typography fontSize={10} color={xp > 0 ? '#5e9b69' : 'text.secondary'} noWrap>
              {sub}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressVal}
              sx={{
                mt: 2,
                height: 4,
                bgcolor: '#efede6',
                '& .MuiLinearProgress-bar': { bgcolor: barColor }
              }}
            />
          </Panel>
        ))}
      </Box>

      {/* Active Teacher Assignment Callout Card */}
      {pendingAssignments.length > 0 ? (
        <Paper
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #fffbf5 0%, #fff4ec 100%)',
            border: '1.5px solid #fed7aa',
            boxShadow: '0 8px 24px rgba(234, 88, 12, 0.08)'
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" gap={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#ea580c', color: '#fff', width: 46, height: 46, boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
                <Assignment sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip
                    label="Assigned by Teacher"
                    size="small"
                    sx={{ bgcolor: '#ea580c', color: '#fff', fontWeight: 800, fontSize: 10, height: 20 }}
                  />
                  <Chip
                    label={`+${pendingAssignments[0].xpReward || 100} XP`}
                    size="small"
                    sx={{ bgcolor: '#ffedd5', color: '#9a3412', fontWeight: 800, fontSize: 10, height: 20, border: '1px solid #fdba74' }}
                  />
                  {pendingAssignments[0].dueDate && (
                    <Chip
                      icon={<CalendarToday sx={{ fontSize: '12px !important' }} />}
                      label={`Due: ${pendingAssignments[0].dueDate}`}
                      size="small"
                      sx={{ bgcolor: '#fff', color: '#64748b', fontSize: 10, height: 20, border: '1px solid #e2e8f0' }}
                    />
                  )}
                </Stack>
                <Typography variant="h6" fontWeight={800} fontSize={17} color="#20211f" mt={0.5}>
                  {pendingAssignments[0].title}
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  Subject: <b>{pendingAssignments[0].topic}</b> · Textbook Chapter: <b>{pendingAssignments[0].chapter}</b>
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="contained"
                size="medium"
                onClick={() => {
                  if (onSolveAssignment) {
                    onSolveAssignment(pendingAssignments[0]);
                  } else {
                    setPage('assignments');
                  }
                }}
                startIcon={<Quiz />}
                sx={{
                  bgcolor: '#ea580c',
                  color: '#fff',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  boxShadow: '0 4px 14px rgba(234,88,12,0.25)',
                  '&:hover': { bgcolor: '#c2410c' }
                }}
              >
                Solve Assignment
              </Button>
              <Button
                variant="outlined"
                size="medium"
                onClick={() => {
                  if (onOpenChapter) {
                    const fullId = pendingAssignments[0].chapter?.includes(':')
                      ? pendingAssignments[0].chapter
                      : `${pendingAssignments[0].topic}:${pendingAssignments[0].chapter}`;
                    onOpenChapter(fullId);
                  } else {
                    setPage('assignments');
                  }
                }}
                startIcon={<MenuBook />}
                sx={{
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 1.5,
                  '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' }
                }}
              >
                Study Chapter
              </Button>
              <Button
                variant="text"
                size="medium"
                onClick={() => setPage('assignments')}
                sx={{
                  color: '#9a3412',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 1,
                  '&:hover': { bgcolor: '#ffedd5' }
                }}
              >
                All Tasks ({pendingAssignments.length})
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : assignments.length > 0 ? (
        <Paper
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 3,
            bgcolor: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircle sx={{ color: '#16a34a', fontSize: 22 }} />
            <Typography fontSize={13} fontWeight={700} color="#166534">
              All caught up! You have completed all {assignments.length} assignments assigned by your teacher.
            </Typography>
          </Stack>
          <Button
            size="small"
            variant="text"
            onClick={() => setPage('assignments')}
            sx={{ color: '#166534', fontWeight: 700, textTransform: 'none' }}
          >
            View Completed →
          </Button>
        </Paper>
      ) : null}

      {/* 2x2 Dashboard Grid: Adaptive Path, Tutor Nudge, Momentum, Topic Health */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' }, gap: 2 }}>
        {/* 1. Adaptive Path */}
        <Panel>
          <Stack direction="row" justifyContent="space-between">
            <Box>
              <Eyebrow>{t('overview.adaptive_path')}</Eyebrow>
              <Typography variant="h5" fontSize={18}>
                {t('overview.build_algebra')}
              </Typography>
            </Box>
            <Button size="small" onClick={() => setPage('learn')}>
              {t('overview.view_full_path')}
            </Button>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ my: 4 }}>
            {adaptiveChapters.map((item, i) => {
              const isDone = completedChapterIds.includes(item.id);
              const isCurrent = !isDone && (i === 0 || completedChapterIds.includes(adaptiveChapters[i - 1]?.id));
              return (
                <Box textAlign="center" key={item.title}>
                  <Avatar
                    sx={{
                      mx: 'auto',
                      width: 29,
                      height: 29,
                      fontSize: 10,
                      bgcolor: isDone ? '#f6ddd7' : '#fffdf8',
                      color: isDone ? '#d95f4c' : isCurrent ? '#ec735e' : '#aaa9a1',
                      border: '2px solid',
                      borderColor: isDone || isCurrent ? '#ec735e' : '#e5e1d9',
                      fontWeight: 700
                    }}
                  >
                    {isDone ? '✓' : `0${i + 1}`}
                  </Avatar>
                  <Typography fontSize={9} mt={1}>
                    {item.title}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
          <Paper sx={{ p: 1.5, bgcolor: '#faf0ea' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar variant="rounded" sx={{ bgcolor: '#ec735e' }}>
                x+y
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Eyebrow>
                  {completedUnits > 0 ? t('overview.next_lesson_ch', { num: currentChapterIdx + 1 }) : t('overview.start_here_ch')}
                </Eyebrow>
                <Typography fontWeight={800} fontSize={12}>
                  {nextLessonTitle}
                </Typography>
                <Typography fontSize={10} color="text.secondary">
                  {nextLessonDesc}
                </Typography>
              </Box>
              <IconButton onClick={() => setPage('learn')}>
                <ChevronRight />
              </IconButton>
            </Stack>
          </Paper>
        </Panel>

        {/* 2. Tutor Nudge */}
        <Panel sx={{ bgcolor: '#f1ede7' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ border: '1px solid #d6cbbd', bgcolor: 'transparent', color: '#ec735e' }}>
              ✦
            </Avatar>
            <Box>
              <Eyebrow>{t('tutor.eyebrow')}</Eyebrow>
              <Typography variant="h5" fontSize={18}>
                {t('overview.need_nudge')}
              </Typography>
            </Box>
          </Stack>
          <Typography fontSize={12} color="text.secondary" lineHeight={1.7} my={2}>
            {t('overview.tutor_sub')}
          </Typography>
          <Button fullWidth variant="outlined" onClick={() => setPage('tutor')}>
            {t('overview.open_tutor')}
          </Button>
        </Panel>

        {/* 3. Momentum Chart */}
        <Panel>
          <Eyebrow>{t('overview.momentum_title')}</Eyebrow>
          <Typography variant="h5" fontSize={18} mb={2}>
            {t('overview.learning_rhythm')}
          </Typography>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={momentumData}>
              <CartesianGrid vertical={false} stroke="#eeeae2" />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="minutes" fill="#ded5f2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* 4. Topic Health */}
        <Panel>
          <Eyebrow>{t('overview.topic_health')}</Eyebrow>
          <Typography variant="h5" fontSize={18} mb={2}>
            {t('overview.keep_exploring')}
          </Typography>
          {[
            ['Mathematics', mathVal, '#ec735e'],
            ['Physics', physicsVal, '#4f46e5'],
            ['Computer Science', csVal, '#0d9488'],
            ['Chemistry', chemVal, '#e11d48']
          ].map(([name, value, color]) => (
            <Box key={name} mb={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontSize={11}>{t('topics.' + name) || name}</Typography>
                <Typography fontSize={10}>{value}%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={value}
                sx={{ height: 4, bgcolor: '#efede6', '& .MuiLinearProgress-bar': { bgcolor: color } }}
              />
            </Box>
          ))}
        </Panel>
      </Box>
    </motion.div>
  );
}

function Assignments({
  user,
  assignments = [],
  loading = false,
  onRefresh,
  onCompleteAssignment,
  onOpenChapter,
  onSolveAssignment,
  onToast
}) {
  const { t } = useTranslation();
  const [filterTab, setFilterTab] = useState('todo'); // 'todo' | 'completed' | 'all'
  const [submittingId, setSubmittingId] = useState(null);

  const validAssignments = useMemo(() => (Array.isArray(assignments) ? assignments.filter(Boolean) : []), [assignments]);
  const pendingList = useMemo(() => validAssignments.filter((a) => !a.isCompleted), [validAssignments]);
  const completedList = useMemo(() => validAssignments.filter((a) => a.isCompleted), [validAssignments]);

  const displayedList = useMemo(() => {
    if (filterTab === 'todo') return pendingList;
    if (filterTab === 'completed') return completedList;
    return validAssignments;
  }, [filterTab, pendingList, completedList, validAssignments]);

  const totalXpEarned = completedList.reduce((sum, a) => sum + (Number(a.xpReward) || 100), 0);

  const getDueInfo = (dueDateStr) => {
    if (!dueDateStr) return { label: 'No due date', color: '#64748b' };
    const due = new Date(dueDateStr);
    if (isNaN(due.getTime())) return { label: dueDateStr, color: '#64748b' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `Overdue (${Math.abs(diffDays)}d ago)`, color: '#dc2626', bg: '#fef2f2', isUrgent: true };
    if (diffDays === 0) return { label: 'Due Today', color: '#ea580c', bg: '#fff7ed', isUrgent: true };
    if (diffDays === 1) return { label: 'Due Tomorrow', color: '#ea580c', bg: '#fff7ed', isUrgent: true };
    return { label: `Due in ${diffDays} days (${dueDateStr})`, color: '#0369a1', bg: '#f0f9ff' };
  };

  const handleComplete = async (assign) => {
    if (!assign?.id) return;
    setSubmittingId(assign.id);
    try {
      if (onCompleteAssignment) {
        await onCompleteAssignment(assign);
      }
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <motion.div variants={fade} initial="hidden" animate="show">
      {/* Top Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} gap={2} mb={3}>
        <Box>
          <Eyebrow>CLASSROOM CURRICULUM · ASSIGNED TASKS</Eyebrow>
          <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800, color: '#20211f' }}>
            Class Assignments
          </Typography>
          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Complete assigned chapters and submit your work to earn XP and update your instructor.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={onRefresh}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} /> : <AutoAwesome fontSize="small" />}
          sx={{
            borderColor: '#e6e2d9',
            color: '#20211f',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            px: 2,
            py: 0.8,
            '&:hover': { borderColor: '#20211f', bgcolor: '#fff' }
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh Assignments'}
        </Button>
      </Stack>

      {/* 4 Summary Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {[
          {
            label: 'Total Assigned',
            val: assignments.length,
            Icon: Assignment,
            bg: '#f1f5f9',
            color: '#475569',
            sub: 'Overall class tasks'
          },
          {
            label: 'To Do (Pending)',
            val: pendingList.length,
            Icon: AssignmentTurnedIn,
            bg: pendingList.length > 0 ? '#ffedd5' : '#f0fdf4',
            color: pendingList.length > 0 ? '#ea580c' : '#16a34a',
            sub: pendingList.length > 0 ? 'Requires your submission' : 'All caught up!'
          },
          {
            label: 'Completed Tasks',
            val: completedList.length,
            Icon: TaskAlt,
            bg: '#dcfce7',
            color: '#15803d',
            sub: `${assignments.length > 0 ? Math.round((completedList.length / assignments.length) * 100) : 0}% completion rate`
          },
          {
            label: 'Assignment XP Earned',
            val: `+${totalXpEarned} XP`,
            Icon: AutoAwesome,
            bg: '#fef3c7',
            color: '#b45309',
            sub: 'Added to your level mastery'
          }
        ].map((item) => (
          <Panel key={item.label}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: item.bg, color: item.color, width: 28, height: 28 }}>
                <item.Icon sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography fontSize={11} color="text.secondary" fontWeight={700}>
                {item.label}
              </Typography>
            </Stack>
            <Typography variant="h4" mt={1.2} fontSize={{ xs: 22, sm: 26 }} fontWeight={800}>
              {item.val}
            </Typography>
            <Typography fontSize={10} color="text.secondary">
              {item.sub}
            </Typography>
          </Panel>
        ))}
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#e6e2d9', mb: 3 }}>
        <Tabs
          value={filterTab}
          onChange={(e, val) => setFilterTab(val)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 13,
              minHeight: 44
            },
            '& .Mui-selected': {
              color: '#ec735e !important'
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#ec735e'
            }
          }}
        >
          <Tab
            value="todo"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>To Do</span>
                {pendingList.length > 0 && (
                  <Chip
                    label={pendingList.length}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 10,
                      fontWeight: 800,
                      bgcolor: '#ea580c',
                      color: '#fff'
                    }}
                  />
                )}
              </Stack>
            }
          />
          <Tab
            value="completed"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Completed</span>
                <Chip
                  label={completedList.length}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontWeight: 800,
                    bgcolor: '#e2e8f0',
                    color: '#475569'
                  }}
                />
              </Stack>
            }
          />
          <Tab
            value="all"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>All Tasks</span>
                <Chip
                  label={assignments.length}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontWeight: 800,
                    bgcolor: '#f1f5f9',
                    color: '#64748b'
                  }}
                />
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {/* Assignments List */}
      {displayedList.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: '#fffdf8',
            border: '1px solid #e6e2d9'
          }}
        >
          <Avatar sx={{ mx: 'auto', bgcolor: '#f1f5f9', color: '#64748b', width: 56, height: 56, mb: 2 }}>
            <TaskAlt sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h6" fontWeight={800} color="#20211f">
            {assignments.length === 0
              ? 'No Assignments Assigned Yet'
              : filterTab === 'todo'
              ? "You're all caught up!"
              : filterTab === 'completed'
              ? 'No completed assignments yet'
              : 'No assignments found'}
          </Typography>
          <Typography fontSize={13} color="text.secondary" maxWidth={440} mx="auto" mt={0.5}>
            {assignments.length === 0
              ? 'Your teacher has not published any assignments yet. Assignments will appear here as soon as your instructor creates them in the Educator Portal.'
              : filterTab === 'todo'
              ? 'There are no pending assignments waiting for you. Excellent job staying on track with your curriculum!'
              : 'When your teacher assigns tasks, they will appear here.'}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2.5}>
          {displayedList.map((assign) => {
            const dueInfo = getDueInfo(assign.dueDate);
            const isSubmitting = submittingId === assign.id;
            const fullChapterKey = assign.chapter
              ? (assign.chapter.includes(':') ? assign.chapter : `${assign.topic || 'Algebra'}:${assign.chapter}`)
              : 'Algebra:Linear equations';

            return (
              <Paper
                key={assign.id}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  bgcolor: assign.isCompleted ? '#fafdfa' : '#ffffff',
                  border: '1.5px solid',
                  borderColor: assign.isCompleted ? '#bbf7d0' : '#fed7aa',
                  boxShadow: assign.isCompleted ? 'none' : '0 6px 20px rgba(234,88,12,0.06)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={2}>
                  {/* Left info */}
                  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: assign.isCompleted ? '#dcfce7' : '#ffedd5',
                        color: assign.isCompleted ? '#16a34a' : '#ea580c',
                        width: 46,
                        height: 46,
                        flexShrink: 0
                      }}
                    >
                      {assign.isCompleted ? <TaskAlt /> : <Assignment />}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5} mb={0.5}>
                        <Chip
                          label={assign.topic || 'General'}
                          size="small"
                          sx={{
                            bgcolor: '#f1f5f9',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: 10,
                            height: 22
                          }}
                        />
                        <Chip
                          label={`+${assign.xpReward || 100} XP`}
                          size="small"
                          sx={{
                            bgcolor: '#fef3c7',
                            color: '#b45309',
                            fontWeight: 800,
                            fontSize: 10,
                            height: 22,
                            border: '1px solid #fde68a'
                          }}
                        />
                        <Chip
                          icon={<CalendarToday sx={{ fontSize: '12px !important' }} />}
                          label={dueInfo.label}
                          size="small"
                          sx={{
                            bgcolor: dueInfo.bg || '#f8fafc',
                            color: dueInfo.color,
                            fontWeight: 700,
                            fontSize: 10,
                            height: 22,
                            border: '1px solid',
                            borderColor: dueInfo.color + '44'
                          }}
                        />
                        {assign.isCompleted && (
                          <Chip
                            icon={<CheckCircle sx={{ fontSize: '13px !important', color: '#16a34a !important' }} />}
                            label="Submitted & Verified"
                            size="small"
                            sx={{
                              bgcolor: '#dcfce7',
                              color: '#15803d',
                              fontWeight: 800,
                              fontSize: 10,
                              height: 22
                            }}
                          />
                        )}
                      </Stack>

                      <Typography variant="h5" fontWeight={800} fontSize={18} color="#20211f">
                        {assign.title}
                      </Typography>

                      <Typography fontSize={13} color="text.secondary" mt={0.5}>
                        Textbook Chapter:{' '}
                        <b style={{ color: '#20211f' }}>{assign.chapter}</b>
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Right actions */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                    <Button
                      variant="outlined"
                      size="medium"
                      onClick={() => onOpenChapter && onOpenChapter(fullChapterKey)}
                      startIcon={<MenuBook />}
                      sx={{
                        borderColor: '#cbd5e1',
                        color: '#334155',
                        fontWeight: 700,
                        fontSize: 12,
                        textTransform: 'none',
                        borderRadius: 2,
                        py: 0.9,
                        px: 2,
                        '&:hover': { borderColor: '#0ea5e9', bgcolor: '#f0f9ff' }
                      }}
                    >
                      {assign.isCompleted ? 'Review Chapter' : 'Study Chapter in Textbook'}
                    </Button>

                    {!assign.isCompleted ? (
                      <Button
                        variant="contained"
                        size="medium"
                        onClick={() => onSolveAssignment && onSolveAssignment(assign)}
                        startIcon={<Quiz />}
                        sx={{
                          bgcolor: '#ea580c',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: 12,
                          textTransform: 'none',
                          borderRadius: 2,
                          py: 0.9,
                          px: 2.5,
                          boxShadow: '0 4px 14px rgba(234,88,12,0.25)',
                          '&:hover': { bgcolor: '#c2410c' }
                        }}
                      >
                        Solve Assignment (3 Questions)
                      </Button>
                    ) : (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`Score: ${assign.score ?? 3}/${assign.totalQuestions ?? 3}`}
                          variant="filled"
                          sx={{ fontWeight: 800, px: 0.5, height: 32, fontSize: 11, bgcolor: '#dcfce7', color: '#15803d' }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => onSolveAssignment && onSolveAssignment(assign)}
                          startIcon={<TaskAlt />}
                          sx={{
                            borderColor: '#bbf7d0',
                            color: '#15803d',
                            fontWeight: 700,
                            fontSize: 12,
                            textTransform: 'none',
                            borderRadius: 2,
                            py: 0.7,
                            px: 1.5,
                            '&:hover': { bgcolor: '#f0fdf4', borderColor: '#86efac' }
                          }}
                        >
                          Review Solutions
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </motion.div>
  );
}

function Learn({ user, onToast, onCompleteQuiz, onAskTutor }) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);

  const completedChapterIds = user?.completedChapterIds || [];

  const subjectList = SUBJECT_ORDER.map((name) => {
    const chapters = getChaptersForSubject(name);
    const isMath = name === 'Mathematics';
    const completedCount = isMath
      ? completedChapterIds.filter((id) =>
          id.startsWith('Mathematics:') ||
          ['Algebra:', 'Geometry:', 'Calculus:', 'Statistics:', 'Arithmetic:'].some((p) => id.startsWith(p))
        ).length
      : completedChapterIds.filter((id) => id.startsWith(`${name}:`)).length;
    const totalCount = chapters.length || (isMath ? 23 : 4);
    const masteryVal = user?.topicProgress?.[name] ?? Math.round((completedCount / totalCount) * 100);
    const theme = SUBJECT_THEMES[name] || { color: '#ec735e', lightBg: '#fae8e2', icon: '📚' };
    return {
      name,
      totalCount,
      completedCount,
      masteryVal,
      theme,
      chapters
    };
  });

  const activeSubjectData = subjectList.find((s) => s.name === subject);
  const activeChapters = activeSubjectData?.chapters || [];

  return (
    <motion.div variants={fade} initial="hidden" animate="show">
      {/* Top Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ md: 'flex-end' }}
        gap={2}
        mb={3}
      >
        <Box>
          <Eyebrow>
            {subject
              ? `TEXTBOOK CURRICULUM · ${(t('topics.' + subject) || subject).toUpperCase()}`
              : t('learn.library')}
          </Eyebrow>
          <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800 }}>
            {subject
              ? `${t('topics.' + subject) || subject} Comprehensive Course`
              : t('learn.choose_subject')}
          </Typography>
          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            {subject
              ? `Complete textbook chapters with theory, definitions, step-by-step worked problems, and mastery quizzes.`
              : `Select a mathematical branch to access in-depth textbook chapters, formula references, and interactive quizzes.`}
          </Typography>
        </Box>
        {subject && (
          <Button
            variant="outlined"
            onClick={() => setSubject(null)}
            sx={{
              borderColor: '#e6e2d9',
              color: '#20211f',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              '&:hover': { borderColor: '#20211f' }
            }}
          >
            ← {t('learn.all_subjects')}
          </Button>
        )}
      </Stack>

      {/* ----------------------------------------------------------------- */}
      {/* VIEW 1: SUBJECT LIBRARY (GRID OF 5 CORE TEXTBOOKS)                */}
      {/* ----------------------------------------------------------------- */}
      {!subject ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
            gap: 2.5
          }}
        >
          {subjectList.map((item, index) => (
            <Panel
              key={item.name}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3.5,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1.5px solid #e6e2d9',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  borderColor: item.theme.color,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.06)'
                }
              }}
              onClick={() => setSubject(item.name)}
            >
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip
                    label={`Book 0${index + 1}`}
                    size="small"
                    sx={{
                      bgcolor: item.theme.lightBg,
                      color: item.theme.color,
                      fontWeight: 800,
                      fontSize: 10,
                      height: 22
                    }}
                  />
                  <Typography fontSize={11} color="text.secondary" fontWeight={600}>
                    {item.totalCount} Chapters
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                  <Avatar
                    sx={{
                      bgcolor: item.theme.lightBg,
                      color: item.theme.color,
                      width: 42,
                      height: 42,
                      fontSize: 20,
                      fontWeight: 800
                    }}
                  >
                    {item.theme.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={800} fontSize={18} color="#20211f">
                      {t('topics.' + item.name) || item.name}
                    </Typography>
                    <Typography fontSize={11} color="text.secondary">
                      {item.completedCount} of {item.totalCount} chapters mastered
                    </Typography>
                  </Box>
                </Stack>

                <Box mt={2.5}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography fontSize={11} color="text.secondary" fontWeight={600}>
                      Subject Mastery
                    </Typography>
                    <Typography fontSize={11} fontWeight={800} color="#20211f">
                      {item.masteryVal}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={item.masteryVal}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#eeeae2',
                      '& .MuiLinearProgress-bar': { bgcolor: item.theme.color, borderRadius: 3 }
                    }}
                  />
                </Box>
              </Box>

              <Stack direction="row" spacing={1} mt={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={(e) => {
                    e.stopPropagation();
                    const firstCh = item.chapters && item.chapters[0];
                    if (firstCh) {
                      setSelectedChapterId(firstCh.id);
                    } else {
                      setSubject(item.name);
                    }
                  }}
                  sx={{
                    bgcolor: item.theme.color,
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'none',
                    borderRadius: 2,
                    py: 1,
                    '&:hover': { opacity: 0.9, bgcolor: item.theme.color }
                  }}
                >
                  📖 Read Textbook (Ch 01)
                </Button>
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSubject(item.name);
                  }}
                  sx={{
                    borderColor: '#e6e2d9',
                    color: '#20211f',
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'none',
                    borderRadius: 2,
                    whiteSpace: 'nowrap',
                    py: 1,
                    px: 1.5,
                    '&:hover': { borderColor: item.theme.color, bgcolor: item.theme.lightBg }
                  }}
                >
                  Chapters ({item.totalCount})
                </Button>
              </Stack>
            </Panel>
          ))}
        </Box>
      ) : (
        /* --------------------------------------------------------------- */
        /* VIEW 2: CHAPTER DIRECTORY FOR SELECTED SUBJECT                  */
        /* --------------------------------------------------------------- */
        <Stack spacing={2}>
          {/* Subject Overview Banner */}
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: activeSubjectData?.theme?.lightBg || '#faf8f2',
              border: `1.5px solid ${activeSubjectData?.theme?.color || '#ec735e'}33`,
              mb: 1
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              spacing={2}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: activeSubjectData?.theme?.color || '#ec735e',
                    color: '#fff',
                    width: 44,
                    height: 44,
                    fontSize: 22
                  }}
                >
                  {activeSubjectData?.theme?.icon || '📚'}
                </Avatar>
                <Box>
                  <Typography fontWeight={800} fontSize={16} color="#20211f">
                    {subject} Curriculum Table of Contents
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    {activeSubjectData?.completedCount || 0} of {activeSubjectData?.totalCount || 5} chapters completed · {activeSubjectData?.masteryVal || 0}% Subject Mastery
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ width: { xs: '100%', sm: 160 } }}>
                <LinearProgress
                  variant="determinate"
                  value={activeSubjectData?.masteryVal || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#ffffff',
                    '& .MuiLinearProgress-bar': { bgcolor: activeSubjectData?.theme?.color || '#ec735e', borderRadius: 4 }
                  }}
                />
              </Box>
            </Stack>
          </Paper>

          {/* Chapter Cards List */}
          {activeChapters.map((ch, index) => {
            const isCompleted =
              completedChapterIds.includes(ch.id) ||
              (ch.legacyId && completedChapterIds.includes(ch.legacyId)) ||
              completedChapterIds.some((id) => id.endsWith(':' + ch.title));
            const totalDefs = (ch.definitions?.length || 0) + (ch.keyFormulas?.length || 0);
            const totalExamples = ch.workedExamples?.length || 0;
            const totalQuiz = ch.quiz?.length || 3;

            return (
              <Panel
                key={ch.id || ch.title}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  border: '1.5px solid',
                  borderColor: isCompleted ? '#bfe3c8' : '#e6e2d9',
                  bgcolor: isCompleted ? '#fcfffd' : '#ffffff',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: activeSubjectData?.theme?.color || '#ec735e',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
                  }
                }}
                onClick={() => setSelectedChapterId(ch.id)}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ md: 'center' }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  {/* Left: Chapter Num Avatar & Details */}
                  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: isCompleted
                          ? '#e8f4ea'
                          : index === 0
                          ? activeSubjectData?.theme?.color || '#ec735e'
                          : '#f1ede7',
                        color: isCompleted
                          ? '#2e7d32'
                          : index === 0
                          ? '#ffffff'
                          : '#66655f',
                        width: 44,
                        height: 44,
                        fontSize: 14,
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {isCompleted ? '✓' : String(ch.chapterNum || index + 1).padStart(2, '0')}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" mb={0.5}>
                        <Typography fontWeight={800} fontSize={16} color="#20211f">
                          {ch.title}
                        </Typography>
                        {ch.unit && (
                          <Chip
                            label={ch.unit}
                            size="small"
                            sx={{
                              bgcolor: '#fae8e2',
                              color: '#ec735e',
                              fontWeight: 700,
                              fontSize: 10,
                              height: 20
                            }}
                          />
                        )}
                        {isCompleted && (
                          <Chip
                            label="Mastered"
                            size="small"
                            sx={{
                              bgcolor: '#e8f4ea',
                              color: '#2e7d32',
                              fontWeight: 800,
                              fontSize: 10,
                              height: 20
                            }}
                          />
                        )}
                        {ch.difficulty && (
                          <Chip
                            label={ch.difficulty}
                            size="small"
                            sx={{
                              fontSize: 10,
                              bgcolor: '#f1ede7',
                              color: '#55544e',
                              height: 20,
                              fontWeight: 600
                            }}
                          />
                        )}
                        {ch.readTime && (
                          <Chip
                            label={ch.readTime}
                            size="small"
                            sx={{
                              fontSize: 10,
                              bgcolor: '#f1ede7',
                              color: '#55544e',
                              height: 20,
                              fontWeight: 600
                            }}
                          />
                        )}
                      </Stack>

                      {ch.subtitle && (
                        <Typography fontSize={12} color="text.secondary" mb={1.2}>
                          {ch.subtitle}
                        </Typography>
                      )}

                      {/* Content Feature Chips */}
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                        <Chip
                          icon={<Functions sx={{ fontSize: '13px !important' }} />}
                          label={`${totalDefs} Formulas & Defs`}
                          size="small"
                          sx={{
                            fontSize: 10,
                            bgcolor: '#faf8f2',
                            border: '1px solid #e8e4db',
                            color: '#666'
                          }}
                        />
                        <Chip
                          icon={<Lightbulb sx={{ fontSize: '13px !important' }} />}
                          label={`${totalExamples} Worked Problems`}
                          size="small"
                          sx={{
                            fontSize: 10,
                            bgcolor: '#faf8f2',
                            border: '1px solid #e8e4db',
                            color: '#666'
                          }}
                        />
                        <Chip
                          icon={<Quiz sx={{ fontSize: '13px !important' }} />}
                          label={`${totalQuiz}Q Quiz · +50 XP`}
                          size="small"
                          sx={{
                            fontSize: 10,
                            bgcolor: '#fff5f2',
                            border: '1px solid #fbdad2',
                            color: '#d95f4c',
                            fontWeight: 700
                          }}
                        />
                        <Chip
                          icon={<YouTube sx={{ fontSize: '13px !important', color: '#dc2626 !important' }} />}
                          label="YouTube Lessons"
                          size="small"
                          sx={{
                            fontSize: 10,
                            bgcolor: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#b91c1c',
                            fontWeight: 700
                          }}
                        />
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Right: Open Action */}
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', md: 'center' } }}>
                    <Button
                      variant={isCompleted ? 'outlined' : 'contained'}
                      size="medium"
                      endIcon={<ChevronRight />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChapterId(ch.id);
                      }}
                      sx={{
                        bgcolor: isCompleted ? '#ffffff' : activeSubjectData?.theme?.color || '#ec735e',
                        borderColor: isCompleted ? '#a3d9b1' : undefined,
                        color: isCompleted ? '#2e7d32' : '#ffffff',
                        fontWeight: 800,
                        fontSize: 13,
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: isCompleted ? '#f0f9f2' : undefined,
                          opacity: isCompleted ? 1 : 0.9
                        }
                      }}
                    >
                      {isCompleted ? 'Review Chapter' : 'Read & Practice'}
                    </Button>
                  </Stack>
                </Stack>
              </Panel>
            );
          })}
        </Stack>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TEXTBOOK READER MODAL                                             */}
      {/* ----------------------------------------------------------------- */}
      {selectedChapterId && (
        <TextbookReader
          key={selectedChapterId}
          chapter={selectedChapterId}
          user={user}
          onClose={() => setSelectedChapterId(null)}
          onToast={onToast}
          onCompleteQuiz={onCompleteQuiz}
          onAskTutor={onAskTutor}
        />
      )}
    </motion.div>
  );
}

function Vision({ onToast, onEarnXP }) {
  const { t } = useTranslation();
  const canvasRef = React.useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#ec735e');
  const [files, setFiles] = useState([]);
  const [problemText, setProblemText] = useState('');
  const [tutorGuidance, setTutorGuidance] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleToggleGuidance = (phrase) => {
    setTutorGuidance((prev) => {
      if (!prev || !prev.trim()) return phrase;
      if (prev.includes(phrase)) {
        return prev
          .replace(phrase, '')
          .replace(/\s*•\s*•\s*/g, ' • ')
          .replace(/^(\s*•\s*)+|(\s*•\s*)+$/g, '')
          .trim();
      }
      return `${prev.trim()} • ${phrase}`;
    });
  };

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const begin = (event) => {
    const canvas = canvasRef.current;
    const point = getPoint(event);
    setHistory((items) => [...items, canvas.toDataURL()]);
    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(point.x, point.y);
    setDrawing(true);
  };

  const draw = (event) => {
    if (!drawing) return;
    const point = getPoint(event);
    const context = canvasRef.current.getContext('2d');
    context.lineTo(point.x, point.y);
    context.strokeStyle = color;
    context.lineWidth = 4;
    context.lineCap = 'round';
    context.stroke();
  };

  const end = () => setDrawing(false);

  const clear = () => {
    const context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory([]);
    setResult('');
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    const image = new Image();
    image.onload = () => {
      const context = canvasRef.current.getContext('2d');
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.drawImage(image, 0, 0);
      setHistory((items) => items.slice(0, -1));
    };
    image.src = previous;
  };

  const addFiles = (event) => {
    const selected = Array.from(event.target.files || []).filter((file) => file.type === 'application/pdf' || file.type.startsWith('image/'));
    setFiles((items) => [...items, ...selected].slice(0, 5));
    event.target.value = '';
  };

  const solve = async () => {
    const canvas = canvasRef.current;
    let canvasAttachment = null;
    if (canvas) {
      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const ctx = offscreen.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, offscreen.width, offscreen.height);
      ctx.drawImage(canvas, 0, 0);
      const dataUrl = offscreen.toDataURL('image/jpeg', 0.95);
      const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      canvasAttachment = { mimeType: 'image/jpeg', data: b64 };
    }

    const encoded = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result || '';
              const b64 = typeof res === 'string' && res.includes(',') ? res.split(',')[1] : res;
              let mimeType = file.type || '';
              const lowerName = (file.name || '').toLowerCase();
              if (!mimeType || mimeType === 'application/octet-stream') {
                if (lowerName.endsWith('.pdf')) mimeType = 'application/pdf';
                else if (lowerName.endsWith('.png')) mimeType = 'image/png';
                else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mimeType = 'image/jpeg';
                else if (lowerName.endsWith('.webp')) mimeType = 'image/webp';
                else mimeType = 'application/pdf';
              }
              resolve({ name: file.name, mimeType, data: b64 });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
    setLoading(true);
    setResult('');
    try {
      const combinedPrompt = [
        problemText
          ? `Solve and explain this problem: ${problemText}. Transcribe what you see, teach the concept step by step with LaTeX formulas, and give the final answer.`
          : 'Read the handwritten math or uploaded problem. Transcribe what you see clearly, teach the underlying concept step by step, and show the final answer.',
        tutorGuidance ? `STUDENT GUIDANCE & MANDATORY SCOPE:\n${tutorGuidance}` : ''
      ].filter(Boolean).join('\n\n');

      const response = await api.post(
        '/ai/vision',
        {
          prompt: combinedPrompt,
          problemText,
          tutorGuidance,
          canvas: canvasAttachment,
          files: encoded
        },
        { timeout: 180000 }
      );
      setResult(response.data.reply);
      onEarnXP?.(40, 'Solved handwritten problem', 'Math Vision AI');
      onToast(t('vision.xp_toast'));
    } catch (error) {
      const isTimeout = error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'));
      const errorMsg = isTimeout
        ? 'The document took longer than expected to process. If this is a multi-page PDF, you can specify question scope (e.g. "Solve question 1 only") in the Tutor Instructions box below to get an instant answer!'
        : (typeof error.response?.data === 'string'
            ? error.response.data
            : error.response?.data?.message || error.message || 'Vision AI is temporarily busy. Please try clicking "Solve with Math Vision" again.');
      setResult(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={fade} initial="hidden" animate="show">
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'end' }} gap={2} mb={3}>
        <Box>
          <Eyebrow>{t('vision.eyebrow')}</Eyebrow>
          <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 34 } }}>
            {t('vision.title')}
          </Typography>
          <Typography color="text.secondary" fontSize={13}>
            {t('vision.subtitle')}
          </Typography>
        </Box>
        <Chip icon={<AutoAwesome />} label={t('vision.ai_ready')} color="success" variant="outlined" />
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.25fr 1fr' }, gap: 2 }}>
        <Panel>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontSize={18}>
              {t('vision.canvas_title')}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={undo} disabled={!history.length} aria-label={t('vision.undo')}>
                <Undo />
              </IconButton>
              <IconButton size="small" onClick={clear} aria-label={t('vision.clear')}>
                <DeleteOutline />
              </IconButton>
            </Stack>
          </Stack>
          <Box sx={{ border: '1px solid #e6e2d9', borderRadius: 2, bgcolor: '#fff', overflow: 'hidden', touchAction: 'none' }}>
            <canvas
              ref={canvasRef}
              width="900"
              height="450"
              onPointerDown={begin}
              onPointerMove={draw}
              onPointerUp={end}
              onPointerLeave={end}
              style={{ display: 'block', width: '100%', height: 'auto', cursor: 'crosshair' }}
            />
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mt={2}>
            <Stack direction="row" spacing={1}>
              {['#ec735e', '#5e62d6', '#18a7bd', '#e54590', '#1bad82', '#f6a10b', '#20211f'].map((swatch) => (
                <IconButton
                  key={swatch}
                  onClick={() => setColor(swatch)}
                  aria-label={`Pen color ${swatch}`}
                  sx={{
                    bgcolor: swatch,
                    width: 25,
                    height: 25,
                    border: color === swatch ? '3px solid #20211f' : '2px solid #fff',
                    '&:hover': { bgcolor: swatch }
                  }}
                />
              ))}
            </Stack>
            <Button component="label" variant="outlined" startIcon={<UploadFile />}>
              {t('vision.upload_btn')}
              <input hidden type="file" multiple accept="application/pdf,image/*" onChange={addFiles} />
            </Button>
          </Stack>
          {files.length > 0 && (
            <Stack direction="row" gap={1} flexWrap="wrap" mt={2}>
              {files.map((file, index) => (
                <Chip
                  key={`${file.name}-${index}`}
                  label={file.name}
                  onDelete={() => setFiles((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                />
              ))}
            </Stack>
          )}
          <Box mt={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type equation or topic (optional: e.g. dx/dy, 2x+5=15, ∫ x² dx)..."
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: 13
                }
              }}
            />
            <Stack direction="row" spacing={0.8} mt={1} flexWrap="wrap" gap={0.5}>
              {['dx/dy', 'dy/dx', 'x² - 5x + 6 = 0', '∫ x² dx'].map((chipFormula) => (
                <Chip
                  key={chipFormula}
                  label={chipFormula}
                  size="small"
                  onClick={() => setProblemText(chipFormula)}
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    bgcolor: problemText === chipFormula ? '#ffedd5' : '#f1ede7',
                    color: problemText === chipFormula ? '#c2410c' : '#555',
                    '&:hover': { bgcolor: '#fed7aa' }
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Tutor Instructions & Scope Message Box */}
          <Box
            mt={2.5}
            p={2}
            sx={{
              bgcolor: '#faf8f5',
              border: '1px solid #ebd9c8',
              borderRadius: 2.5,
              transition: 'all 0.2s ease'
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <EditNote sx={{ color: '#ec735e', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700} fontSize={13} color="#20211f">
                  Instructions for Tutor (Scope & Style)
                </Typography>
              </Stack>
              {Boolean(tutorGuidance) && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setTutorGuidance('')}
                  sx={{ fontSize: 11, color: '#888', minWidth: 'auto', p: 0.5, textTransform: 'none' }}
                >
                  Clear
                </Button>
              )}
            </Stack>

            <TextField
              fullWidth
              multiline
              rows={2.5}
              placeholder="Tell the tutor what to do (e.g. 'Solve questions 1 to 3 only', 'Show all algebraic steps', 'Explain like I am 10', 'Give hints first')..."
              value={tutorGuidance}
              onChange={(e) => setTutorGuidance(e.target.value)}
              sx={{
                bgcolor: '#fff',
                borderRadius: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  fontSize: 13,
                  lineHeight: 1.45
                }
              }}
            />

            {/* Quick Question Scope Suggestions */}
            <Box mt={1.5}>
              <Typography variant="caption" fontWeight={700} color="#78716c" display="block" mb={0.6}>
                🎯 Question Scope:
              </Typography>
              <Stack direction="row" spacing={0.6} flexWrap="wrap" gap={0.6}>
                {[
                  'Solve questions 1 to 3 only',
                  'Solve questions 1 to 5 only',
                  'Explain question 1 in detail',
                  'Focus on hardest questions',
                  'Solve all questions'
                ].map((chip) => {
                  const active = tutorGuidance.includes(chip);
                  return (
                    <Chip
                      key={chip}
                      label={chip}
                      size="small"
                      variant={active ? 'filled' : 'outlined'}
                      onClick={() => handleToggleGuidance(chip)}
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        bgcolor: active ? '#ffedd5' : '#fff',
                        borderColor: active ? '#ea580c' : '#e7e5e4',
                        color: active ? '#c2410c' : '#444',
                        '&:hover': { bgcolor: '#ffedd5', borderColor: '#fdba74' }
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>

            {/* Quick Explanation Style Suggestions */}
            <Box mt={1.2}>
              <Typography variant="caption" fontWeight={700} color="#78716c" display="block" mb={0.6}>
                💡 Explanation Style:
              </Typography>
              <Stack direction="row" spacing={0.6} flexWrap="wrap" gap={0.6}>
                {[
                  "Explain like I'm 10 (simple analogies)",
                  'Show all algebraic steps',
                  'Give guiding hints first',
                  'Short & concise summary',
                  'Highlight common mistakes to avoid'
                ].map((chip) => {
                  const active = tutorGuidance.includes(chip);
                  return (
                    <Chip
                      key={chip}
                      label={chip}
                      size="small"
                      variant={active ? 'filled' : 'outlined'}
                      onClick={() => handleToggleGuidance(chip)}
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        bgcolor: active ? '#ede9fe' : '#fff',
                        borderColor: active ? '#7c3aed' : '#e7e5e4',
                        color: active ? '#6d28d9' : '#444',
                        '&:hover': { bgcolor: '#ede9fe', borderColor: '#c4b5fd' }
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={solve}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? t('vision.processing') : t('vision.solve_btn')}
          </Button>
        </Panel>
        <Panel sx={{ minHeight: 500 }}>
          <Typography variant="h5" fontSize={18} mb={2}>
            {t('vision.solution_title')}
          </Typography>
          {loading ? (
            <Box sx={{ height: 390, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'text.secondary', p: 3 }}>
              <Box>
                <CircularProgress size={44} sx={{ color: '#ec735e', mb: 2 }} />
                <Typography fontWeight={800} fontSize={16} color="text.primary">
                  Analyzing Math Document...
                </Typography>
                <Typography fontSize={12} mt={1} color="text.secondary" maxWidth={360}>
                  Extracting equations and computing step-by-step solutions with Math Vision AI. Multi-page PDFs may take up to a minute.
                </Typography>
              </Box>
            </Box>
          ) : result ? (
            <MathMessage content={result} isUser={false} />
          ) : (
            <Box sx={{ height: 390, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'text.secondary', p: 3 }}>
              <Box>
                <AutoAwesome sx={{ fontSize: 40, color: '#5e62d6', mb: 1 }} />
                <Typography fontWeight={800}>{t('vision.empty_title')}</Typography>
                <Typography fontSize={12} mt={1}>
                  {t('vision.empty_sub')}
                </Typography>
              </Box>
            </Box>
          )}
        </Panel>
      </Box>
    </motion.div>
  );
}

function Analytics({ user, onSwitchAccount, onToast }) {
  const { t } = useTranslation();
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isDemo = false;
  const xp = user?.xp || 0;
  const streak = user?.streak || 0;
  const focusMinutes = user?.focusMinutes || 0;
  const problemsSolved = user?.problemsSolved || 0;
  const accuracy = user?.accuracy || (problemsSolved > 0 ? 94.5 : 0);
  const completedChapterIds = user?.completedChapterIds || [];
  const completedCount = completedChapterIds.length;
  const accounts = user?.email ? getAccountsForEmail(user.email) : [];
  const otherAccount = accounts.find((a) => (a.accountId || '1') !== (user?.accountId || '1'));

  // Calculate Mathematics completion across all 23 chapters
  const mathCompletedCount = completedChapterIds.filter((id) =>
    id.startsWith('Mathematics:') ||
    ['Algebra:', 'Geometry:', 'Calculus:', 'Statistics:', 'Arithmetic:'].some((p) => id.startsWith(p))
  ).length;

  const legacyMathAvg = user?.topicProgress ? Math.round(
    ((user.topicProgress.Algebra || 0) +
     (user.topicProgress.Geometry || 0) +
     (user.topicProgress.Calculus || 0) +
     (user.topicProgress.Statistics || 0) +
     (user.topicProgress.Arithmetic || 0)) / 5
  ) : 0;

  const mathMasteryVal = user?.topicProgress?.Mathematics ?? (
    legacyMathAvg > 0 ? legacyMathAvg : Math.min(100, Math.round((mathCompletedCount / 23) * 100))
  );

  const userTopics = [
    [t('topics.Mathematics') || 'Mathematics', mathMasteryVal, '#ec735e'],
    [t('topics.Physics') || 'Physics', user?.topicProgress?.Physics ?? Math.round((completedChapterIds.filter((id) => id.startsWith('Physics:')).length / 4) * 100), '#4f46e5'],
    [t('topics.Computer Science') || 'Computer Science', user?.topicProgress?.['Computer Science'] ?? Math.round((completedChapterIds.filter((id) => id.startsWith('Computer Science:')).length / 4) * 100), '#0d9488'],
    [t('topics.Chemistry') || 'Chemistry', user?.topicProgress?.Chemistry ?? Math.round((completedChapterIds.filter((id) => id.startsWith('Chemistry:')).length / 4) * 100), '#e11d48']
  ];

  const chartActivity = getTrailing7Days(user?.dailyActivity || {}, isDemo, focusMinutes, streak);

  const pieData = [
    { name: t('topics.Mathematics') || 'Mathematics', value: Math.max(10, mathMasteryVal || 25) },
    { name: t('topics.Physics') || 'Physics', value: Math.max(10, user?.topicProgress?.Physics || 20) },
    { name: t('topics.Computer Science') || 'Computer Science', value: Math.max(10, user?.topicProgress?.['Computer Science'] || 20) },
    { name: t('topics.Chemistry') || 'Chemistry', value: Math.max(10, user?.topicProgress?.Chemistry || 20) }
  ];

  const formattedTime = clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = clock.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  const recentList = user?.recentActivity?.length
    ? user.recentActivity.slice(0, 5)
    : [
        { id: 1, title: 'Session Active', topic: 'TutorMind Learner', time: 'Just now', xp: '+0 XP', badge: 'Active' }
      ];

  return (
    <motion.div variants={fade} initial="hidden" animate="show">
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} gap={2} mb={3}>
        <Box>
          <Eyebrow>{t('analytics.eyebrow')} · {formattedDate.toUpperCase()}</Eyebrow>
          <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 34 } }}>
            {t('analytics.title')}
          </Typography>
          <Typography color="text.secondary" fontSize={13}>
            {xp > 0 ? t('analytics.sub_active') : t('analytics.sub_new')}
          </Typography>
        </Box>

        {/* Live Clock & Profile Context */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Paper sx={{ px: 2, py: 1, bgcolor: '#fff', border: '1px solid #e6e2d9', borderRadius: 2 }}>
            <Typography fontSize={10} color="text.secondary" fontWeight={700}>
              LIVE STUDY CLOCK
            </Typography>
            <Typography fontSize={13} fontWeight={800} sx={{ fontFamily: 'DM Mono, monospace', color: '#ec735e' }}>
              {formattedTime}
            </Typography>
          </Paper>

          {otherAccount && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<SwapHoriz />}
              onClick={() => {
                onSwitchAccount?.(otherAccount);
                onToast?.(`Switched to ${otherAccount.name}'s analytics`);
              }}
              sx={{ fontSize: 11, borderColor: '#e6e2d9', color: '#20211f', py: 1, textTransform: 'none', fontWeight: 700 }}
            >
              View {otherAccount.name} ({otherAccount.accountId === '2' ? 'Learner 2' : 'Learner 1'})
            </Button>
          )}
        </Stack>
      </Stack>

      {/* 4 Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Panel>
          <Eyebrow>TOTAL HOURS ONLINE</Eyebrow>
          <Typography variant="h4" fontSize={{ xs: 22, sm: 26 }} fontWeight={800} mt={0.5}>
            {(focusMinutes / 60).toFixed(1)} <span style={{ fontSize: 14, fontWeight: 500 }}>hrs</span>
          </Typography>
          <Typography fontSize={11} color="text.secondary" mt={0.5}>
            {focusMinutes} total focused minutes
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.round((focusMinutes / 120) * 100))}
            sx={{ mt: 2, height: 4, bgcolor: '#eeeae2', '& .MuiLinearProgress-bar': { bgcolor: '#ec735e' } }}
          />
        </Panel>

        <Panel>
          <Eyebrow>TOTAL XP & LEVEL</Eyebrow>
          <Typography variant="h4" fontSize={{ xs: 22, sm: 26 }} fontWeight={800} mt={0.5}>
            {xp.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500 }}>XP</span>
          </Typography>
          <Typography fontSize={11} color="text.secondary" mt={0.5}>
            Level {Math.floor(xp / 100) + 1} ({xp % 100}/100 to next)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={xp % 100}
            sx={{ mt: 2, height: 4, bgcolor: '#eeeae2', '& .MuiLinearProgress-bar': { bgcolor: '#f6c857' } }}
          />
        </Panel>

        <Panel>
          <Eyebrow>CHAPTERS MASTERED</Eyebrow>
          <Typography variant="h4" fontSize={{ xs: 22, sm: 26 }} fontWeight={800} mt={0.5}>
            {completedCount} <span style={{ fontSize: 14, fontWeight: 500 }}>/ 23</span>
          </Typography>
          <Typography fontSize={11} color="text.secondary" mt={0.5}>
            {Math.round((completedCount / 23) * 100)}% of total curriculum
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.round((completedCount / 23) * 100)}
            sx={{ mt: 2, height: 4, bgcolor: '#eeeae2', '& .MuiLinearProgress-bar': { bgcolor: '#2e7d32' } }}
          />
        </Panel>

        <Panel>
          <Eyebrow>ACCURACY & SOLVED</Eyebrow>
          <Typography variant="h4" fontSize={{ xs: 22, sm: 26 }} fontWeight={800} mt={0.5}>
            {accuracy}%
          </Typography>
          <Typography fontSize={11} color="text.secondary" mt={0.5}>
            {problemsSolved} math problems completed
          </Typography>
          <LinearProgress
            variant="determinate"
            value={accuracy}
            sx={{ mt: 2, height: 4, bgcolor: '#eeeae2', '& .MuiLinearProgress-bar': { bgcolor: '#5e62d6' } }}
          />
        </Panel>
      </Box>

      {/* Grid: 7-Day Performance Rhythm, Subject Mastery, Time Breakdown */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' }, gap: 2, mb: 3 }}>
        <Panel sx={{ gridColumn: { md: 'span 2' } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Box>
              <Eyebrow>{t('analytics.performance_overview')}</Eyebrow>
              <Typography variant="h5" fontSize={18}>
                {xp > 0 ? t('analytics.steady_rhythm') : t('analytics.practice_activity')}
              </Typography>
            </Box>
            <Chip
              label={`${user.accountId === '2' ? 'Learner 2' : 'Learner 1'}: ${user.name}`}
              size="small"
              sx={{ bgcolor: user.accountId === '2' ? '#e8f4ea' : '#fae8e2', color: user.accountId === '2' ? '#2e7d32' : '#ec735e', fontWeight: 700 }}
            />
          </Stack>
          <Typography fontSize={11} color="text.secondary" mb={2}>
            Daily study time and practice rhythm over the past 7 days.
          </Typography>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartActivity}>
              <CartesianGrid vertical={false} stroke="#eeeae2" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="minutes" stroke="#ec735e" fill="#fae8e2" strokeWidth={3} name="Minutes Online" />
              <Area type="monotone" dataKey="xp" stroke="#5e62d6" fill="#eee8fb" strokeWidth={2} name="XP Earned" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <Eyebrow>{t('analytics.topic_mastery')}</Eyebrow>
          <Typography variant="h5" fontSize={18} mb={1}>
            {t('analytics.where_you_shine')}
          </Typography>
          <Typography fontSize={11} color="text.secondary" mb={2}>
            Mastery percentage across all 5 textbook subjects.
          </Typography>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={userTopics} layout="vertical">
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="0" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="1" fill="#ec735e" radius={[0, 4, 4, 0]} name="Mastery %" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <Eyebrow>{t('analytics.time_spent')}</Eyebrow>
          <Typography variant="h5" fontSize={18} mb={1}>
            {t('analytics.this_week')}
          </Typography>
          <Typography fontSize={11} color="text.secondary" mb={2}>
            Domain focus balance across topics.
          </Typography>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={80}>
                {['#ec735e', '#f6c857', '#c7b9e9', '#84b98a', '#d8a47f'].map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </Box>

      {/* Recent Activity Log Panel */}
      <Panel>
        <Eyebrow>RECENT STUDY TIMELINE & SOLVED PROBLEMS</Eyebrow>
        <Typography variant="h5" fontSize={18} mb={2}>
          Activity log for {user.name} ({user.accountId === '2' ? 'Learner 2' : 'Learner 1'})
        </Typography>
        <Stack spacing={1.5}>
          {recentList.map((act) => (
            <Paper key={act.id} sx={{ p: 1.5, border: '1px solid #eeeae2', bgcolor: '#fffdf8', borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: act.iconBg || '#e8f4ea', color: act.iconColor || '#2e7d32', width: 34, height: 34, fontSize: 14 }}>
                  {act.icon || '✓'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} fontSize={13}>
                    {act.title}
                  </Typography>
                  <Typography fontSize={11} color="text.secondary">
                    {act.topic} · <span style={{ color: '#73726a' }}>{act.time}</span>
                  </Typography>
                </Box>
                <Chip
                  label={act.xp || '+50 XP'}
                  size="small"
                  sx={{ bgcolor: '#faf0ea', color: '#ec735e', fontWeight: 800, fontSize: 11 }}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Panel>
    </motion.div>
  );
}

function Tutor({ user, initialPrompt, onClearInitialPrompt, officeHours = null, onCallTeacher = null }) {
  const { t } = useTranslation();
  const firstName = (user?.name || 'there').split(' ')[0];
  const userInitials = user?.initials || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME');

  const defaultWelcome = {
    role: 'bot',
    text: `Hello ${firstName}! 👋 I am your TutorMind AI Tutor  How can I help you today? `,
    time: 'Just now'
  };

  const [messages, setMessages] = useState([defaultWelcome]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [inquiryCount, setInquiryCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      send(initialPrompt.trim());
      onClearInitialPrompt?.();
    }
  }, [initialPrompt]);

  const quickPrompts = [
    'Explain the Pythagorean theorem with an example',
    'How do I solve 2x + 5 = 15 step by step?',
    'What is a derivative in calculus intuitively?',
    'How do I factor quadratic equations?'
  ];

  const send = async (customText) => {
    const question = (customText || value).trim();
    if (!question || loading) return;
    setValue('');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((current) => [...current, { role: 'user', text: question, time: nowTime }]);
    setLoading(true);

    const nextInquiries = inquiryCount + 1;
    setInquiryCount(nextInquiries);
    if (nextInquiries >= 3 && nextInquiries % 3 === 0) {
      api.post('/student/struggle-signal', {
        subject: user?.favoriteTopic || 'Mathematics',
        chapterTitle: 'Socratic Tutor Inquiry',
        triggerType: 'repeated_questions',
        inquiryCount: nextInquiries,
        detail: `Asked ${nextInquiries} consecutive questions in Tutor chat: "${question.slice(0, 45)}..."`
      }).catch(() => {});
    }
    try {
      const response = await api.post('/ai/chat', {
        message: question,
        sessionId: `tutor-${user?.email || 'session'}-${user?.accountId || '1'}`
      });
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((current) => [...current, { role: 'bot', text: response.data.reply, time: replyTime }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'bot',
          text: error.response?.data?.message || 'I cannot reach the tutor service right now. Please make sure the backend is running.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([defaultWelcome]);
  };

  return (
    <motion.div variants={fade} initial="hidden" animate="show" style={{ width: '100%' }}>
      <Box mb={3}>
        <Eyebrow>{t('tutor.eyebrow')}</Eyebrow>
        <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 34 } }}>
          {t('tutor.title')}
        </Typography>
        <Typography color="text.secondary" fontSize={13}>
          {t('tutor.subtitle')}
        </Typography>
      </Box>

      <Panel sx={{ width: '100%', p: { xs: 1.5, md: 2.5 } }}>
        {/* Chat Header Bar */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" pb={2} mb={2} borderBottom="1px solid #eeeae2">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: '#ec735e', color: '#fff', width: 34, height: 34 }}>
              <Psychology fontSize="small" />
            </Avatar>
            <Box>
              <Typography fontSize={13} fontWeight={700} color="#20211f">
                TutorMind Tutor
              </Typography>
              <Typography fontSize={11} color="text.secondary">
                Always here to guide you step by step
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {officeHours && (
              <Button
                size="small"
                variant={officeHours.isLive ? 'contained' : 'outlined'}
                startIcon={<Videocam fontSize="small" />}
                onClick={() => onCallTeacher?.('Tutor Consultation')}
                sx={{
                  bgcolor: officeHours.isLive ? '#059669' : 'transparent',
                  borderColor: officeHours.isLive ? '#059669' : '#cbd5e1',
                  color: officeHours.isLive ? '#fff' : '#64748b',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': { bgcolor: officeHours.isLive ? '#047857' : '#f1f5f9' }
                }}
              >
                {officeHours.isLive ? 'Video Call Teacher' : 'Teacher Away'}
              </Button>
            )}
            {messages.length > 1 && (
              <Button size="small" variant="text" onClick={handleClear} sx={{ fontSize: 11, color: '#888' }}>
                Clear Chat
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Message Container */}
        <Box
          sx={{
            minHeight: { xs: 350, md: 440 },
            maxHeight: '62vh',
            overflowY: 'auto',
            pr: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {messages.map((m, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                gap: 1.5,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: { xs: '92%', md: '80%' },
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: m.role === 'user' ? (user?.avatarBg || '#ec735e') : '#f4efe8',
                  color: m.role === 'user' ? (user?.avatarColor || '#fff') : '#ec735e',
                  width: 32,
                  height: 32,
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid #e6e2d9',
                  flexShrink: 0
                }}
              >
                {m.role === 'user' ? userInitials : '✦'}
              </Avatar>
              <Box>
                <Box
                  sx={{
                    bgcolor: m.role === 'user' ? '#fae8e2' : '#fffdf8',
                    border: '1px solid',
                    borderColor: m.role === 'user' ? '#f5d5cb' : '#e8e4db',
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 2.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <MathMessage content={m.text} isUser={m.role === 'user'} />
                </Box>
                {m.time && (
                  <Typography fontSize={10} color="text.secondary" sx={{ mt: 0.5, px: 0.5, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                    {m.time}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', gap: 1.5, alignSelf: 'flex-start', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: '#f4efe8', color: '#ec735e', width: 32, height: 32, border: '1px solid #e6e2d9' }}>
                <AutoAwesome sx={{ fontSize: 16 }} />
              </Avatar>
              <Paper sx={{ p: 1.5, bgcolor: '#fffdf8', border: '1px solid #e8e4db', borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={14} sx={{ color: '#ec735e' }} />
                  <Typography fontSize={12} color="text.secondary">
                    TutorMind is thinking...
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Quick Suggested Prompts when only 1 message */}
        {messages.length === 1 && (
          <Box mt={3} pt={2} borderTop="1px dashed #e6e2d9">
            <Typography fontSize={11} fontWeight={700} color="text.secondary" mb={1.2}>
              💡 Suggested Questions:
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {quickPrompts.map((prompt) => (
                <Chip
                  key={prompt}
                  label={prompt}
                  onClick={() => send(prompt)}
                  sx={{
                    bgcolor: '#fff',
                    border: '1px solid #e6e2d9',
                    fontSize: 11,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f7f5ef', borderColor: '#ec735e' }
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Chat Input Bar */}
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
          sx={{ mt: 3, pt: 2, borderTop: '1px solid #eeeae2' }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              fullWidth
              size="medium"
              placeholder={t('tutor.placeholder') || "Ask any math problem, concept, or formula..."}
              value={value}
              disabled={loading}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fff',
                  borderRadius: 2,
                  fontSize: 13,
                  '& fieldset': { borderColor: '#e6e2d9' },
                  '&:hover fieldset': { borderColor: '#ec735e' },
                  '&.Mui-focused fieldset': { borderColor: '#ec735e' }
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !value.trim()}
              endIcon={<Send fontSize="small" />}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                fontSize: 12,
                fontWeight: 700,
                minWidth: 100
              }}
            >
              {loading ? 'Thinking...' : t('tutor.send') || 'Send'}
            </Button>
          </Stack>
        </Box>
      </Panel>
    </motion.div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('tutormind-user') || localStorage.getItem('mathlingo-user');
      if (!raw || raw === 'undefined' || raw === 'null') return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState(() => {
    try {
      if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/teacher') || window.location.search.includes('portal=teacher') || window.location.hash.includes('teacher'))) {
        return 'teacher';
      }
      const raw = localStorage.getItem('tutormind-user') || localStorage.getItem('mathlingo-user');
      if (!raw || raw === 'undefined' || raw === 'null') return 'overview';
      const stored = JSON.parse(raw);
      if (stored?.role === 'teacher') return 'teacher';
    } catch {}
    return 'overview';
  });
  const [toast, setToast] = useState('');
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [readerChapter, setReaderChapter] = useState(null);
  const [activeSolvingAssignment, setActiveSolvingAssignment] = useState(null);
  const [activeTeacherHint, setActiveTeacherHint] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tutormind_dismissed_announcements') || localStorage.getItem('mathlingo_dismissed_announcements') || '[]');
    } catch {
      return [];
    }
  });

  // 📹 Live Office Hours & Video Calling States
  const [officeHours, setOfficeHours] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [activeLiveMeeting, setActiveLiveMeeting] = useState(null);
  const [dismissedMeetingId, setDismissedMeetingId] = useState(null);

  const activeMeetingRef = useRef(null);
  const dismissedMeetingIdRef = useRef(null);

  useEffect(() => {
    activeMeetingRef.current = activeMeeting;
  }, [activeMeeting]);

  useEffect(() => {
    dismissedMeetingIdRef.current = dismissedMeetingId;
  }, [dismissedMeetingId]);

  const fetchOfficeHours = async () => {
    try {
      const res = await api.get('/student/office-hours');
      if (res.data?.officeHours) {
        setOfficeHours(res.data.officeHours);
      }
    } catch (err) {}
  };

  const pollActiveCall = async () => {
    if (!user || user.role === 'teacher') return;
    try {
      const res = await api.get('/calls/active');
      const active = res.data?.activeCall;
      if (active) {
        setActiveLiveMeeting(active);
        // If the student is already actively inside the VirtualMeetingRoom for this call, do not show ringing popup
        if (activeMeetingRef.current) {
          setIncomingCall(null);
          return;
        }
        // If student dismissed the ringing prompt for this meeting, respect dismissal (banner remains available)
        if (dismissedMeetingIdRef.current === active.id) {
          setIncomingCall(null);
          return;
        }
        // Trigger incoming call dialog modal
        setIncomingCall(active);
      } else {
        setActiveLiveMeeting(null);
        setIncomingCall(null);
      }
    } catch (err) {}
  };

  const handleStartCallWithTeacher = async (topicArg) => {
    const topic = typeof topicArg === 'string' && topicArg.trim() ? topicArg : '1-on-1 Office Hours Consultation';
    try {
      const res = await api.post('/calls/initiate', {
        callerRole: 'student',
        callerName: user?.name || user?.username || 'Student',
        callerEmail: user?.email || '',
        calleeRole: 'teacher',
        topic
      });
      if (res.data?.call) {
        activeMeetingRef.current = res.data.call;
        setActiveMeeting(res.data.call);
        toastIt('Connecting to live teacher meeting room...');
      }
    } catch (err) {
      console.error('Call initiation error:', err);
      toastIt('Could not initiate call. Please check office hours status.');
    }
  };

  const handleSendOfficeHoursPing = async (pingData) => {
    try {
      await api.post('/student/office-hours/ping', {
        ...pingData,
        studentName: user?.name || user?.username || pingData.studentName || 'Student',
        studentEmail: user?.email || pingData.studentEmail || ''
      });
      toastIt('Meeting request sent to Prof. Sarah Jenkins!');
    } catch (err) {
      toastIt('Failed to send meeting request.');
    }
  };

  const handleAcceptIncomingCall = async () => {
    if (!incomingCall) return;
    const callToAccept = incomingCall;
    setIncomingCall(null);
    activeMeetingRef.current = callToAccept;
    try {
      const res = await api.post(`/calls/${callToAccept.id}/respond`, { action: 'accept' });
      const acceptedCall = res.data?.call || callToAccept;
      activeMeetingRef.current = acceptedCall;
      setActiveMeeting(acceptedCall);
      toastIt(`Connected to live meeting with ${callToAccept.caller?.name || 'Prof. Sarah Jenkins'}!`);
    } catch (err) {
      activeMeetingRef.current = callToAccept;
      setActiveMeeting(callToAccept);
      toastIt(`Connected to live meeting with ${callToAccept.caller?.name || 'Prof. Sarah Jenkins'}!`);
    }
  };

  const handleDeclineIncomingCall = async () => {
    if (!incomingCall) return;
    const callToDecline = incomingCall;
    setIncomingCall(null);
    dismissedMeetingIdRef.current = callToDecline.id;
    setDismissedMeetingId(callToDecline.id);
    try {
      await api.post(`/calls/${callToDecline.id}/respond`, {
        action: 'decline',
        userId: user?.id,
        userEmail: user?.email
      });
      toastIt('Meeting invitation dismissed.');
    } catch (err) {}
  };

  const handleJoinLiveMeeting = async (meeting) => {
    const target = meeting || activeLiveMeeting;
    if (!target) return;
    setIncomingCall(null);
    activeMeetingRef.current = target;
    try {
      const res = await api.post(`/calls/${target.id}/respond`, { action: 'accept' });
      const accepted = res.data?.call || target;
      activeMeetingRef.current = accepted;
      setActiveMeeting(accepted);
      toastIt(`Connected to live meeting with ${target.caller?.name || 'Prof. Sarah Jenkins'}!`);
    } catch (err) {
      activeMeetingRef.current = target;
      setActiveMeeting(target);
      toastIt(`Connected to live meeting with ${target.caller?.name || 'Prof. Sarah Jenkins'}!`);
    }
  };

  const handleEndMeeting = () => {
    activeMeetingRef.current = null;
    setActiveMeeting(null);
    fetchOfficeHours();
    toastIt('Meeting concluded.');
  };

  const fetchAnnouncements = async () => {
    if (!user || user.role === 'teacher') return;
    try {
      const res = await api.get('/student/announcements');
      if (res.data?.announcements) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {}
  };

  const handleDismissAnnouncement = (announcementId) => {
    setDismissedAnnouncements((prev) => {
      const next = [...prev, announcementId];
      try {
        localStorage.setItem('tutormind_dismissed_announcements', JSON.stringify(next));
        localStorage.setItem('mathlingo_dismissed_announcements', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const fetchAssignments = async () => {
    if (!user || user.role === 'teacher') return;
    setAssignmentsLoading(true);
    try {
      const res = await api.get('/student/assignments');
      if (res.data?.assignments) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      // ignore
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const fetchInterventions = async () => {
    if (!user || user.role === 'teacher') return;
    try {
      const res = await api.get('/student/interventions');
      if (res.data?.interventions?.length > 0) {
        setActiveTeacherHint(res.data.interventions[0]);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchOfficeHours();
    if (user && user.role !== 'teacher') {
      fetchAssignments();
      fetchInterventions();
      fetchAnnouncements();
      pollActiveCall();
      const interval = setInterval(() => {
        fetchAssignments();
        fetchInterventions();
        fetchAnnouncements();
        fetchOfficeHours();
        pollActiveCall();
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [user?.id, user?.email]);

  const handleAcknowledgeHint = async (applyToTutor = false) => {
    if (!activeTeacherHint) return;
    const hint = activeTeacherHint;
    setActiveTeacherHint(null);
    try {
      await api.post(`/student/interventions/${hint.id}/ack`);
    } catch {}
    if (applyToTutor) {
      setTutorInitialPrompt(`My teacher gave me this guidance hint for ${hint.chapter}: "${hint.hintText}". How can I use this to solve and understand the concept step by step?`);
      setPage('tutor');
    }
  };

  const handleCompleteAssignment = async (assignment, submissionData = {}) => {
    try {
      const res = await api.post(`/student/assignments/${assignment.id}/complete`, {
        score: submissionData.score,
        total: submissionData.total || 3
      });
      if (res.data?.success) {
        const earned = res.data.earnedXp || 100;
        const scoreStr = typeof submissionData.score === 'number' ? ` (Score: ${submissionData.score}/${submissionData.total || 3})` : '';
        awardXP(earned, `Assignment: ${assignment.title}${scoreStr}`, assignment.topic, `${assignment.topic}:${assignment.chapter}`);
        toastIt(`🎉 Assignment "${assignment.title}" submitted!${scoreStr} +${earned} XP earned!`);
        fetchAssignments();
      } else if (res.data?.alreadyCompleted) {
        toastIt('Assignment updated with latest score.');
        fetchAssignments();
      }
    } catch (err) {
      toastIt(err.response?.data?.message || 'Failed to submit assignment.');
    }
  };

  const toastIt = (text) => {
    setToast(text);
    setTimeout(() => setToast(''), 3000);
  };

  const saveUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('tutormind-user', JSON.stringify(updatedUser));
    localStorage.setItem('mathlingo-user', JSON.stringify(updatedUser));
    if (updatedUser?.email) {
      const cleanEmail = updatedUser.email.toLowerCase();
      const existing = getAccountsForEmail(cleanEmail);
      const targetId = updatedUser.accountId || '1';
      let found = false;
      const updatedAccounts = existing.map((acc) => {
        if ((acc.accountId || '1') === targetId) {
          found = true;
          return { ...acc, ...updatedUser, accountId: targetId };
        }
        return acc;
      });
      if (!found) {
        updatedAccounts.push({ ...updatedUser, accountId: targetId });
      }
      saveAccountsForEmail(cleanEmail, updatedAccounts);
      api.post('/auth/student-session', { student: updatedUser, event: 'update_profile' }).catch(() => {});
    }
  };

  // Rehydrate student session and sync all local accounts to backend roster
  useEffect(() => {
    if (user && user.role !== 'teacher') {
      api.post('/auth/student-session', { student: user, event: 'session_start' }).catch(() => {});
      try {
        const emails = getSavedEmails();
        let allAccounts = [];
        emails.forEach((em) => {
          allAccounts = allAccounts.concat(getAccountsForEmail(em));
        });
        if (allAccounts.length > 0) {
          api.post('/auth/sync-roster', { accounts: allAccounts }).catch(() => {});
        }
      } catch (err) {}
    }
  }, [user?.email, user?.accountId]);

  // Real-time Active Online Pulse: notifies educator portal every 15s, on window focus, and on page visibility
  useEffect(() => {
    if (!user || user.role === 'teacher') return;

    const pingOnline = () => {
      if (user?.email) {
        api.post('/auth/student-session', { student: user, event: 'heartbeat' }).catch(() => {});
      }
    };

    // Immediate ping on session initialization
    pingOnline();

    // Fast 15s interval so teacher dashboard immediately shows online and stays current
    const pulseTimer = setInterval(pingOnline, 15000);

    const onFocus = () => pingOnline();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pingOnline();
      }
    };

    const onBeforeUnload = () => {
      if (user?.email) {
        const payload = JSON.stringify({ student: { email: user.email, id: user.id }, event: 'logout' });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('http://localhost:5000/api/auth/student-session', new Blob([payload], { type: 'application/json' }));
        } else {
          api.post('/auth/student-session', { student: user, event: 'logout' }).catch(() => {});
        }
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      clearInterval(pulseTimer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [user?.email, user?.id]);

  // Live Active Online Time Tracking: increment focusMinutes & dailyActivity every minute while online
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setUser((prev) => {
        if (!prev) return prev;
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const newFocus = (prev.focusMinutes || 0) + 1;
        const dayData = prev.dailyActivity?.[todayStr] || { minutes: 0, xp: 0, problemsSolved: 0 };
        const updatedDailyActivity = {
          ...(prev.dailyActivity || {}),
          [todayStr]: {
            ...dayData,
            minutes: (dayData.minutes || 0) + 1
          }
        };
        const updated = {
          ...prev,
          focusMinutes: newFocus,
          lastActiveDate: todayStr,
          dailyActivity: updatedDailyActivity
        };
        localStorage.setItem('tutormind-user', JSON.stringify(updated));
        localStorage.setItem('mathlingo-user', JSON.stringify(updated));
        if (updated.email) {
          const cleanEmail = updated.email.toLowerCase();
          const existing = getAccountsForEmail(cleanEmail);
          const targetId = updated.accountId || '1';
          const updatedAccounts = existing.map((acc) =>
            (acc.accountId || '1') === targetId ? { ...acc, ...updated } : acc
          );
          saveAccountsForEmail(cleanEmail, updatedAccounts);
          api.post('/auth/student-session', { student: updated, event: 'heartbeat' }).catch(() => {});
        }
        return updated;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [user?.email, user?.accountId]);

  const handleSwitchAccount = (targetAccount) => {
    setUser(targetAccount);
    localStorage.setItem('tutormind-user', JSON.stringify(targetAccount));
    localStorage.setItem('mathlingo-user', JSON.stringify(targetAccount));
    api.post('/auth/student-session', { student: targetAccount, event: 'switch_profile' }).catch(() => {});
  };

  const awardXP = (amount, title = 'Completed Lesson', topic = 'Algebra', chapterId = null) => {
    setUser((prev) => {
      if (!prev) return prev;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = prev.streak || 0;
      if (prev.lastActiveDate === yesterdayStr) {
        newStreak = (prev.streak || 0) + 1;
      } else if (prev.lastActiveDate === todayStr) {
        newStreak = Math.max(1, prev.streak || 1);
      } else {
        newStreak = 1;
      }

      const currentDayData = prev.dailyActivity?.[todayStr] || { minutes: 0, xp: 0, problemsSolved: 0 };
      const updatedDailyActivity = {
        ...(prev.dailyActivity || {}),
        [todayStr]: {
          minutes: (currentDayData.minutes || 0) + 5,
          xp: (currentDayData.xp || 0) + amount,
          problemsSolved: (currentDayData.problemsSolved || 0) + 1
        }
      };

      const currentXP = prev.xp || 0;
      const newXP = currentXP + amount;
      const oldLevel = Math.floor(currentXP / 100) + 1;
      const newLevel = Math.floor(newXP / 100) + 1;
      const newSolved = (prev.problemsSolved || 0) + 1;
      const newFocus = (prev.focusMinutes || 0) + 5;

      let updatedCompletedChapterIds = [...(prev.completedChapterIds || [])];
      if (chapterId && !updatedCompletedChapterIds.includes(chapterId)) {
        updatedCompletedChapterIds.push(chapterId);
      }
      const newChapters = updatedCompletedChapterIds.length;

      // Update topic mastery
      const isMath = topic === 'Mathematics' || ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Arithmetic'].includes(topic);
      const targetTopic = isMath ? 'Mathematics' : topic;
      const mathCompletedCount = updatedCompletedChapterIds.filter((id) =>
        id.startsWith('Mathematics:') ||
        ['Algebra:', 'Geometry:', 'Calculus:', 'Statistics:', 'Arithmetic:'].some((p) => id.startsWith(p))
      ).length;
      const totalSubjectChapters = isMath ? 23 : (chapterCatalog[targetTopic]?.length || 4);
      const subjectCompletedCount = isMath
        ? mathCompletedCount
        : updatedCompletedChapterIds.filter((id) => id.startsWith(`${targetTopic}:`)).length;
      const calculatedMastery = Math.min(100, Math.round((subjectCompletedCount / totalSubjectChapters) * 100));
      const updatedTopicProgress = {
        ...(prev.topicProgress || { Mathematics: 0, Physics: 0, 'Computer Science': 0, Chemistry: 0 }),
        [targetTopic]: calculatedMastery,
        ...(isMath ? { Mathematics: calculatedMastery } : {})
      };

      const timeFormatted = today.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + ' · Today';

      const newActivity = [
        {
          id: Date.now(),
          icon: topic === 'Math Vision AI' ? '👁' : '✓',
          iconBg: topic === 'Math Vision AI' ? '#faf0ea' : '#e8f4ea',
          iconColor: topic === 'Math Vision AI' ? '#ec735e' : '#2e7d32',
          title: title,
          topic: `${topic}`,
          time: timeFormatted,
          xp: `+${amount} XP`,
          badge: amount >= 50 ? '100% Quiz' : 'Completed'
        },
        ...(prev.recentActivity || []).slice(0, 8)
      ];

      const visionSolves = topic === 'Math Vision AI' ? ((prev.visionSolves || 0) + 1) : (prev.visionSolves || 0);

      const next = {
        ...prev,
        xp: newXP,
        streak: newStreak,
        lastActiveDate: todayStr,
        dailyActivity: updatedDailyActivity,
        focusMinutes: newFocus,
        problemsSolved: newSolved,
        completedChapters: newChapters,
        completedChapterIds: updatedCompletedChapterIds,
        topicProgress: updatedTopicProgress,
        visionSolves,
        accuracy: 94.5,
        recentActivity: newActivity
      };
      localStorage.setItem('tutormind-user', JSON.stringify(next));
      localStorage.setItem('mathlingo-user', JSON.stringify(next));
      if (next.email) {
        const cleanEmail = next.email.toLowerCase();
        const existing = getAccountsForEmail(cleanEmail);
        const targetId = next.accountId || '1';
        let found = false;
        const updatedAccounts = existing.map((acc) => {
          if ((acc.accountId || '1') === targetId) {
            found = true;
            return { ...acc, ...next, accountId: targetId };
          }
          return acc;
        });
        if (!found) {
          updatedAccounts.push({ ...next, accountId: targetId });
        }
        saveAccountsForEmail(cleanEmail, updatedAccounts);
      }
      api.post('/gamification/update-xp', { amount }).catch(() => {});
      if (newLevel > oldLevel) {
        setTimeout(() => toastIt(`🚀 LEVEL UP! You reached Level ${newLevel}!`), 600);
      }
      return next;
    });
  };

  if (page === 'teacher') {
    return (
      <TeacherPortal onSwitchToStudent={() => setPage('overview')} />
    );
  }

  if (!user) {
    return (
      <Login
        onLogin={(authenticatedUser) => {
          saveUserData(authenticatedUser);
          if (authenticatedUser?.role === 'teacher') {
            setPage('teacher');
          }
        }}
        onOpenTeacherPortal={() => setPage('teacher')}
      />
    );
  }

  const pendingAssignmentsCount = assignments.filter((a) => !a.isCompleted).length;

  const content =
    page === 'overview' ? (
      <Overview
        user={user}
        setPage={setPage}
        onToast={toastIt}
        assignments={assignments}
        announcements={announcements}
        dismissedAnnouncements={dismissedAnnouncements}
        onDismissAnnouncement={handleDismissAnnouncement}
        onOpenChapter={(ch) => setReaderChapter(ch)}
        onSolveAssignment={(assign) => setActiveSolvingAssignment(assign)}
        officeHours={officeHours}
        onCallTeacher={handleStartCallWithTeacher}
        onSendPing={handleSendOfficeHoursPing}
      />
    ) : page === 'assignments' ? (
      <Assignments
        user={user}
        assignments={assignments}
        loading={assignmentsLoading}
        onRefresh={fetchAssignments}
        onCompleteAssignment={handleCompleteAssignment}
        onOpenChapter={(ch) => setReaderChapter(ch)}
        onSolveAssignment={(assign) => setActiveSolvingAssignment(assign)}
        onToast={toastIt}
      />
    ) : page === 'learn' ? (
      <Learn
        user={user}
        onToast={toastIt}
        onCompleteQuiz={awardXP}
        onAskTutor={(prompt) => {
          setTutorInitialPrompt(prompt);
          setPage('tutor');
        }}
      />
    ) : page === 'vision' ? (
      <Vision onToast={toastIt} onEarnXP={awardXP} />
    ) : page === 'analytics' ? (
      <Analytics user={user} onSwitchAccount={handleSwitchAccount} onToast={toastIt} />
    ) : page === 'profile' ? (
      <EnhancedProfile
        user={user}
        setUser={saveUserData}
        setPage={setPage}
        onToast={toastIt}
      />
    ) : page === 'videocall' ? (
      <VideoCallHub
        user={user}
        officeHours={officeHours}
        onCallTeacher={handleStartCallWithTeacher}
        onSendPing={handleSendOfficeHoursPing}
        onToast={toastIt}
      />
    ) : (
      <Tutor
        user={user}
        initialPrompt={tutorInitialPrompt}
        onClearInitialPrompt={() => setTutorInitialPrompt('')}
        officeHours={officeHours}
        onCallTeacher={handleStartCallWithTeacher}
      />
    );

  return (
    <>
      <Layout
        page={page}
        setPage={setPage}
        user={user}
        pendingAssignmentsCount={pendingAssignmentsCount}
        officeHours={officeHours}
        activeLiveMeeting={activeLiveMeeting}
        onJoinLiveMeeting={handleJoinLiveMeeting}
        onDismissLiveMeetingBanner={() => {
          dismissedMeetingIdRef.current = activeLiveMeeting?.id;
          setDismissedMeetingId(activeLiveMeeting?.id);
        }}
        onCallTeacher={handleStartCallWithTeacher}
        onSendPing={handleSendOfficeHoursPing}
        onLogout={() => {
          if (user) {
            api.post('/auth/student-session', { student: user, event: 'logout' }).catch(() => {});
          }
          localStorage.removeItem('tutormind-user');
          localStorage.removeItem('tutormind-token');
          localStorage.removeItem('mathlingo-user');
          localStorage.removeItem('mathlingo-token');
          setUser(null);
        }}
        onSwitchAccount={handleSwitchAccount}
        onToast={toastIt}
        onOpenTeacherPortal={() => setPage('teacher')}
      >
        {content}
      </Layout>
      {readerChapter && (
        <TextbookReader
          key={readerChapter}
          chapter={readerChapter}
          user={user}
          onClose={() => setReaderChapter(null)}
          onToast={toastIt}
          onCompleteQuiz={awardXP}
          onAskTutor={(prompt) => {
            setReaderChapter(null);
            setTutorInitialPrompt(prompt);
            setPage('tutor');
          }}
        />
      )}
      {activeSolvingAssignment && (
        <AssignmentSolverModal
          key={activeSolvingAssignment.id}
          open={Boolean(activeSolvingAssignment)}
          assignment={activeSolvingAssignment}
          user={user}
          onClose={() => setActiveSolvingAssignment(null)}
          onSubmitAssignment={handleCompleteAssignment}
          onOpenTextbook={(ch) => setReaderChapter(ch)}
          onAskTutor={(prompt) => {
            setActiveSolvingAssignment(null);
            setTutorInitialPrompt(prompt);
            setPage('tutor');
          }}
          onToast={toastIt}
        />
      )}
      {/* Teacher Live Guidance Intervention Dialog */}
      <Dialog
        open={Boolean(activeTeacherHint)}
        onClose={() => handleAcknowledgeHint(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            bgcolor: '#fffdf8',
            border: '2px solid #ec735e',
            boxShadow: '0 20px 50px rgba(236,115,94,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Avatar sx={{ bgcolor: '#ec735e', width: 44, height: 44 }}>
            <School />
          </Avatar>
          <Box>
            <Typography fontSize={11} fontFamily="DM Mono, monospace" color="#ec735e" fontWeight={700} textTransform="uppercase">
              Teacher Live Guidance
            </Typography>
            <Typography variant="h6" fontWeight={800} color="#20211f">
              {activeTeacherHint?.teacherName || 'Your Teacher'} sent you a hint!
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#fcf8f3',
              border: '1px solid #f3d8cc',
              mb: 2
            }}
          >
            <Typography fontSize={11} color="text.secondary" fontFamily="DM Mono, monospace" mb={0.5}>
              TOPIC: {activeTeacherHint?.subject} • {activeTeacherHint?.chapter}
            </Typography>
            <Typography fontSize={14} fontWeight={600} color="#20211f" sx={{ lineHeight: 1.6 }}>
              "{activeTeacherHint?.hintText}"
            </Typography>
          </Box>
          <Typography fontSize={12} color="text.secondary">
            Your educator noticed you working through this topic and sent targeted guidance to help you master the concept.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => handleAcknowledgeHint(false)}
            sx={{ borderColor: '#e6e2d9', color: '#5f5e58' }}
          >
            Got it, thanks!
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={() => handleAcknowledgeHint(true)}
            sx={{ bgcolor: '#ec735e', '&:hover': { bgcolor: '#d95f4c' } }}
          >
            Apply with AI Tutor
          </Button>
        </DialogActions>
      </Dialog>

      {/* 📹 Student Incoming Video Call Ringing Alert Dialog */}
      <IncomingCallDialog
        open={Boolean(incomingCall)}
        call={incomingCall}
        currentRole="student"
        onAccept={handleAcceptIncomingCall}
        onDecline={handleDeclineIncomingCall}
      />

      {/* 🖥️ Student Virtual Meeting Room (Webcam, Mic, Whiteboard, Screen Share & Chat) */}
      {activeMeeting && (
        <VirtualMeetingRoom
          call={activeMeeting}
          currentUser={user}
          currentRole="student"
          onEndCall={handleEndMeeting}
        />
      )}

      <Snackbar open={Boolean(toast)} message={toast} autoHideDuration={3000} />
    </>
  );
}
