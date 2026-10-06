import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Stack,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  Badge,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Slider,
  Switch,
  Menu
} from '@mui/material';
import {
  School,
  People,
  Assignment,
  TrendingUp,
  HistoryEdu,
  Search,
  Add,
  Edit,
  Delete,
  VpnKey,
  Refresh,
  FileDownload,
  Logout,
  CheckCircle,
  Warning,
  HelpOutline,
  SwapHoriz,
  Visibility,
  VisibilityOff,
  Grade,
  AutoAwesome,
  FilterList,
  Tune,
  Star,
  Psychology,
  ArrowForward,
  Close,
  Notifications,
  NotificationsActive,
  Person,
  DeleteSweep,
  FactCheck,
  HourglassTop,
  Send,
  Campaign,
  Videocam,
  Call,
  CallEnd,
  AccessTime,
  PersonAdd,
  ExpandMore
} from '@mui/icons-material';
import IncomingCallDialog from './components/IncomingCallDialog';
import VirtualMeetingRoom from './components/VirtualMeetingRoom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import api from './api';
import { textbookData, getChaptersForSubject, SUBJECT_ORDER } from './data/textbookData';

const TOPIC_COLORS = {
  Mathematics: '#ec735e',
  Physics: '#4f46e5',
  'Computer Science': '#0d9488',
  Chemistry: '#e11d48',
  Algebra: '#ec735e',
  Geometry: '#388e3c',
  Calculus: '#7b1fa2',
  Statistics: '#0288d1',
  Arithmetic: '#f57c00'
};

const STATUS_COLORS = {
  Excelling: { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
  'On Track': { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
  'Needs Help': { bg: '#fff3e0', color: '#e65100', border: '#ffcc80' }
};

export default function TeacherPortal({ onSwitchToStudent }) {
  const isMobile = useMediaQuery('(max-width:768px)');
  const [teacher, setTeacher] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('tutormind-teacher-user') || localStorage.getItem('mathlingo-teacher-user') || 'null');
      if (stored?.role === 'teacher') return stored;
      const genUser = JSON.parse(localStorage.getItem('tutormind-user') || localStorage.getItem('mathlingo-user') || 'null');
      if (genUser?.role === 'teacher') return genUser;
    } catch {}
    return null;
  });

  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [activities, setActivities] = useState([]);

  // Real-time struggle signals & teacher intervention state
  const [struggles, setStruggles] = useState([]);
  const [hintModalSignal, setHintModalSignal] = useState(null);
  const [customHintText, setCustomHintText] = useState('');
  const [sendingHint, setSendingHint] = useState(false);

  // Classroom Broadcast Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    message: '',
    priority: 'General',
    topic: 'Mathematics'
  });
  const [broadcasting, setBroadcasting] = useState(false);

  // Teacher notifications state & real-time login alerts
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [liveLoginAlert, setLiveLoginAlert] = useState(null);
  const seenNotifIdsRef = React.useRef(new Set());

  const formatTimeAgo = (isoString) => {
    if (!isoString) return '';
    const now = Date.now();
    const diff = Math.max(0, now - new Date(isoString).getTime());
    const seconds = Math.floor(diff / 1000);
    if (seconds < 45) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Roster filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit Student Dialog state
  const [editStudentDialogOpen, setEditStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    email: '',
    level: 1,
    xp: 0,
    streak: 0,
    accuracy: 80,
    dailyGoal: 50,
    status: 'On Track',
    teacherNotes: '',
    favoriteTopic: 'Mathematics'
  });

  // Reset Password Dialog state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetTargetStudent, setResetTargetStudent] = useState(null);
  const [customResetPassword, setCustomResetPassword] = useState('TutorMind@2026');
  const [resetResultTempPass, setResetResultTempPass] = useState('');

  // Enroll Student Dialog state
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [enrollFormData, setEnrollFormData] = useState({
    name: '',
    email: '',
    password: 'Student@123',
    level: 1,
    dailyGoal: 50,
    status: 'On Track',
    teacherNotes: '',
    favoriteTopic: 'Mathematics'
  });

  // Create Assignment Dialog state
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [assignmentFormData, setAssignmentFormData] = useState({
    title: '',
    topic: 'Mathematics',
    chapter: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    targetType: 'all',
    assignedTo: [],
    xpReward: 100
  });

  // Delete Confirm Dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // View Assignment Submissions Dialog state
  const [submissionViewAssignment, setSubmissionViewAssignment] = useState(null);
  const [submissionTab, setSubmissionTab] = useState(0); // 0: All, 1: Completed, 2: Pending
  const [sendingReminderId, setSendingReminderId] = useState(null);

  // Keep submissionViewAssignment synchronized if assignments reload in real-time
  useEffect(() => {
    if (submissionViewAssignment) {
      const fresh = assignments.find((a) => a.id === submissionViewAssignment.id);
      if (fresh) {
        setSubmissionViewAssignment(fresh);
      }
    }
  }, [assignments]);

  // ML Model Analytics & Cognitive Simulator state
  const [mlModelInfo, setMlModelInfo] = useState(null);
  const [mlInspectorOpen, setMlInspectorOpen] = useState(false);
  const [mlSimTelemetry, setMlSimTelemetry] = useState({
    accuracyRate: 0.45,
    consecutiveErrors: 3,
    solvingLatency: 2.1,
    tutorInquiries: 4,
    streak: 1,
    difficulty: 2
  });
  const [mlSimResult, setMlSimResult] = useState(null);
  const [mlSimLoading, setMlSimLoading] = useState(false);

  const handleRunMLSim = async (customTelemetry) => {
    setMlSimLoading(true);
    try {
      const res = await api.post('/ml/predict-struggle', customTelemetry || mlSimTelemetry);
      if (res.data) setMlSimResult(res.data);
    } catch (err) {
      console.error('Failed to run ML prediction simulation:', err);
    } finally {
      setMlSimLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!teacher) return;
    try {
      const res = await api.get('/teacher/notifications');
      if (res.data) {
        const list = res.data.notifications || [];
        setNotifications(list);
        setUnreadNotifCount(res.data.unreadCount || 0);

        // Check for fresh unread student login alert
        const freshLogin = list.find(
          (n) => !n.read && (n.type === 'student_login' || n.type === 'student_register')
        );
        if (freshLogin && !seenNotifIdsRef.current.has(freshLogin.id)) {
          seenNotifIdsRef.current.add(freshLogin.id);
          setLiveLoginAlert(freshLogin);
          // Immediately mark student as online in local state without waiting for next poll
          const targetEmail = (freshLogin.studentEmail || '').toLowerCase();
          const targetName = (freshLogin.studentName || '').toLowerCase();
          setStudents((prev) =>
            prev.map((s) => {
              const matches =
                (s.email && s.email.toLowerCase() === targetEmail) ||
                (s.name && s.name.toLowerCase() === targetName) ||
                s.id === freshLogin.studentId;
              if (matches) {
                return { ...s, isOnline: true, lastLogin: freshLogin.timestamp || new Date().toISOString() };
              }
              return s;
            })
          );
          // Trigger immediate roster refresh
          api.get('/teacher/students').then((res) => {
            if (res.data?.students) setStudents(res.data.students);
          }).catch(() => {});
          setTimeout(() => {
            setLiveLoginAlert((cur) => (cur?.id === freshLogin.id ? null : cur));
          }, 7000);
        }
      }
    } catch (err) {}
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.post('/teacher/notifications/mark-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotifCount(0);
    } catch (err) {}
  };

  const handleClearNotifications = async () => {
    try {
      await api.delete('/teacher/notifications');
      setNotifications([]);
      setUnreadNotifCount(0);
    } catch (err) {}
  };

  // Office Hours & Video Calling States
  const [officeHours, setOfficeHours] = useState({
    isLive: true,
    status: 'available',
    schedule: 'Monday – Friday · 3:00 PM – 5:30 PM',
    todayActiveWindow: '3:00 PM – 5:30 PM',
    focusSubject: 'All STEM Subjects (Mathematics, Physics, CS & Chemistry)',
    message: 'Live Office Hours are OPEN! Click below to start an interactive 1-on-1 video call.'
  });
  const [officeHoursDialogOpen, setOfficeHoursDialogOpen] = useState(false);
  const [officeHoursScheduleInput, setOfficeHoursScheduleInput] = useState('Monday – Friday · 3:00 PM – 5:30 PM');
  const [officeHoursWindowInput, setOfficeHoursWindowInput] = useState('3:00 PM – 5:30 PM');
  const [officeHoursFocusInput, setOfficeHoursFocusInput] = useState('All STEM Subjects (Math, Physics, CS, Chemistry)');
  const [officeHoursMsgInput, setOfficeHoursMsgInput] = useState('Live Office Hours are OPEN! Drop in for 1-on-1 problem walkthroughs.');
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const handleToggleOfficeHoursLive = async (isLive) => {
    try {
      const res = await api.post('/teacher/office-hours', {
        isLive,
        status: isLive ? 'available' : 'away'
      });
      if (res.data?.officeHours) {
        setOfficeHours(res.data.officeHours);
        showToast(isLive ? 'Office Hours are now LIVE & accepting student video calls!' : 'Office Hours set to AWAY.');
      }
    } catch {
      showToast('Failed to update office hours.');
    }
  };

  const handleSaveOfficeHoursDetails = async () => {
    try {
      const res = await api.post('/teacher/office-hours', {
        schedule: officeHoursScheduleInput,
        todayActiveWindow: officeHoursWindowInput,
        focusSubject: officeHoursFocusInput,
        message: officeHoursMsgInput
      });
      if (res.data?.officeHours) {
        setOfficeHours(res.data.officeHours);
        setOfficeHoursDialogOpen(false);
        showToast('Office Hours schedule and note updated successfully!');
      }
    } catch {
      showToast('Failed to save office hours details.');
    }
  };

  const handleAcceptIncomingCall = async () => {
    if (!incomingCall) return;
    const callToAccept = incomingCall;
    setIncomingCall(null);
    try {
      const res = await api.post(`/calls/${callToAccept.id}/respond`, { action: 'accept' });
      setActiveMeeting(res.data.call || callToAccept);
      showToast(`Connected to video call with ${callToAccept.caller?.name || 'Student'}!`);
    } catch {
      showToast('Failed to connect call.');
    }
  };

  const handleDeclineIncomingCall = async () => {
    if (!incomingCall) return;
    const callToDecline = incomingCall;
    setIncomingCall(null);
    try {
      await api.post(`/calls/${callToDecline.id}/respond`, { action: 'decline' });
      showToast('Call declined.');
    } catch {}
  };

  const handleInitiateCallToStudent = async (student, topicArg) => {
    const topic = typeof topicArg === 'string' && topicArg.trim() ? topicArg : '1-on-1 Student Video Mentoring';
    try {
      const res = await api.post('/calls/initiate', {
        callerRole: 'teacher',
        callerName: teacher.name || 'Prof. Sarah Jenkins',
        callerEmail: teacher.email || 'teacher@tutormind.com',
        calleeRole: 'student',
        targetStudentId: student.id,
        targetStudentEmail: student.email,
        targetStudentName: student.name,
        topic
      });
      if (res.data?.call) {
        setActiveMeeting(res.data.call);
        showToast(`Initiating video call to ${student.name}...`);
      }
    } catch {
      showToast('Could not initiate call.');
    }
  };

  const handleOpenHostMeetingRoom = async () => {
    try {
      const res = await api.post('/calls/initiate', {
        callerRole: 'teacher',
        callerName: teacher.name || 'Prof. Sarah Jenkins',
        callerEmail: teacher.email || 'teacher@tutormind.com',
        calleeRole: 'student',
        topic: 'Open STEM Office Hours Room'
      });
      if (res.data?.call) {
        setActiveMeeting(res.data.call);
        showToast('Opened Live Office Hours Meeting Room!');
      }
    } catch {
      showToast('Failed to create meeting room.');
    }
  };

  const handleEndMeeting = () => {
    setActiveMeeting(null);
    refreshTeacherData();
    showToast('Meeting concluded.');
  };

  // Fetch all teacher data
  const refreshTeacherData = async () => {
    if (!teacher) return;
    setLoading(true);
    try {
      const [studRes, analRes, assignRes, actRes, strRes, mlRes, annRes, ohRes] = await Promise.all([
        api.get('/teacher/students'),
        api.get('/teacher/analytics'),
        api.get('/teacher/assignments'),
        api.get('/teacher/activity'),
        api.get('/teacher/struggles'),
        api.get('/ml/model-info').catch(() => ({ data: null })),
        api.get('/teacher/announcements').catch(() => ({ data: null })),
        api.get('/teacher/office-hours').catch(() => ({ data: null }))
      ]);

      if (studRes.data?.students) setStudents(studRes.data.students);
      if (analRes.data) setAnalytics(analRes.data);
      if (assignRes.data?.assignments) setAssignments(assignRes.data.assignments);
      if (actRes.data?.activities) setActivities(actRes.data.activities);
      if (strRes.data?.struggles) setStruggles(strRes.data.struggles);
      if (mlRes.data) setMlModelInfo(mlRes.data);
      if (annRes?.data?.announcements) setAnnouncements(annRes.data.announcements);
      if (ohRes?.data?.officeHours) {
        setOfficeHours(ohRes.data.officeHours);
        setOfficeHoursScheduleInput(ohRes.data.officeHours.schedule || 'Monday – Friday · 3:00 PM – 5:30 PM');
        setOfficeHoursWindowInput(ohRes.data.officeHours.todayActiveWindow || '3:00 PM – 5:30 PM');
        setOfficeHoursFocusInput(ohRes.data.officeHours.focusSubject || 'All STEM Subjects');
        setOfficeHoursMsgInput(ohRes.data.officeHours.message || '');
      }
    } catch (err) {
      console.error('Failed to fetch teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacher) {
      refreshTeacherData();
    }
  }, [teacher]);

  // Real-time fast 1.5-second heartbeat for instant student online detection, roster sync, struggle alerts, and video calls
  useEffect(() => {
    if (!teacher) return;

    const pullUpdates = () => {
      fetchNotifications();
      api.get('/teacher/students').then((res) => {
        if (res.data?.students) setStudents(res.data.students);
      }).catch(() => {});
      api.get('/teacher/activity').then((res) => {
        if (res.data?.activities) setActivities(res.data.activities);
      }).catch(() => {});
      api.get('/teacher/struggles').then((res) => {
        if (res.data?.struggles) setStruggles(res.data.struggles);
      }).catch(() => {});
      api.get('/teacher/announcements').then((res) => {
        if (res.data?.announcements) setAnnouncements(res.data.announcements);
      }).catch(() => {});
      api.get('/teacher/office-hours').then((res) => {
        if (res.data?.officeHours) setOfficeHours(res.data.officeHours);
      }).catch(() => {});
      api.get('/calls/active').then((res) => {
        const active = res.data?.activeCall;
        if (active && active.status === 'ringing' && active.caller.role === 'student') {
          setIncomingCall(active);
        } else if (active && active.status === 'connected') {
          setActiveMeeting(active);
          setIncomingCall(null);
        } else if (!active) {
          setIncomingCall(null);
        }
      }).catch(() => {});
    };

    const interval = setInterval(pullUpdates, 1500);

    const onFocus = () => pullUpdates();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [teacher]);

  // Pedagogical Intervention Handlers
  const handleOpenHintModal = (signal) => {
    setHintModalSignal(signal);
    let defaultHint = `Remember to check the core theorem definition and verify each step systematically.`;
    if (signal.triggerType === 'wrong_answer') {
      if (signal.concept) {
        defaultHint = `Hi ${signal.studentName || 'there'}, take another look at the concept of ${signal.concept}. Check your initial assumptions and rework through each step!`;
      } else if (signal.question) {
        defaultHint = `Hi ${signal.studentName || 'there'}, on question "${signal.question.slice(0, 55)}...", reconsider your approach. Verify the key theorem and give it another try!`;
      } else {
        defaultHint = `Hi ${signal.studentName || 'there'}, take another look at this question on ${signal.chapterTitle || 'the chapter'}. Review the key formulas and try again!`;
      }
    } else {
      const title = signal.chapterTitle || '';
      if (title.includes('Derivatives') || title.includes('Calculus')) {
        defaultHint = `Remember the power rule: d/dx[x^n] = n*x^(n-1). Differentiate each term individually and watch out for constant terms!`;
      } else if (title.includes('Limits')) {
        defaultHint = `Try factoring the numerator and denominator first to cancel out zero-factors, or test values approaching the limit from both left and right.`;
      } else if (title.includes('Quadratic')) {
        defaultHint = `Check if the quadratic can be factored into (x + a)(x + b), or use the quadratic formula x = (-b ± √(b² - 4ac)) / (2a).`;
      } else if (title.includes('Linear')) {
        defaultHint = `Isolate the variable term on one side by performing the inverse operation on both sides of the equation.`;
      } else if (signal.subject === 'Physics') {
        defaultHint = `Identify your knowns and unknowns first, and select the kinematic equation that connects them directly.`;
      }
    }
    setCustomHintText(defaultHint);
  };

  const handleSendHint = async () => {
    if (!hintModalSignal || !customHintText.trim()) return;
    setSendingHint(true);
    try {
      await api.post('/teacher/intervene/hint', {
        signalId: hintModalSignal.id,
        studentId: hintModalSignal.studentId,
        studentEmail: hintModalSignal.studentEmail,
        chapter: hintModalSignal.chapterTitle,
        subject: hintModalSignal.subject,
        hintText: customHintText.trim()
      });
      showToast(`Guidance hint dispatched directly to ${hintModalSignal.studentName}!`);
      setHintModalSignal(null);
      api.get('/teacher/struggles').then((res) => {
        if (res.data?.struggles) setStruggles(res.data.struggles);
      }).catch(() => {});
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send hint.');
    } finally {
      setSendingHint(false);
    }
  };

  const handleAssignPractice = (signal) => {
    setTabIndex(2);
    setAssignmentFormData({
      title: `Targeted Practice: ${signal.chapterTitle || 'Chapter'}`,
      topic: signal.subject || 'Mathematics',
      chapter: signal.chapterTitle || '',
      assignedTo: signal.studentId ? [signal.studentId] : [],
      targetType: signal.studentId ? 'specific' : 'all',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      description: `Targeted practice for ${signal.chapterTitle || 'Chapter'} based on live learning signals. Complete all problems to reinforce understanding.`,
      xpReward: 100
    });
    setAssignmentDialogOpen(true);
    showToast(`Prepared practice assignment for ${signal.studentName || 'student'}! Review details and dispatch.`);
  };

  const handleResolveStruggle = async (signalId) => {
    try {
      await api.post('/teacher/intervene/resolve', { signalId });
      setStruggles((prev) => prev.filter((s) => s.id !== signalId));
      showToast('Struggle alert marked as resolved.');
    } catch (err) {
      showToast('Failed to resolve alert.');
    }
  };

  // Classroom Broadcast Announcements handlers
  const handleCreateAnnouncementSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!announcementFormData.title.trim() || !announcementFormData.message.trim()) {
      showToast('Please provide both an announcement title and message.');
      return;
    }
    setBroadcasting(true);
    try {
      const res = await api.post('/teacher/announcements', {
        title: announcementFormData.title.trim(),
        message: announcementFormData.message.trim(),
        priority: announcementFormData.priority || 'General',
        topic: announcementFormData.topic || 'Mathematics'
      });
      showToast(`📢 Announcement "${announcementFormData.title}" broadcast to all students!`);
      setAnnouncementDialogOpen(false);
      setAnnouncementFormData({
        title: '',
        message: '',
        priority: 'General',
        topic: 'Mathematics'
      });
      if (res.data?.announcements) setAnnouncements(res.data.announcements);
      refreshTeacherData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to broadcast announcement.');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleDeleteAnnouncement = async (id, title) => {
    try {
      const res = await api.delete(`/teacher/announcements/${id}`);
      showToast(`Announcement "${title}" removed.`);
      if (res.data?.announcements) setAnnouncements(res.data.announcements);
      refreshTeacherData();
    } catch (err) {
      showToast('Failed to remove announcement.');
    }
  };

  const handleTriggerSyncRoster = async () => {
    setLoading(true);
    try {
      await refreshTeacherData();
      showToast('Class roster, cognitive telemetry, and assignments re-synchronized!');
    } finally {
      setLoading(false);
    }
  };

  // Handle Teacher Login
  const handleTeacherLogin = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter teacher email and password.');
      return;
    }
    setLoginError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword
      });

      const { user, token } = response.data;
      if (user.role !== 'teacher') {
        setLoginError('Access denied. This account does not have educator privileges. Please use an educator account.');
        setLoading(false);
        return;
      }

      localStorage.setItem('tutormind-token', token);
      localStorage.setItem('tutormind-teacher-token', token);
      localStorage.setItem('tutormind-teacher-user', JSON.stringify(user));
      localStorage.setItem('mathlingo-token', token);
      localStorage.setItem('mathlingo-teacher-token', token);
      localStorage.setItem('mathlingo-teacher-user', JSON.stringify(user));
      setTeacher(user);
      showToast(`Welcome back, Professor ${user.name || 'Teacher'}!`);
    } catch (err) {
      console.error('Teacher login error:', err);
      const msg = err.response?.data?.message || (err.message === 'Network Error' ? 'Network Error: Cannot connect to API server at http://localhost:5000. Please verify backend is running.' : err.message) || 'Login failed. Please check your educator credentials.';
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    setLoginEmail('teacher@tutormind.com');
    setLoginPassword('Teacher@123');
    setLoginError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: 'teacher@tutormind.com',
        password: 'Teacher@123'
      });
      const { user, token } = response.data;
      if (user.role !== 'teacher') {
        setLoginError('Access denied. This account does not have educator privileges.');
        return;
      }
      localStorage.setItem('tutormind-token', token);
      localStorage.setItem('tutormind-teacher-token', token);
      localStorage.setItem('tutormind-teacher-user', JSON.stringify(user));
      localStorage.setItem('mathlingo-token', token);
      localStorage.setItem('mathlingo-teacher-token', token);
      localStorage.setItem('mathlingo-teacher-user', JSON.stringify(user));
      setTeacher(user);
      showToast(`Welcome back, Professor ${user.name || 'Teacher'}!`);
    } catch (err) {
      console.error('Instant demo login error:', err);
      const msg = err.response?.data?.message || (err.message === 'Network Error' ? 'Network Error: Cannot connect to backend API server at http://localhost:5000.' : err.message) || 'Demo login failed.';
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoTeacher = () => {
    setLoginEmail('teacher@tutormind.com');
    setLoginPassword('Teacher@123');
    setLoginError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('tutormind-teacher-user');
    localStorage.removeItem('tutormind-teacher-token');
    localStorage.removeItem('mathlingo-teacher-user');
    localStorage.removeItem('mathlingo-teacher-token');
    setTeacher(null);
    setStudents([]);
    setAnalytics(null);
  };

  // Filtered student roster
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Online Now' ? Boolean(st.isOnline) : st.status === statusFilter);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (st.name && st.name.toLowerCase().includes(q)) ||
        (st.email && st.email.toLowerCase().includes(q)) ||
        (st.username && st.username.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [students, statusFilter, searchQuery]);

  // Handle Edit Student Submit
  const handleEditStudentSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!editingStudent) return;
    setLoading(true);

    try {
      const res = await api.put(`/teacher/students/${editingStudent.id}`, editFormData);
      showToast(`Updated details for ${res.data.student?.name || editingStudent.name}.`);
      setEditStudentDialogOpen(false);
      refreshTeacherData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update student details.');
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Dialog
  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name || '',
      username: student.username || '',
      email: student.email || '',
      level: student.level || 1,
      xp: student.xp || 0,
      streak: student.streak || 0,
      accuracy: student.accuracy || 80,
      dailyGoal: student.dailyGoal || 50,
      status: student.status || 'On Track',
      teacherNotes: student.teacherNotes || '',
      favoriteTopic: student.favoriteTopic || 'Algebra'
    });
    setEditStudentDialogOpen(true);
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async () => {
    if (!resetTargetStudent) return;
    setLoading(true);
    try {
      const res = await api.post(`/teacher/students/${resetTargetStudent.id}/reset-password`, {
        newPassword: customResetPassword
      });
      setResetResultTempPass(res.data.tempPassword);
      showToast(`Password successfully reset for ${resetTargetStudent.name}!`);
      refreshTeacherData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Enroll Student Submit
  const handleEnrollSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!enrollFormData.email || !enrollFormData.email.includes('@')) {
      showToast('Please enter a valid student email.');
      return;
    }
    setLoading(true);

    try {
      const res = await api.post('/teacher/students', enrollFormData);
      showToast(`Student ${res.data.student?.name} enrolled successfully!`);
      setEnrollDialogOpen(false);
      setEnrollFormData({
        name: '',
        email: '',
        password: 'Student@123',
        level: 1,
        dailyGoal: 50,
        status: 'On Track',
        teacherNotes: '',
        favoriteTopic: 'Algebra'
      });
      refreshTeacherData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to enroll student.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Student Submit
  const handleDeleteStudentSubmit = async () => {
    if (!studentToDelete) return;
    setLoading(true);

    try {
      await api.delete(`/teacher/students/${studentToDelete.id}`);
      showToast(`Removed student ${studentToDelete.name} from class roster.`);
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
      refreshTeacherData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove student.');
    } finally {
      setLoading(false);
    }
  };

  // Available chapters for selected topic in assignment creator
  const availableChapters = useMemo(() => {
    return getChaptersForSubject(assignmentFormData.topic) || [];
  }, [assignmentFormData.topic]);

  // Handle Create Assignment Submit
  const handleCreateAssignmentSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!assignmentFormData.title || !assignmentFormData.chapter) {
      showToast('Please enter an assignment title and select a textbook chapter.');
      return;
    }
    setLoading(true);

    try {
      await api.post('/teacher/assignments', assignmentFormData);
      showToast(`Assignment "${assignmentFormData.title}" published to class!`);
      setAssignmentDialogOpen(false);
      setAssignmentFormData({
        title: '',
        topic: 'Algebra',
        chapter: '',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        targetType: 'all',
        assignedTo: [],
        xpReward: 100
      });
      refreshTeacherData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Assignment
  const handleDeleteAssignment = async (assignId, title) => {
    try {
      await api.delete(`/teacher/assignments/${assignId}`);
      showToast(`Assignment "${title}" removed.`);
      refreshTeacherData();
    } catch (err) {
      showToast('Failed to remove assignment.');
    }
  };

  // Handle Send Reminder to Pending Student
  const handleSendReminder = async (assignmentId, student) => {
    if (!student) return;
    setSendingReminderId(student.id || student.email);
    try {
      const res = await api.post(`/teacher/assignments/${assignmentId}/remind`, {
        studentId: student.id,
        studentEmail: student.email,
        studentName: student.name
      });
      showToast(res.data?.message || `Reminder sent to ${student.name || 'student'}!`);
      refreshTeacherData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send reminder.');
    } finally {
      setSendingReminderId(null);
    }
  };

  // Export Gradebook CSV
  const handleExportCSV = () => {
    if (!students || students.length === 0) {
      showToast('No student data available to export.');
      return;
    }

    const headers = [
      'Name',
      'Email',
      'Username',
      'Level',
      'XP',
      'Streak (days)',
      'Accuracy (%)',
      'Problems Solved',
      'Daily Goal (XP)',
      'Status',
      'Favorite Topic',
      'Teacher Notes'
    ];

    const rows = students.map((st) => [
      `"${st.name || ''}"`,
      `"${st.email || ''}"`,
      `"${st.username || ''}"`,
      st.level || 1,
      st.xp || 0,
      st.streak || 0,
      st.accuracy || 0,
      st.problemsSolved || 0,
      st.dailyGoal || 50,
      `"${st.status || 'On Track'}"`,
      `"${st.favoriteTopic || 'Algebra'}"`,
      `"${(st.teacherNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tutormind_gradebook_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Gradebook CSV successfully downloaded!');
  };

  // ---------------------------------------------------------------------------
  // 1. TEACHER AUTHENTICATION LOGIN GATE
  // ---------------------------------------------------------------------------
  if (!teacher) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background ambient lighting */}
        <Box
          sx={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
            top: -100,
            right: -100,
            pointerEvents: 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0) 70%)',
            bottom: -50,
            left: -50,
            pointerEvents: 'none'
          }}
        />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 4,
                bgcolor: '#1e293b',
                border: '1px solid #334155',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                color: '#f8fafc'
              }}
            >
              {/* Badge & Logo */}
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Avatar
                  sx={{
                    bgcolor: '#0ea5e9',
                    color: '#ffffff',
                    width: 44,
                    height: 44,
                    boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)'
                  }}
                >
                  <School />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="#f8fafc">
                    TutorMind Educator Hub
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Faculty & Administrator Portal
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 3 }}>
                Restricted access. Only verified teachers and instructors may sign in to manage class rosters, adjust student progress, and view analytics.
              </Typography>

              {/* Demo Credentials Quick Fill Box */}
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: 'rgba(14, 165, 233, 0.08)',
                  border: '1px dashed #0284c7',
                  borderRadius: 2.5
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1.5}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#38bdf8">
                      🔑 Demo Faculty Account
                    </Typography>
                    <Typography variant="caption" color="#94a3b8" display="block">
                      teacher@tutormind.com · Teacher@123
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={fillDemoTeacher}
                      disabled={loading}
                      sx={{
                        borderColor: '#0284c7',
                        color: '#38bdf8',
                        textTransform: 'none',
                        fontSize: 11,
                        fontWeight: 700,
                        '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.15)', borderColor: '#38bdf8' }
                      }}
                    >
                      Auto-Fill Fields
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleInstantDemoLogin}
                      disabled={loading}
                      sx={{
                        bgcolor: '#0ea5e9',
                        color: '#ffffff',
                        textTransform: 'none',
                        fontSize: 11,
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#0284c7' }
                      }}
                    >
                      🚀 1-Click Instant Login
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              {/* Login Error Alert */}
              {loginError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid #ef4444' }}>
                  {loginError}
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleTeacherLogin}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Educator Email"
                    variant="outlined"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="teacher@tutormind.com"
                    InputLabelProps={{ sx: { color: '#94a3b8' } }}
                    InputProps={{
                      sx: {
                        color: '#f8fafc',
                        bgcolor: '#0f172a',
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#334155' },
                        '&:hover fieldset': { borderColor: '#0ea5e9' }
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showLoginPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    InputLabelProps={{ sx: { color: '#94a3b8' } }}
                    InputProps={{
                      sx: {
                        color: '#f8fafc',
                        bgcolor: '#0f172a',
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#334155' },
                        '&:hover fieldset': { borderColor: '#0ea5e9' }
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            edge="end"
                            sx={{ color: '#94a3b8' }}
                          >
                            {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.6,
                      borderRadius: 2,
                      bgcolor: '#0ea5e9',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 15,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
                      '&:hover': { bgcolor: '#0284c7' }
                    }}
                  >
                    {loading ? 'Authenticating Educator...' : 'Sign In as Educator'}
                  </Button>
                </Stack>
              </form>

              <Divider sx={{ my: 3, borderColor: '#334155' }} />

              {/* Link back to student portal */}
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  Are you a student?
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={onSwitchToStudent}
                  startIcon={<SwapHoriz />}
                  sx={{ color: '#38bdf8', fontWeight: 600, textTransform: 'none' }}
                >
                  Return to Student Learner App
                </Button>
              </Stack>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. MAIN TEACHER DASHBOARD SHELL
  // ---------------------------------------------------------------------------
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', color: '#1e293b' }}>
      {/* Sleek Professional Top Navbar */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#0f172a',
          color: '#f8fafc',
          borderBottom: '1px solid #1e293b',
          px: { xs: 2, sm: 4 },
          py: 1.2,
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {/* Left: Brand */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                bgcolor: '#0ea5e9',
                color: '#ffffff',
                width: 36,
                height: 36,
                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)'
              }}
            >
              <School fontSize="small" />
            </Avatar>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight={800} color="#f8fafc" sx={{ fontSize: { xs: 16, sm: 18 }, letterSpacing: -0.3 }}>
                  TutorMind <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: 14 }}>Educator</span>
                </Typography>
                <Chip
                  label="Faculty"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(14, 165, 233, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    fontSize: 10,
                    fontWeight: 700,
                    height: 20
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          {/* Right: Clean Controls */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {/* Live Office Hours Quick Control */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: officeHours.isLive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid',
                borderColor: officeHours.isLive ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                borderRadius: 2.5,
                px: 1.5,
                py: 0.5
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: officeHours.isLive ? '#10b981' : '#64748b',
                  boxShadow: officeHours.isLive ? '0 0 8px #10b981' : 'none'
                }}
              />
              <Typography variant="caption" fontWeight={700} color={officeHours.isLive ? '#34d399' : '#94a3b8'} sx={{ fontSize: 11.5 }}>
                {officeHours.isLive ? 'Office Hours Live' : 'Office Hours Away'}
              </Typography>
              <Switch
                size="small"
                checked={Boolean(officeHours.isLive)}
                onChange={(e) => handleToggleOfficeHoursLive(e.target.checked)}
                color="success"
              />
              {officeHours.isLive && (
                <Tooltip title="Host Meeting Room">
                  <IconButton
                    size="small"
                    onClick={handleOpenHostMeetingRoom}
                    sx={{
                      color: '#ffffff',
                      bgcolor: '#059669',
                      p: 0.5,
                      ml: 0.2,
                      '&:hover': { bgcolor: '#047857' }
                    }}
                  >
                    <Videocam sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => {
                  setNotifAnchorEl(e.currentTarget);
                  if (unreadNotifCount > 0) handleMarkAllNotifsRead();
                }}
                sx={{
                  color: unreadNotifCount > 0 ? '#38bdf8' : '#94a3b8',
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  p: 0.9,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }
                }}
              >
                <Badge badgeContent={unreadNotifCount} color="error" max={99}>
                  {unreadNotifCount > 0 ? <NotificationsActive fontSize="small" /> : <Notifications fontSize="small" />}
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notification Dropdown Popover */}
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={() => setNotifAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  width: { xs: 320, sm: 380 },
                  maxHeight: 460,
                  bgcolor: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  borderRadius: 3,
                  boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
                  overflow: 'hidden'
                }
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid #334155', bgcolor: '#0f172a' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <NotificationsActive sx={{ color: '#38bdf8', fontSize: 18 }} />
                    <Typography variant="subtitle2" fontWeight={800} color="#f8fafc">
                      Classroom Alerts
                    </Typography>
                    {unreadNotifCount > 0 && (
                      <Chip
                        label={`${unreadNotifCount} new`}
                        size="small"
                        sx={{ bgcolor: '#ef4444', color: '#fff', fontSize: 10, height: 18, fontWeight: 700 }}
                      />
                    )}
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    <Button
                      size="small"
                      onClick={handleMarkAllNotifsRead}
                      sx={{ color: '#94a3b8', textTransform: 'none', fontSize: 11, minWidth: 'auto', px: 1, '&:hover': { color: '#38bdf8' } }}
                    >
                      Mark read
                    </Button>
                    <IconButton size="small" onClick={handleClearNotifications} sx={{ color: '#64748b', '&:hover': { color: '#ef4444' } }}>
                      <DeleteSweep fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>

              <List sx={{ p: 0, maxHeight: 360, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="#94a3b8">
                      No notifications yet.
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((notif) => (
                    <ListItem
                      key={notif.id}
                      button
                      onClick={() => {
                        setNotifAnchorEl(null);
                        setTabIndex(1);
                        setSearchQuery(notif.studentName || '');
                      }}
                      sx={{
                        p: 1.5,
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        bgcolor: notif.read ? 'transparent' : 'rgba(14, 165, 233, 0.08)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 38 }}>
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: notif.type === 'student_register' ? '#10b981' : '#0ea5e9',
                            color: '#ffffff',
                            fontSize: 11
                          }}
                        >
                          <Person sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" fontWeight={700} color="#f8fafc" sx={{ fontSize: 12.5 }}>
                              {notif.studentName}
                            </Typography>
                            <Typography variant="caption" color="#94a3b8" sx={{ fontSize: 10.5 }}>
                              {formatTimeAgo(notif.timestamp)}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption" color="#cbd5e1" display="block" sx={{ lineHeight: 1.3, mt: 0.3 }}>
                            {notif.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Popover>

            {/* Primary Action: New Assignment */}
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setTabIndex(2);
                setAssignmentDialogOpen(true);
              }}
              startIcon={<Add />}
              sx={{
                bgcolor: '#0ea5e9',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 12.5,
                borderRadius: 2,
                px: 1.8,
                py: 0.6,
                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)',
                '&:hover': { bgcolor: '#0284c7' }
              }}
            >
              New Assignment
            </Button>

            {/* Faculty User Avatar & Dropdown Menu */}
            <Button
              onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
              sx={{
                p: 0.4,
                borderRadius: 2.5,
                textTransform: 'none',
                color: '#f8fafc',
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' }
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.6 }}>
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: '#ec735e',
                    fontSize: 12,
                    fontWeight: 800
                  }}
                >
                  SJ
                </Avatar>
                <Typography variant="caption" fontWeight={700} color="#f8fafc" sx={{ display: { xs: 'none', md: 'inline-block' } }}>
                  {teacher.name || 'Prof. Sarah Jenkins'}
                </Typography>
                <ExpandMore sx={{ fontSize: 16, color: '#94a3b8' }} />
              </Stack>
            </Button>

            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={() => setProfileMenuAnchor(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  width: 240,
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #e2e8f0',
                  mt: 1,
                  p: 0.5
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                  {teacher.name || 'Prof. Sarah Jenkins'}
                </Typography>
                <Typography variant="caption" color="#64748b" display="block">
                  {teacher.email || 'teacher@tutormind.edu'}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5, borderColor: '#f1f5f9' }} />
              <MenuItem
                onClick={() => {
                  setProfileMenuAnchor(null);
                  setMlInspectorOpen(true);
                  if (!mlSimResult) handleRunMLSim(mlSimTelemetry);
                }}
                sx={{ borderRadius: 1.5, fontSize: 13, fontWeight: 600, py: 1, color: '#334155' }}
              >
                <Psychology sx={{ fontSize: 18, mr: 1.5, color: '#6366f1' }} />
                ML Telemetry & Risk
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setProfileMenuAnchor(null);
                  handleExportCSV();
                }}
                sx={{ borderRadius: 1.5, fontSize: 13, fontWeight: 600, py: 1, color: '#334155' }}
              >
                <FileDownload sx={{ fontSize: 18, mr: 1.5, color: '#0ea5e9' }} />
                Export Gradebook (CSV)
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setProfileMenuAnchor(null);
                  onSwitchToStudent();
                }}
                sx={{ borderRadius: 1.5, fontSize: 13, fontWeight: 600, py: 1, color: '#334155' }}
              >
                <SwapHoriz sx={{ fontSize: 18, mr: 1.5, color: '#10b981' }} />
                Switch to Student App
              </MenuItem>
              <Divider sx={{ my: 0.5, borderColor: '#f1f5f9' }} />
              <MenuItem
                onClick={() => {
                  setProfileMenuAnchor(null);
                  handleLogout();
                }}
                sx={{ borderRadius: 1.5, fontSize: 13, fontWeight: 700, py: 1, color: '#ef4444' }}
              >
                <Logout sx={{ fontSize: 18, mr: 1.5, color: '#ef4444' }} />
                Sign Out
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Paper>

      {/* Live Student Login Floating Toast Notification */}
      <AnimatePresence>
        {liveLoginAlert && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 9999,
              maxWidth: 380,
              width: 'calc(100% - 48px)'
            }}
          >
            <Paper
              elevation={4}
              sx={{
                p: 2,
                bgcolor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#f0fdf4',
                  color: '#16a34a',
                  width: 38,
                  height: 38
                }}
              >
                <NotificationsActive fontSize="small" />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#16a34a' }} />
                    <Typography variant="subtitle2" fontWeight={700} color="#16a34a">
                      Student Active
                    </Typography>
                  </Stack>
                  <IconButton
                    size="small"
                    onClick={() => setLiveLoginAlert(null)}
                    sx={{ color: '#94a3b8', p: 0.2, '&:hover': { color: '#0f172a' } }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Stack>
                <Typography variant="body2" fontWeight={600} color="#0f172a" sx={{ mt: 0.5 }}>
                  <strong>{liveLoginAlert.studentName}</strong> logged in
                </Typography>
                <Typography variant="caption" color="#64748b" display="block">
                  {liveLoginAlert.studentEmail} · {formatTimeAgo(liveLoginAlert.timestamp)}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setLiveLoginAlert(null);
                      setTabIndex(1);
                      setSearchQuery(liveLoginAlert.studentName || '');
                    }}
                    sx={{
                      bgcolor: '#0ea5e9',
                      color: '#ffffff',
                      textTransform: 'none',
                      fontSize: 11,
                      fontWeight: 600,
                      py: 0.3,
                      px: 1.2,
                      borderRadius: 1.5,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#0284c7' }
                    }}
                  >
                    View in Roster
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setLiveLoginAlert(null)}
                    sx={{ color: '#64748b', textTransform: 'none', fontSize: 11, py: 0.3 }}
                  >
                    Dismiss
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        {/* Clean Professional Faculty Header */}
        <Box sx={{ mb: 3.5 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ letterSpacing: -0.5, fontSize: { xs: 22, sm: 26 } }}>
                Welcome back, {teacher.name || 'Prof. Sarah Jenkins'}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                <Typography variant="body2" color="#64748b" fontWeight={500}>
                  Mathematics Department · Active Term Overview
                </Typography>
                <Typography color="#cbd5e1">•</Typography>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: students.some((s) => s.isOnline) ? '#10b981' : '#94a3b8'
                    }}
                  />
                  <Typography variant="caption" fontWeight={700} color={students.some((s) => s.isOnline) ? '#059669' : '#64748b'}>
                    {students.filter((s) => s.isOnline).length} Student{students.filter((s) => s.isOnline).length === 1 ? '' : 's'} Online
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<Campaign sx={{ fontSize: 18 }} />}
                onClick={() => setAnnouncementDialogOpen(true)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  borderColor: '#e2e8f0',
                  color: '#334155',
                  bgcolor: '#ffffff',
                  px: 1.8,
                  py: 0.7,
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                }}
              >
                Broadcast
              </Button>
              <Button
                variant="outlined"
                startIcon={<PersonAdd sx={{ fontSize: 18 }} />}
                onClick={() => setEnrollDialogOpen(true)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  borderColor: '#e2e8f0',
                  color: '#334155',
                  bgcolor: '#ffffff',
                  px: 1.8,
                  py: 0.7,
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                }}
              >
                Enroll Student
              </Button>
              {officeHours.isLive && (
                <Button
                  variant="outlined"
                  startIcon={<Videocam sx={{ fontSize: 18, color: '#10b981' }} />}
                  onClick={handleOpenHostMeetingRoom}
                  sx={{
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 13,
                    borderColor: '#a7f3d0',
                    color: '#065f46',
                    bgcolor: '#ecfdf5',
                    px: 1.8,
                    py: 0.7,
                    '&:hover': { bgcolor: '#d1fae5', borderColor: '#6ee7b7' }
                  }}
                >
                  Host Room
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Navigation Tabs Bar */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={(e, val) => setTabIndex(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 13.5,
                py: 1.6,
                minHeight: 48,
                color: '#64748b',
                '&.Mui-selected': { color: '#0ea5e9', fontWeight: 700 }
              },
              '& .MuiTabs-indicator': { bgcolor: '#0ea5e9', height: 2.5, borderRadius: '2px 2px 0 0' }
            }}
          >
            <Tab icon={<TrendingUp fontSize="small" />} iconPosition="start" label="Overview" />
            <Tab
              icon={
                <Chip
                  label={students.length}
                  size="small"
                  sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: tabIndex === 1 ? '#e0f2fe' : '#f1f5f9', color: tabIndex === 1 ? '#0284c7' : '#64748b' }}
                />
              }
              iconPosition="end"
              label="Students"
            />
            <Tab
              icon={
                <Chip
                  label={assignments.length}
                  size="small"
                  sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: tabIndex === 2 ? '#e0f2fe' : '#f1f5f9', color: tabIndex === 2 ? '#0284c7' : '#64748b' }}
                />
              }
              iconPosition="end"
              label="Assignments"
            />
            <Tab
              icon={
                announcements.length > 0 ? (
                  <Chip
                    label={announcements.length}
                    size="small"
                    sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: '#f5f3ff', color: '#7c3aed' }}
                  />
                ) : undefined
              }
              iconPosition="end"
              label="Broadcasts"
            />
            <Tab icon={<HistoryEdu fontSize="small" />} iconPosition="start" label="Live Activity" />
          </Tabs>
        </Paper>

        {/* ------------------------------------------------------------------- */}
        {/* TAB 0: CLASS OVERVIEW & ANALYTICS */}
        {/* ------------------------------------------------------------------- */}
        {tabIndex === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Active Classroom Broadcast Alert Banner */}
            {announcements.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: '#faf5ff',
                        color: '#7c3aed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Campaign sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" mb={0.3} flexWrap="wrap">
                        <Chip
                          size="small"
                          label={announcements[0].priority || 'General'}
                          sx={{
                            fontWeight: 700,
                            fontSize: 10,
                            height: 18,
                            bgcolor: announcements[0].priority === 'Urgent Alert' ? '#fef2f2' : '#f5f3ff',
                            color: announcements[0].priority === 'Urgent Alert' ? '#dc2626' : '#7c3aed',
                            border: '1px solid',
                            borderColor: announcements[0].priority === 'Urgent Alert' ? '#fecaca' : '#ddd6fe'
                          }}
                        />
                        <Typography variant="caption" color="#64748b" fontWeight={500}>
                          Active Announcement · Published {formatTimeAgo(announcements[0].createdAt)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={700} color="#0f172a">
                        {announcements[0].title}
                      </Typography>
                      <Typography variant="caption" color="#64748b" sx={{ display: 'block', mt: 0.2, maxWidth: 850 }}>
                        {announcements[0].message}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} flexShrink={0} alignItems="center">
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setTabIndex(3)}
                      sx={{
                        color: '#7c3aed',
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#f5f3ff' }
                      }}
                    >
                      Manage Broadcasts ({announcements.length}) →
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setAnnouncementDialogOpen(true)}
                      sx={{
                        borderColor: '#e2e8f0',
                        color: '#334155',
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                      }}
                    >
                      + New
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            )}

            {/* Real-Time Learning Struggle Alerts */}
            {struggles.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: '#fffafb',
                  border: '1px solid #fee2e2'
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.5} mb={1.5}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: '#fee2e2',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Warning sx={{ fontSize: 16 }} />
                    </Box>
                    <Typography fontSize={13} fontWeight={700} color="#991b1b">
                      Intervention Required ({struggles.length} Student{struggles.length > 1 ? 's' : ''})
                    </Typography>
                  </Stack>
                  <Typography fontSize={12} color="#94a3b8">
                    Auto-detected via real-time quiz performance & tutor inquiries
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  {struggles.map((sig) => (
                    <Paper
                      key={sig.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#ffffff',
                        border: '1px solid #fecaca',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { md: 'center' },
                        gap: 1.5
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Avatar sx={{ bgcolor: '#fee2e2', color: '#dc2626', width: 32, height: 32, fontSize: 12, fontWeight: 700 }}>
                          {(sig.studentName || 'ST').slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography fontSize={13.5} fontWeight={700} color="#0f172a">
                              {sig.studentName}
                            </Typography>
                            <Chip
                              size="small"
                              label={`${sig.subject} • ${sig.chapterTitle}`}
                              sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: 10.5, height: 20 }}
                            />
                            {sig.triggerType === 'wrong_answer' && (
                              <Chip
                                size="small"
                                label="Incorrect Answer"
                                sx={{ bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 600, fontSize: 10.5, height: 20 }}
                              />
                            )}
                            {sig.score !== null && sig.triggerType !== 'wrong_answer' && (
                              <Chip
                                size="small"
                                label={`Score: ${sig.score}%`}
                                sx={{ bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 600, fontSize: 10.5, height: 20 }}
                              />
                            )}
                            {sig.inquiryCount && (
                              <Chip
                                size="small"
                                label={`${sig.inquiryCount}+ Inquiries`}
                                sx={{ bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 600, fontSize: 10.5, height: 20 }}
                              />
                            )}
                            {sig.mlRiskScore !== undefined && sig.mlRiskScore !== null && (
                              <Tooltip title={`Random Forest Classifier Prediction • Factors: ${sig.contributingFactors?.map(f => `${f.label}: ${f.value}`).join(', ') || 'Velocity & Accuracy'}`}>
                                <Chip
                                  size="small"
                                  icon={<Psychology sx={{ fontSize: '13px !important', color: '#4f46e5 !important' }} />}
                                  label={`ML Risk: ${sig.mlRiskScore}% (${sig.cognitiveState || 'High Struggle'})`}
                                  sx={{ bgcolor: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe', fontWeight: 700, fontSize: 10.5, height: 20 }}
                                />
                              </Tooltip>
                            )}
                          </Stack>
                          <Typography fontSize={11.5} color="#64748b" mt={0.2}>
                            {sig.detail} • <Box component="span" sx={{ color: '#94a3b8' }}>{formatTimeAgo(sig.timestamp)}</Box>
                          </Typography>
                          {sig.question && (
                            <Box sx={{ mt: 0.6, p: 0.8, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                              <Typography fontSize={11} color="#334155" fontWeight={600} noWrap sx={{ maxWidth: { xs: '260px', sm: '380px', md: '520px' }, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                📌 "{sig.question}"
                              </Typography>
                              <Stack direction="row" spacing={1.5} mt={0.2} flexWrap="wrap" alignItems="center">
                                {sig.selectedAnswer && (
                                  <Typography fontSize={10.5} color="#dc2626" fontWeight={600}>
                                    Student: <span style={{ textDecoration: 'line-through' }}>{sig.selectedAnswer}</span>
                                  </Typography>
                                )}
                                {sig.correctAnswer && (
                                  <Typography fontSize={10.5} color="#16a34a" fontWeight={600}>
                                    • Correct: {sig.correctAnswer}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} flexShrink={0}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Psychology fontSize="small" />}
                          onClick={() => handleOpenHintModal(sig)}
                          sx={{ bgcolor: '#dc2626', fontWeight: 600, fontSize: 11.5, textTransform: 'none', py: 0.4, px: 1.2, '&:hover': { bgcolor: '#b91c1c' } }}
                        >
                          Send Hint
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Assignment fontSize="small" />}
                          onClick={() => handleAssignPractice(sig)}
                          sx={{ borderColor: '#e2e8f0', color: '#334155', fontWeight: 600, fontSize: 11.5, textTransform: 'none', py: 0.4, px: 1.2, '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' } }}
                        >
                          Practice
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleResolveStruggle(sig.id)}
                          sx={{ color: '#94a3b8', fontWeight: 600, fontSize: 11.5, textTransform: 'none' }}
                        >
                          Dismiss
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* KPI Metric Cards */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: 2.5,
                mb: 3
              }}
            >
              {/* Card 1: Total Enrolled Students */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: 2.5,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: '#cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
                  <Typography variant="caption" fontWeight={700} color="#64748b" textTransform="uppercase" letterSpacing={0.5}>
                    Total Students
                  </Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <People sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ mb: 0.8, letterSpacing: -0.5 }}>
                  {analytics?.totalStudents ?? students.length}
                </Typography>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                  <Typography variant="caption" color="#64748b" fontWeight={500}>
                    <Box component="span" sx={{ color: '#0f172a', fontWeight: 700 }}>
                      {analytics?.activeToday ?? students.filter((s) => s.streak > 0 || s.isOnline).length} active
                    </Box>{' '}
                    this week
                  </Typography>
                </Stack>
              </Card>

              {/* Card 2: Class Average Accuracy */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: 2.5,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: '#cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
                  <Typography variant="caption" fontWeight={700} color="#64748b" textTransform="uppercase" letterSpacing={0.5}>
                    Average Accuracy
                  </Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ mb: 0.8, letterSpacing: -0.5 }}>
                  {analytics?.classAverageAccuracy ?? (students.length ? Math.round(students.reduce((acc, s) => acc + (s.accuracy || 0), 0) / students.length) : 0)}%
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LinearProgress
                    variant="determinate"
                    value={analytics?.classAverageAccuracy || (students.length ? Math.round(students.reduce((acc, s) => acc + (s.accuracy || 0), 0) / students.length) : 0)}
                    sx={{
                      flex: 1,
                      height: 5,
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 2.5 }
                    }}
                  />
                  <Typography variant="caption" fontWeight={700} color="#16a34a">
                    Strong
                  </Typography>
                </Stack>
              </Card>

              {/* Card 3: Total Problems Solved */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: 2.5,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: '#cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
                  <Typography variant="caption" fontWeight={700} color="#64748b" textTransform="uppercase" letterSpacing={0.5}>
                    Problems Solved
                  </Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ mb: 0.8, letterSpacing: -0.5 }}>
                  {(analytics?.totalProblemsSolved ?? students.reduce((acc, s) => acc + (s.problemsSolved || 0), 0)).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="#64748b" fontWeight={500}>
                  Textbook quizzes & Vision practice
                </Typography>
              </Card>

              {/* Card 4: Active Assignments */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: 2.5,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: '#cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
                  <Typography variant="caption" fontWeight={700} color="#64748b" textTransform="uppercase" letterSpacing={0.5}>
                    Assignments
                  </Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Assignment sx={{ fontSize: 18 }} />
                  </Box>
                </Stack>
                <Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ mb: 0.8, letterSpacing: -0.5 }}>
                  {analytics?.assignmentsSummary?.active ?? assignments.length}
                </Typography>
                <Typography variant="caption" color="#64748b" fontWeight={500}>
                  Completion rate:{' '}
                  <Box component="span" fontWeight={700} color="#0f172a">
                    {analytics?.assignmentsSummary?.completionRate ?? 60}%
                  </Box>
                </Typography>
              </Card>
            </Box>

            {/* Charts & Alerts Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
                gap: 3,
                mb: 3
              }}
            >
              {/* Topic Mastery Bar Chart */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="#0f172a">
                      Subject Mastery Across Class Roster
                    </Typography>
                    <Typography variant="caption" color="#64748b">
                      Average completion & accuracy score (%) per mathematical subject
                    </Typography>
                  </Box>
                  <IconButton onClick={refreshTeacherData} size="small">
                    <Refresh fontSize="small" />
                  </IconButton>
                </Stack>

                <Box sx={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        analytics?.topicMastery?.some((t) => t.averageMastery > 0)
                          ? analytics.topicMastery
                          : [
                              { topic: 'Algebra', averageMastery: 85 },
                              { topic: 'Geometry', averageMastery: 78 },
                              { topic: 'Arithmetic', averageMastery: 92 },
                              { topic: 'Statistics', averageMastery: 70 },
                              { topic: 'Calculus', averageMastery: 64 }
                            ]
                      }
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="topic" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <ChartTooltip
                        formatter={(val) => [`${val}% Mastery`, 'Score']}
                        contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12, fontWeight: 600 }}
                      />
                      <Bar dataKey="averageMastery" radius={[6, 6, 0, 0]}>
                        {(analytics?.topicMastery || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={TOPIC_COLORS[entry.topic] || '#0ea5e9'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>

              {/* Struggling Students Alert & Action Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <Warning sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize={16}>
                    Intervention Required
                  </Typography>
                </Stack>

                {((analytics?.strugglingStudents || students.filter((s) => s.status === 'Needs Help')).length === 0) ? (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                      <CheckCircle sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                      All Students On Track
                    </Typography>
                    <Typography variant="caption" color="#64748b" sx={{ maxWidth: 220, mt: 0.5 }}>
                      No students currently flagged for low accuracy or requiring academic intervention.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="body2" color="#64748b" mb={2}>
                      Students flagged with low accuracy (&lt;75%) or marked as <strong>Needs Help</strong>:
                    </Typography>

                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      {(analytics?.strugglingStudents || students.filter((s) => s.status === 'Needs Help')).map((st) => (
                        <Paper
                          key={st.id}
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: '#fff7ed',
                            border: '1px solid #fed7aa'
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700} color="#9a3412">
                                {st.name}
                              </Typography>
                              <Typography variant="caption" color="#c2410c" display="block">
                                Accuracy: {st.accuracy}% · Goal: {st.dailyGoal} XP/day
                              </Typography>
                              {st.teacherNotes && (
                                <Typography variant="caption" color="#7c2d12" fontStyle="italic" display="block" mt={0.5}>
                                  "{st.teacherNotes}"
                                </Typography>
                              )}
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setTabIndex(1);
                                openEditModal(st);
                              }}
                              sx={{
                                borderColor: '#ea580c',
                                color: '#ea580c',
                                textTransform: 'none',
                                fontSize: 11,
                                fontWeight: 700,
                                borderRadius: 1.5,
                                '&:hover': { bgcolor: '#ffedd5', borderColor: '#c2410c' }
                              }}
                            >
                              Assist
                            </Button>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </>
                )}
              </Paper>
            </Box>

            {/* Top Performers Podium */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0'
              }}
            >
              <Typography variant="h6" fontWeight={800} color="#0f172a" mb={2}>
                🏆 Class Leaderboard & Top Performers
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 2
                }}
              >
                {(analytics?.topPerformers || [...students].sort((a, b) => b.xp - a.xp).slice(0, 3)).map((st, i) => (
                  <Paper
                    key={st.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: i === 0 ? '#fffbeb' : '#f8fafc',
                      border: '1px solid',
                      borderColor: i === 0 ? '#fde68a' : '#e2e8f0'
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#b45309',
                          color: '#ffffff',
                          fontWeight: 800
                        }}
                      >
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                          {st.name}
                        </Typography>
                        <Typography variant="caption" color="#64748b" display="block">
                          Level {st.level} · {st.xp?.toLocaleString()} XP · {st.accuracy}% Accuracy
                        </Typography>
                        <Typography variant="caption" color="#22c55e" fontWeight={600}>
                          {st.streak} Day Streak 🔥
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: STUDENT ROSTER MANAGEMENT */}
        {/* ------------------------------------------------------------------- */}
        {tabIndex === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                mb: 3
              }}
            >
              {/* Header & Action Bar */}
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ md: 'center' }}
                spacing={2}
                mb={3}
              >
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="h6" fontWeight={800} color="#0f172a">
                      Student Roster Management
                    </Typography>
                    <Chip
                      label={`${students.length} Enrolled Student${students.length === 1 ? '' : 's'}`}
                      size="small"
                      sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: 11 }}
                    />
                    {students.some((s) => s.isOnline) && (
                      <Chip
                        label={`${students.filter((s) => s.isOnline).length} Online Now`}
                        size="small"
                        sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: 11 }}
                      />
                    )}
                  </Stack>
                  <Typography variant="caption" color="#64748b">
                    Exact sync with student portal. Edit details, adjust levels/XP, and manage credentials in real time.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Button
                    variant="contained"
                    onClick={() => setEnrollDialogOpen(true)}
                    startIcon={<Add />}
                    sx={{
                      bgcolor: '#0ea5e9',
                      color: '#ffffff',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#0284c7' }
                    }}
                  >
                    Enroll Student
                  </Button>
                  <IconButton onClick={refreshTeacherData} size="small">
                    <Refresh fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              {/* Filters Bar */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
                mb={3}
              >
                <TextField
                  size="small"
                  placeholder="Search students by name, email, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: '#f8fafc', width: { xs: '100%', sm: 340 } }
                  }}
                />

                {/* Status Filter Chips */}
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {['All', 'Online Now', 'Excelling', 'On Track', 'Needs Help'].map((st) => {
                    const onlineCount = students.filter((s) => s.isOnline).length;
                    const isOnlineChip = st === 'Online Now';
                    const isSelected = statusFilter === st;
                    return (
                      <Chip
                        key={st}
                        icon={
                          isOnlineChip ? (
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor: isSelected ? '#ffffff' : '#22c55e',
                                mr: -0.5
                              }}
                            />
                          ) : undefined
                        }
                        label={isOnlineChip ? `Online Now (${onlineCount})` : st}
                        clickable
                        onClick={() => setStatusFilter(st)}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          borderRadius: 2,
                          bgcolor: isSelected
                            ? (isOnlineChip ? '#16a34a' : '#0ea5e9')
                            : (isOnlineChip && onlineCount > 0 ? '#f0fdf4' : 'transparent'),
                          color: isSelected
                            ? '#ffffff'
                            : (isOnlineChip && onlineCount > 0 ? '#15803d' : '#64748b'),
                          borderColor: isOnlineChip ? '#86efac' : '#cbd5e1',
                          '&:hover': {
                            borderColor: isOnlineChip ? '#16a34a' : '#0ea5e9'
                          }
                        }}
                      />
                    );
                  })}
                </Stack>
              </Stack>

              {/* Students Table */}
              <TableContainer sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>STUDENT</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>ACTIVITY / ONLINE</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>PROGRESS STATUS</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>LEVEL & XP</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>ACCURACY</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#4f46e5', fontSize: 12 }}>🤖 ML STRUGGLE RISK</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>STREAK</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>DAILY GOAL</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>TEACHER NOTES</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>
                        ACTIONS
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                          No students found matching current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((st) => {
                        const statusStyle = STATUS_COLORS[st.status] || STATUS_COLORS['On Track'];
                        return (
                          <TableRow key={st.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                            {/* Student Name & Email */}
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Badge
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  variant="dot"
                                  invisible={!st.isOnline}
                                  sx={{
                                    '& .MuiBadge-badge': {
                                      bgcolor: '#22c55e',
                                      color: '#22c55e',
                                      boxShadow: '0 0 0 2px #ffffff',
                                      width: 10,
                                      height: 10,
                                      borderRadius: '50%'
                                    }
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: st.isOnline ? '#0ea5e9' : '#64748b',
                                      color: '#ffffff',
                                      width: 36,
                                      height: 36,
                                      fontSize: 13,
                                      fontWeight: 700
                                    }}
                                  >
                                    {st.name
                                      ? st.name
                                          .split(' ')
                                          .map((n) => n[0])
                                          .join('')
                                          .slice(0, 2)
                                      : 'ST'}
                                  </Avatar>
                                </Badge>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                                    {st.name}
                                  </Typography>
                                  <Typography variant="caption" color="#64748b">
                                    {st.email}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>

                            {/* Activity / Online Status */}
                            <TableCell>
                              {st.isOnline ? (
                                <Chip
                                  icon={
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: '#22c55e',
                                        boxShadow: '0 0 6px #22c55e'
                                      }}
                                    />
                                  }
                                  label="Online Now"
                                  size="small"
                                  sx={{
                                    bgcolor: '#f0fdf4',
                                    color: '#15803d',
                                    border: '1px solid #bbf7d0',
                                    fontWeight: 700,
                                    fontSize: 11
                                  }}
                                />
                              ) : st.lastLogin ? (
                                <Stack spacing={0.2}>
                                  <Typography variant="caption" fontWeight={600} color="#475569">
                                    Active {formatTimeAgo(st.lastLogin)}
                                  </Typography>
                                  <Typography variant="caption" color="#94a3b8" sx={{ fontSize: 10 }}>
                                    {new Date(st.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                </Stack>
                              ) : (
                                <Chip label="Offline" size="small" sx={{ bgcolor: '#f1f5f9', color: '#94a3b8', fontSize: 11 }} />
                              )}
                            </TableCell>

                            {/* Status Chip */}
                            <TableCell>
                              {(() => {
                                const stSig = struggles.find(
                                  (s) => (s.status === 'active' || s.status === 'intervened') &&
                                    ((s.studentEmail && s.studentEmail.toLowerCase() === (st.email || '').toLowerCase()) || s.studentId === st.id)
                                );
                                if (stSig) {
                                  return (
                                    <Tooltip title={`Struggle Alert: ${stSig.detail}. Click to send guidance hint!`}>
                                      <Chip
                                        size="small"
                                        icon={<Warning sx={{ fontSize: '13px !important', color: '#dc2626 !important' }} />}
                                        label={`⚠️ Needs Help (${stSig.chapterTitle})`}
                                        onClick={() => handleOpenHintModal(stSig)}
                                        sx={{
                                          bgcolor: '#fef2f2',
                                          color: '#dc2626',
                                          border: '1px solid #fca5a5',
                                          fontWeight: 800,
                                          fontSize: 11,
                                          cursor: 'pointer',
                                          '&:hover': { bgcolor: '#fee2e2' }
                                        }}
                                      />
                                    </Tooltip>
                                  );
                                }
                                return (
                                  <Chip
                                    label={st.status || 'On Track'}
                                    size="small"
                                    sx={{
                                      bgcolor: statusStyle.bg,
                                      color: statusStyle.color,
                                      border: `1px solid ${statusStyle.border}`,
                                      fontWeight: 700,
                                      fontSize: 11
                                    }}
                                  />
                                );
                              })()}
                            </TableCell>

                            {/* Level & XP */}
                            <TableCell>
                              <Typography variant="body2" fontWeight={700} color="#0f172a">
                                Level {st.level || 1}
                              </Typography>
                              <Typography variant="caption" color="#64748b">
                                {(st.xp || 0).toLocaleString()} XP
                              </Typography>
                            </TableCell>

                            {/* Accuracy */}
                            <TableCell>
                              <Typography variant="body2" fontWeight={700} color="#0f172a">
                                {st.accuracy || 0}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={st.accuracy || 0}
                                sx={{
                                  width: 60,
                                  height: 4,
                                  borderRadius: 2,
                                  bgcolor: '#f1f5f9',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: (st.accuracy || 0) >= 85 ? '#10b981' : (st.accuracy || 0) >= 75 ? '#0ea5e9' : '#f59e0b'
                                  }
                                }}
                              />
                            </TableCell>

                            {/* ML Struggle Risk */}
                            <TableCell>
                              <Tooltip
                                title={`Scikit-Learn Random Forest inference. Cognitive State: ${st.cognitiveState || 'Analyzing'}. Projected Accuracy: ${st.predictedAccuracy || st.accuracy}%`}
                              >
                                <Box>
                                  <Stack direction="row" spacing={0.8} alignItems="center">
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: (st.mlRiskScore || 0) >= 65 ? '#ef4444' : (st.mlRiskScore || 0) >= 35 ? '#f59e0b' : '#10b981'
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      fontWeight={700}
                                      color={(st.mlRiskScore || 0) >= 65 ? '#dc2626' : (st.mlRiskScore || 0) >= 35 ? '#d97706' : '#16a34a'}
                                    >
                                      {st.mlRiskScore !== undefined ? `${st.mlRiskScore}%` : '18.5%'}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="caption" sx={{ fontSize: 10, color: '#64748b', display: 'block', fontWeight: 600 }}>
                                    {st.cognitiveState || 'Mastery Flow'}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </TableCell>

                            {/* Streak */}
                            <TableCell>
                              <Typography variant="body2" fontWeight={700} color="#ea580c">
                                {st.streak || 0} 🔥
                              </Typography>
                            </TableCell>

                            {/* Daily Goal */}
                            <TableCell>
                              <Typography variant="body2" color="#0f172a">
                                {st.dailyGoal || 50} XP
                              </Typography>
                            </TableCell>

                            {/* Teacher Notes */}
                            <TableCell sx={{ maxWidth: 200 }}>
                              <Tooltip title={st.teacherNotes || 'No notes added yet'}>
                                <Typography
                                  variant="caption"
                                  color="#475569"
                                  sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {st.teacherNotes || '—'}
                                </Typography>
                              </Tooltip>
                            </TableCell>

                            {/* Action Buttons */}
                            <TableCell align="right">
                              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                <Tooltip title={`Start 1-on-1 Video Call with ${st.name}`}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleInitiateCallToStudent(st)}
                                    sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)', '&:hover': { bgcolor: '#d1fae5' } }}
                                  >
                                    <Videocam fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Edit Student Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => openEditModal(st)}
                                    sx={{ color: '#0ea5e9', '&:hover': { bgcolor: '#e0f2fe' } }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Reset Password">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setResetTargetStudent(st);
                                      setCustomResetPassword('TutorMind@2026');
                                      setResetResultTempPass('');
                                      setResetDialogOpen(true);
                                    }}
                                    sx={{ color: '#8b5cf6', '&:hover': { bgcolor: '#f3e8ff' } }}
                                  >
                                    <VpnKey fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Remove Student">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setStudentToDelete(st);
                                      setDeleteConfirmOpen(true);
                                    }}
                                    sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: CURRICULUM & ASSIGNMENTS */}
        {/* ------------------------------------------------------------------- */}
        {tabIndex === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                mb: 3
              }}
            >
              {/* Header & Create Assignment button */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
                spacing={2}
                mb={3}
              >
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#0f172a">
                    Curriculum Assignments Hub
                  </Typography>
                  <Typography variant="caption" color="#64748b">
                    Dispatch specific chapters from the TutorMind textbook to the entire class or targeted students.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setAssignmentDialogOpen(true)}
                  startIcon={<Add />}
                  sx={{
                    bgcolor: '#0ea5e9',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#0284c7' }
                  }}
                >
                  Create New Assignment
                </Button>
              </Stack>

              {/* Assignment Cards Grid or Empty State */}
              {assignments.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px dashed #cbd5e1' }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                    <Assignment sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
                    No Active Assignments
                  </Typography>
                  <Typography variant="body2" color="#64748b" sx={{ maxWidth: 380, mx: 'auto', mt: 0.5, mb: 2.5 }}>
                    Dispatch specific chapters from the TutorMind curriculum to your class with customized practice quizzes and due dates.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setAssignmentDialogOpen(true)}
                    startIcon={<Add />}
                    sx={{ bgcolor: '#0ea5e9', textTransform: 'none', fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: '#0284c7' } }}
                  >
                    Create First Assignment
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    gap: 2.5
                  }}
                >
                  {assignments.map((item) => {
                    const completedList = item.completedStudents || [];
                    const pendingList = item.pendingStudents || [];
                    const compCount = item.completedCount !== undefined ? item.completedCount : (item.completedStudentIds?.length || 0);
                    const totalTarget = item.targetStudentsCount || item.totalStudents || (completedList.length + pendingList.length) || students.length || 1;
                    const pendingCount = item.pendingCount !== undefined ? item.pendingCount : Math.max(0, totalTarget - compCount);
                    const percent = Math.min(100, Math.round((compCount / (totalTarget || 1)) * 100));

                    return (
                      <Card
                        key={item.id}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          bgcolor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}
                      >
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Chip
                              size="small"
                              label={item.subject || 'Mathematics'}
                              sx={{
                                bgcolor: TOPIC_COLORS[item.subject] ? `${TOPIC_COLORS[item.subject]}15` : '#f1f5f9',
                                color: TOPIC_COLORS[item.subject] || '#334155',
                                fontWeight: 700,
                                fontSize: 11
                              }}
                            />
                            <Typography variant="caption" color="#94a3b8">
                              Due: {new Date(item.dueDate || Date.now()).toLocaleDateString()}
                            </Typography>
                          </Stack>

                          <Typography variant="subtitle1" fontWeight={800} color="#0f172a" sx={{ mb: 0.5 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="#64748b" sx={{ mb: 2, fontSize: 13 }}>
                            Chapter: {item.chapterTitle || 'Standard Curriculum Module'}
                          </Typography>

                          {/* Progress */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="caption" color="#64748b" fontWeight={600}>
                              Class Completion
                            </Typography>
                            <Typography variant="caption" color="#0f172a" fontWeight={800}>
                              {percent}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: '#f1f5f9',
                              mb: 2,
                              '& .MuiLinearProgress-bar': { bgcolor: percent === 100 ? '#10b981' : '#0ea5e9' }
                            }}
                          />

                          {/* Roster Counters */}
                          <Stack direction="row" spacing={1} mb={2}>
                            <Chip
                              icon={<CheckCircle sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
                              label={`${compCount} Completed`}
                              size="small"
                              sx={{
                                bgcolor: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                fontWeight: 700,
                                fontSize: 11
                              }}
                            />
                            <Chip
                              icon={<HourglassTop sx={{ fontSize: '14px !important', color: '#d97706 !important' }} />}
                              label={`${pendingCount} Pending`}
                              size="small"
                              sx={{
                                bgcolor: '#fffbeb',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                fontWeight: 700,
                                fontSize: 11
                              }}
                            />
                          </Stack>

                          {/* Quick Roster Completion Preview */}
                          <Box sx={{ bgcolor: '#ffffff', p: 1.25, borderRadius: 2, border: '1px solid #e2e8f0', mb: 2 }}>
                            <Typography variant="caption" sx={{ display: 'block', color: '#15803d', fontWeight: 600, mb: 0.5 }}>
                              <strong>Done:</strong>{' '}
                              {completedList.length > 0
                                ? completedList.map((st) => st.name).join(', ')
                                : 'No submissions recorded yet'}
                            </Typography>
                            {pendingList.length > 0 && (
                              <Typography variant="caption" sx={{ display: 'block', color: '#b45309', fontWeight: 600 }}>
                                <strong>Pending:</strong> {pendingList.map((st) => st.name).join(', ')}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenAssignmentSubmissions(item)}
                          startIcon={<FactCheck sx={{ fontSize: 16 }} />}
                          fullWidth
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: 12,
                            borderColor: '#cbd5e1',
                            color: '#1e293b',
                            bgcolor: '#ffffff',
                            '&:hover': {
                              borderColor: '#0ea5e9',
                              bgcolor: '#f0f9ff',
                              color: '#0284c7'
                            }
                          }}
                        >
                          View Submissions ({compCount}/{totalTarget})
                        </Button>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Paper>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 3: CLASSROOM BROADCASTS & ANNOUNCEMENTS */}
        {/* ------------------------------------------------------------------- */}
        {tabIndex === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                mb: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}
            >
              {/* Section Header */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
                gap={2}
                mb={3}
              >
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="h6" fontWeight={800} color="#0f172a">
                      📢 Classroom Broadcasts & Real-Time Announcements
                    </Typography>
                    <Chip
                      label={`${announcements.length} Published`}
                      size="small"
                      sx={{ bgcolor: '#ede9fe', color: '#7c3aed', fontWeight: 800, fontSize: 11 }}
                    />
                  </Stack>
                  <Typography variant="caption" color="#64748b">
                    Broadcast instant alerts, homework reminders, and exam tips directly onto your students' dashboards in real-time.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Campaign />}
                  onClick={() => setAnnouncementDialogOpen(true)}
                  sx={{
                    bgcolor: '#8b5cf6',
                    color: '#ffffff',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    px: 2.2,
                    py: 1,
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                    '&:hover': { bgcolor: '#7c3aed' }
                  }}
                >
                  + Broadcast New Announcement
                </Button>
              </Stack>

              {/* Announcements List or Empty State */}
              {announcements.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: '#ede9fe', color: '#8b5cf6', mx: 'auto', mb: 1.5 }}>
                    <Campaign sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={800} color="#0f172a">
                    No Announcements Broadcasted Yet
                  </Typography>
                  <Typography variant="body2" color="#64748b" maxWidth={450} mx="auto" mt={0.5} mb={2.5}>
                    Keep your students informed with homework reminders, exam preparation tips, and urgent schedule alerts.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Campaign />}
                    onClick={() => setAnnouncementDialogOpen(true)}
                    sx={{
                      bgcolor: '#8b5cf6',
                      color: '#ffffff',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#7c3aed' }
                    }}
                  >
                    Compose First Announcement
                  </Button>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {announcements.map((ann) => {
                    const isUrgent = ann.priority === 'Urgent Alert';
                    const isExam = ann.priority === 'Exam Tip';
                    const isAssign = ann.priority === 'Assignment Notice';

                    const priorityBg = isUrgent ? '#fff1f2' : isExam ? '#faf5ff' : isAssign ? '#fffbeb' : '#f0f9ff';
                    const priorityBorder = isUrgent ? '#fecdd3' : isExam ? '#e9d5ff' : isAssign ? '#fde68a' : '#bae6fd';
                    const priorityColor = isUrgent ? '#e11d48' : isExam ? '#9333ea' : isAssign ? '#d97706' : '#0284c7';

                    return (
                      <Paper
                        key={ann.id}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          bgcolor: priorityBg,
                          border: `1px solid ${priorityBorder}`,
                          transition: 'all 0.2s ease',
                          '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }
                        }}
                      >
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} gap={2}>
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Avatar sx={{ bgcolor: priorityColor, color: '#ffffff', width: 42, height: 42 }}>
                              <Campaign />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center" mb={0.5} flexWrap="wrap">
                                <Chip
                                  label={ann.priority || 'General'}
                                  size="small"
                                  sx={{
                                    bgcolor: isUrgent ? '#ffe4e6' : isExam ? '#f3e8ff' : isAssign ? '#fef3c7' : '#e0f2fe',
                                    color: priorityColor,
                                    fontWeight: 800,
                                    fontSize: 11
                                  }}
                                />
                                <Chip
                                  label={ann.topic || 'Mathematics'}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: 11, fontWeight: 600, borderColor: priorityBorder }}
                                />
                                <Typography variant="caption" color="#64748b">
                                  {formatTimeAgo(ann.createdAt)} · By {ann.author || 'Faculty'}
                                </Typography>
                              </Stack>
                              <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ fontSize: 16 }}>
                                {ann.title}
                              </Typography>
                              <Typography variant="body2" color="#334155" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                                {ann.message}
                              </Typography>
                            </Box>
                          </Stack>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                            title="Delete announcement"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 4: LIVE ACTIVITY FEED */}
        {/* ------------------------------------------------------------------- */}
        {tabIndex === 4 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#0f172a">
                    Live Classroom Activity Audit
                  </Typography>
                  <Typography variant="caption" color="#64748b">
                    Real-time telemetry showing student quiz completions, AI tutor interactions, vision problem scans, and teacher roster updates.
                  </Typography>
                </Box>
                <IconButton onClick={refreshTeacherData} size="small">
                  <Refresh fontSize="small" />
                </IconButton>
              </Stack>

              <Stack spacing={1.5}>
                {activities.map((act) => {
                  let badgeColor = '#0ea5e9';
                  let icon = <CheckCircle fontSize="small" />;
                  if (act.action === 'completed_quiz') {
                    badgeColor = '#10b981';
                    icon = <Star fontSize="small" />;
                  } else if (act.action === 'solved_vision') {
                    badgeColor = '#8b5cf6';
                    icon = <AutoAwesome fontSize="small" />;
                  } else if (act.action === 'asked_tutor') {
                    badgeColor = '#f59e0b';
                    icon = <Psychology fontSize="small" />;
                  } else if (act.action?.includes('student') || act.action?.includes('password')) {
                    badgeColor = '#0284c7';
                    icon = <Edit fontSize="small" />;
                  }

                  return (
                    <Paper
                      key={act.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: badgeColor, color: '#ffffff', width: 36, height: 36 }}>{icon}</Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                              {act.studentName}
                            </Typography>
                            <Typography variant="caption" color="#94a3b8">
                              {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                              {new Date(act.timestamp).toLocaleDateString()}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="#334155" sx={{ mt: 0.3 }}>
                            {act.detail}
                          </Typography>
                          {act.chapter && (
                            <Chip
                              label={`${act.topic ? act.topic + ' · ' : ''}${act.chapter}`}
                              size="small"
                              sx={{ mt: 1, fontSize: 10, height: 20, bgcolor: '#e2e8f0', color: '#475569' }}
                            />
                          )}
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>
          </motion.div>
        )}
      </Container>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOG 1: EDIT STUDENT DETAILS */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={editStudentDialogOpen} onClose={() => setEditStudentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          ✏️ Edit Student Profile & Details
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Student Full Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email Address"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Student Level"
                type="number"
                value={editFormData.level}
                onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Total XP"
                type="number"
                value={editFormData.xp}
                onChange={(e) => setEditFormData({ ...editFormData, xp: e.target.value })}
                sx={{ flex: 1 }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Streak (days)"
                type="number"
                value={editFormData.streak}
                onChange={(e) => setEditFormData({ ...editFormData, streak: e.target.value })}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Accuracy (%)"
                type="number"
                value={editFormData.accuracy}
                onChange={(e) => setEditFormData({ ...editFormData, accuracy: e.target.value })}
                sx={{ flex: 1 }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Daily Goal (XP/day)"
                type="number"
                value={editFormData.dailyGoal}
                onChange={(e) => setEditFormData({ ...editFormData, dailyGoal: e.target.value })}
                sx={{ flex: 1 }}
              />

              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editFormData.status}
                  label="Status"
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <MenuItem value="Excelling">Excelling</MenuItem>
                  <MenuItem value="On Track">On Track</MenuItem>
                  <MenuItem value="Needs Help">Needs Help</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Teacher Pedagogical Notes & Action Items"
              multiline
              rows={3}
              placeholder="E.g., Great progress on linear equations; needs remediation on fraction conversions."
              value={editFormData.teacherNotes}
              onChange={(e) => setEditFormData({ ...editFormData, teacherNotes: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditStudentDialogOpen(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditStudentSubmit}
            disabled={loading}
            sx={{ bgcolor: '#0ea5e9', '&:hover': { bgcolor: '#0284c7' } }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOG 2: RESET STUDENT PASSWORD */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          🔑 Reset Student Credentials
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="#64748b" mb={2}>
            Reset password for <strong>{resetTargetStudent?.name}</strong> ({resetTargetStudent?.email}).
          </Typography>

          {resetResultTempPass ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Password Reset Successfully!
              </Typography>
              <Typography variant="body2">
                Provide this temporary password to the student:
              </Typography>
              <Typography
                variant="h6"
                fontWeight={800}
                color="#0f172a"
                sx={{ bgcolor: '#f1f5f9', p: 1, borderRadius: 1, textAlign: 'center', mt: 1 }}
              >
                {resetResultTempPass}
              </Typography>
            </Alert>
          ) : (
            <TextField
              fullWidth
              label="New Temporary Password"
              value={customResetPassword}
              onChange={(e) => setCustomResetPassword(e.target.value)}
              helperText="The student can log in with this password and change it later."
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResetDialogOpen(false)} sx={{ color: '#64748b' }}>
            Close
          </Button>
          {!resetResultTempPass && (
            <Button
              variant="contained"
              onClick={handleResetPasswordSubmit}
              disabled={loading || !customResetPassword}
              sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
            >
              Confirm Reset
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOG 3: ENROLL NEW STUDENT */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={enrollDialogOpen} onClose={() => setEnrollDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          👤 Enroll New Student to Class
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Student Full Name"
              placeholder="e.g. Jordan Miller"
              value={enrollFormData.name}
              onChange={(e) => setEnrollFormData({ ...enrollFormData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Student Email"
              type="email"
              placeholder="e.g. jordan.m@tutormind.com"
              value={enrollFormData.email}
              onChange={(e) => setEnrollFormData({ ...enrollFormData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Initial Password"
              value={enrollFormData.password}
              onChange={(e) => setEnrollFormData({ ...enrollFormData, password: e.target.value })}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Starting Level"
                type="number"
                value={enrollFormData.level}
                onChange={(e) => setEnrollFormData({ ...enrollFormData, level: e.target.value })}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Daily Goal (XP/day)"
                type="number"
                value={enrollFormData.dailyGoal}
                onChange={(e) => setEnrollFormData({ ...enrollFormData, dailyGoal: e.target.value })}
                sx={{ flex: 1 }}
              />
            </Stack>

            <TextField
              label="Initial Pedagogical Notes"
              placeholder="Notes on math level, learning style, or curriculum path..."
              value={enrollFormData.teacherNotes}
              onChange={(e) => setEnrollFormData({ ...enrollFormData, teacherNotes: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEnrollDialogOpen(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEnrollSubmit}
            disabled={loading || !enrollFormData.email}
            sx={{ bgcolor: '#0ea5e9', '&:hover': { bgcolor: '#0284c7' } }}
          >
            {loading ? 'Enrolling...' : 'Enroll Student'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOG 4: CREATE ASSIGNMENT FROM TEXTBOOK */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          📚 Create New Chapter Assignment
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Assignment Title"
              placeholder="e.g., Polynomial Mastery & Practice"
              value={assignmentFormData.title}
              onChange={(e) => setAssignmentFormData({ ...assignmentFormData, title: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Curriculum Subject</InputLabel>
              <Select
                value={assignmentFormData.topic}
                label="Curriculum Subject"
                onChange={(e) => {
                  const newTopic = e.target.value;
                  const chs = getChaptersForSubject(newTopic);
                  setAssignmentFormData({
                    ...assignmentFormData,
                    topic: newTopic,
                    chapter: chs[0]?.title || ''
                  });
                }}
              >
                {SUBJECT_ORDER.map((subj) => (
                  <MenuItem key={subj} value={subj}>
                    {subj}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Textbook Chapter</InputLabel>
              <Select
                value={assignmentFormData.chapter}
                label="Textbook Chapter"
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, chapter: e.target.value })}
              >
                {availableChapters.map((ch) => (
                  <MenuItem key={ch.id || ch.title} value={ch.title}>
                    {ch.unit ? `[${ch.unit}] ` : ''}
                    {ch.chapterNum ? `Ch ${ch.chapterNum}: ` : ''}
                    {ch.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Due Date"
                type="date"
                value={assignmentFormData.dueDate}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="XP Reward"
                type="number"
                value={assignmentFormData.xpReward}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, xpReward: e.target.value })}
                sx={{ flex: 1 }}
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select
                value={assignmentFormData.targetType}
                label="Assign To"
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, targetType: e.target.value })}
              >
                <MenuItem value="all">Entire Class ({students.length} students)</MenuItem>
                <MenuItem value="specific">Select Specific Students</MenuItem>
              </Select>
            </FormControl>

            {assignmentFormData.targetType === 'specific' && (
              <Box sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={700} color="#64748b" mb={1} display="block">
                  Select Students:
                </Typography>
                <Stack spacing={0.5}>
                  {students.map((st) => (
                    <FormControlLabel
                      key={st.id}
                      control={
                        <Checkbox
                          size="small"
                          checked={assignmentFormData.assignedTo.includes(st.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignmentFormData({
                                ...assignmentFormData,
                                assignedTo: [...assignmentFormData.assignedTo, st.id]
                              });
                            } else {
                              setAssignmentFormData({
                                ...assignmentFormData,
                                assignedTo: assignmentFormData.assignedTo.filter((id) => id !== st.id)
                              });
                            }
                          }}
                        />
                      }
                      label={<Typography variant="body2">{st.name}</Typography>}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignmentDialogOpen(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateAssignmentSubmit}
            disabled={loading || !assignmentFormData.title || !assignmentFormData.chapter}
            sx={{ bgcolor: '#0ea5e9', '&:hover': { bgcolor: '#0284c7' } }}
          >
            {loading ? 'Publishing...' : 'Publish Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOG 5: CONFIRM DELETE STUDENT */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#ef4444' }}>
          ⚠️ Remove Student from Class?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#475569">
            Are you sure you want to remove <strong>{studentToDelete?.name}</strong> from the class roster?
            This will remove their enrollment records and access.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteStudentSubmit}
            disabled={loading}
          >
            Remove Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOG 6: VIEW ASSIGNMENT SUBMISSIONS & WHO HAS DONE IT / NOT DONE */}
      {/* --------------------------------------------------------------------- */}
      <Dialog
        open={Boolean(submissionViewAssignment)}
        onClose={() => setSubmissionViewAssignment(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' }
        }}
      >
        {submissionViewAssignment && (() => {
          const completedList = submissionViewAssignment.completedStudents || [];
          const pendingList = submissionViewAssignment.pendingStudents || [];
          const totalCount =
            submissionViewAssignment.targetStudentsCount ||
            submissionViewAssignment.totalStudents ||
            (completedList.length + pendingList.length) ||
            1;
          const compCount = completedList.length;
          const pendCount = pendingList.length;
          const percent = Math.min(100, Math.round((compCount / (totalCount || 1)) * 100));

          const displayedList =
            submissionTab === 1
              ? completedList
              : submissionTab === 2
              ? pendingList
              : [...completedList, ...pendingList];

          return (
            <>
              <DialogTitle sx={{ pb: 1.5, pt: 2.5, px: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.75}>
                      <Chip
                        label={submissionViewAssignment.topic}
                        size="small"
                        sx={{
                          bgcolor: TOPIC_COLORS[submissionViewAssignment.topic] || '#0ea5e9',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 11
                        }}
                      />
                      <Typography variant="caption" color="#64748b">
                        Due Date: <strong>{submissionViewAssignment.dueDate}</strong>
                      </Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight={800} color="#0f172a">
                      {submissionViewAssignment.title}
                    </Typography>
                    <Typography variant="body2" color="#475569">
                      📖 Chapter: <strong>{submissionViewAssignment.chapter}</strong> · Reward: +{submissionViewAssignment.xpReward || 100} XP
                    </Typography>
                  </Box>
                  <IconButton onClick={() => setSubmissionViewAssignment(null)} size="small">
                    <Close fontSize="small" />
                  </IconButton>
                </Stack>

                {/* Metric Summary Cards */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 1.5,
                    mt: 2
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: '#ffffff',
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="caption" color="#64748b" fontWeight={600}>
                      Total Assigned
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="#0f172a">
                      {totalCount}
                    </Typography>
                  </Paper>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: '#f0fdf4',
                      borderRadius: 2,
                      border: '1px solid #bbf7d0',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="caption" color="#15803d" fontWeight={700}>
                      🟢 Completed ({percent}%)
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="#16a34a">
                      {compCount}
                    </Typography>
                  </Paper>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: '#fffbeb',
                      borderRadius: 2,
                      border: '1px solid #fde68a',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="caption" color="#b45309" fontWeight={700}>
                      ⏳ Pending / Not Done
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="#d97706">
                      {pendCount}
                    </Typography>
                  </Paper>
                </Box>

                {/* Filter Tabs */}
                <Tabs
                  value={submissionTab}
                  onChange={(e, val) => setSubmissionTab(val)}
                  sx={{
                    mt: 2,
                    minHeight: 40,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: 13,
                      minHeight: 40,
                      py: 0.5
                    }
                  }}
                >
                  <Tab label={`All Students (${totalCount})`} />
                  <Tab label={`🟢 Completed (${compCount})`} />
                  <Tab label={`⏳ Pending (${pendCount})`} />
                </Tabs>
              </DialogTitle>

              <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                {displayedList.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={700} color="#475569" mb={1}>
                      {submissionTab === 1
                        ? 'No student has completed this assignment yet.'
                        : submissionTab === 2
                        ? '🎉 All assigned students have completed this assignment!'
                        : 'No students assigned to this task.'}
                    </Typography>
                    <Typography variant="body2" color="#94a3b8">
                      {submissionTab === 1
                        ? 'Students can complete questions in their Student Dashboard under Assignments.'
                        : 'Students receive real-time notifications when you publish curriculum tasks.'}
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Student</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Score / Result</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Submission Date</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {displayedList.map((st) => {
                          const isDone = st.isCompleted;
                          const isSending = sendingReminderId === (st.id || st.email);

                          return (
                            <TableRow
                              key={st.id || st.email}
                              sx={{
                                '&:hover': { bgcolor: '#f1f5f9' },
                                bgcolor: isDone ? '#ffffff' : '#fffdfa'
                              }}
                            >
                              <TableCell>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    variant="dot"
                                    sx={{
                                      '& .MuiBadge-badge': {
                                        backgroundColor: st.isOnline ? '#22c55e' : '#94a3b8',
                                        color: st.isOnline ? '#22c55e' : '#94a3b8',
                                        boxShadow: '0 0 0 2px #ffffff',
                                        width: 9,
                                        height: 9,
                                        borderRadius: '50%'
                                      }
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        width: 34,
                                        height: 34,
                                        fontSize: 13,
                                        fontWeight: 800,
                                        bgcolor: isDone ? '#dcfce7' : '#fef3c7',
                                        color: isDone ? '#15803d' : '#b45309'
                                      }}
                                    >
                                      {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                                    </Avatar>
                                  </Badge>
                                  <Box>
                                    <Typography variant="body2" fontWeight={700} color="#0f172a">
                                      {st.name || st.username || 'Student'}
                                    </Typography>
                                    <Typography variant="caption" color="#64748b">
                                      {st.email}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>

                              <TableCell>
                                {isDone ? (
                                  <Chip
                                    icon={<CheckCircle sx={{ fontSize: '15px !important', color: '#16a34a !important' }} />}
                                    label="Completed"
                                    size="small"
                                    sx={{
                                      bgcolor: '#f0fdf4',
                                      color: '#15803d',
                                      border: '1px solid #bbf7d0',
                                      fontWeight: 700,
                                      fontSize: 12
                                    }}
                                  />
                                ) : (
                                  <Chip
                                    icon={<HourglassTop sx={{ fontSize: '15px !important', color: '#d97706 !important' }} />}
                                    label="Not Done / Pending"
                                    size="small"
                                    sx={{
                                      bgcolor: '#fffbeb',
                                      color: '#b45309',
                                      border: '1px solid #fde68a',
                                      fontWeight: 700,
                                      fontSize: 12
                                    }}
                                  />
                                )}
                              </TableCell>

                              <TableCell>
                                {isDone ? (
                                  <Box>
                                    <Typography variant="body2" fontWeight={800} color="#15803d">
                                      {st.score !== undefined ? `${st.score} / ${st.totalQuestions || 3}` : 'Passed'}
                                      {st.totalQuestions ? ` (${Math.round((st.score / st.totalQuestions) * 100)}%)` : ''}
                                    </Typography>
                                    <Typography variant="caption" color="#64748b">
                                      Verified quiz score
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="caption" color="#94a3b8" fontStyle="italic">
                                    No submission yet
                                  </Typography>
                                )}
                              </TableCell>

                              <TableCell>
                                {isDone && st.submittedAt ? (
                                  <Box>
                                    <Typography variant="caption" fontWeight={600} color="#334155" display="block">
                                      {formatTimeAgo(st.submittedAt)}
                                    </Typography>
                                    <Typography variant="caption" color="#94a3b8" fontSize={10}>
                                      {new Date(st.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="caption" color="#94a3b8">
                                    —
                                  </Typography>
                                )}
                              </TableCell>

                              <TableCell align="right">
                                {!isDone ? (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Send sx={{ fontSize: 13 }} />}
                                    disabled={isSending}
                                    onClick={() => handleSendReminder(submissionViewAssignment.id, st)}
                                    sx={{
                                      textTransform: 'none',
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: '#b45309',
                                      borderColor: '#fde68a',
                                      bgcolor: '#fffbeb',
                                      '&:hover': {
                                        borderColor: '#d97706',
                                        bgcolor: '#fef3c7'
                                      }
                                    }}
                                  >
                                    {isSending ? 'Sending...' : 'Remind'}
                                  </Button>
                                ) : (
                                  <Typography variant="caption" color="#16a34a" fontWeight={700}>
                                    ✓ Completed
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DialogContent>

              <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Button
                  onClick={refreshTeacherData}
                  startIcon={<Refresh />}
                  size="small"
                  sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, mr: 'auto' }}
                >
                  Refresh Submissions
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setSubmissionViewAssignment(null)}
                  sx={{ bgcolor: '#0ea5e9', '&:hover': { bgcolor: '#0284c7' }, textTransform: 'none', fontWeight: 700 }}
                >
                  Done
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* Teacher Guided Hint Intervention Dialog */}
      <Dialog
        open={Boolean(hintModalSignal)}
        onClose={() => setHintModalSignal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            bgcolor: '#ffffff',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15)'
          }
        }}
      >
        {hintModalSignal && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography fontSize={11} fontFamily="DM Mono, monospace" color="#ef4444" fontWeight={700} textTransform="uppercase">
                  PEDAGOGICAL INTERVENTION
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#0f172a">
                  Send Guided Hint to {hintModalSignal.studentName || 'Student'}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setHintModalSignal(null)}>
                <Close fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Typography fontSize={13} color="#64748b" mb={2}>
                Topic: <strong>{hintModalSignal.subject || 'Mathematics'} • {hintModalSignal.chapterTitle || 'Lesson'}</strong> {hintModalSignal.detail ? `(${hintModalSignal.detail})` : ''}
              </Typography>

              {hintModalSignal.question && (
                <Paper sx={{ p: 1.5, mb: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}>
                  <Typography fontSize={11} fontWeight={800} color="#991b1b" mb={0.5} letterSpacing={0.5}>
                    MISSED QUESTION DETAILS
                  </Typography>
                  <Typography fontSize={12.5} color="#0f172a" mb={1} fontStyle="italic" fontWeight={500}>
                    "{hintModalSignal.question}"
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                    {hintModalSignal.selectedAnswer && (
                      <Chip
                        size="small"
                        label={`Student Chose: ${hintModalSignal.selectedAnswer}`}
                        sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontSize: 11 }}
                      />
                    )}
                    {hintModalSignal.correctAnswer && (
                      <Chip
                        size="small"
                        label={`Correct Answer: ${hintModalSignal.correctAnswer}`}
                        sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 11 }}
                      />
                    )}
                  </Stack>
                </Paper>
              )}

              <Typography fontSize={12} fontWeight={700} color="#334155" mb={1}>
                Pre-Crafted Guidance Hint (editable):
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={customHintText}
                onChange={(e) => setCustomHintText(e.target.value)}
                placeholder="Type conceptual guidance or hint for the student..."
                sx={{ mb: 2 }}
              />
              <Typography fontSize={11} color="#94a3b8">
                This guidance hint will immediately pop up on the student's screen and can be seamlessly applied to their Socratic AI Tutor session.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setHintModalSignal(null)} sx={{ color: '#64748b' }}>
                Cancel
              </Button>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  startIcon={<Videocam />}
                  onClick={() => {
                    const studentObj = students.find((s) => s.id === hintModalSignal.studentId || (s.email && s.email.toLowerCase() === (hintModalSignal.studentEmail || '').toLowerCase())) || {
                      id: hintModalSignal.studentId,
                      name: hintModalSignal.studentName || 'Student',
                      email: hintModalSignal.studentEmail || ''
                    };
                    setHintModalSignal(null);
                    handleInitiateCallToStudent(studentObj, `Intervention: ${hintModalSignal.chapterTitle || hintModalSignal.subject || 'STEM'}`);
                  }}
                  sx={{
                    borderColor: '#6366f1',
                    color: '#4f46e5',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#e0e7ff', borderColor: '#4f46e5' }
                  }}
                >
                  1-on-1 Video Call
                </Button>
                <Button
                  variant="contained"
                  disabled={sendingHint || !customHintText.trim()}
                  startIcon={sendingHint ? <CircularProgress size={14} color="inherit" /> : <Send fontSize="small" />}
                  onClick={handleSendHint}
                  sx={{ bgcolor: '#ef4444', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#dc2626' } }}
                >
                  Dispatch Hint to Student
                </Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 🧠 ML Model Inspector & Cognitive Analytics Dialog */}
      <Dialog
        open={mlInspectorOpen}
        onClose={() => setMlInspectorOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            bgcolor: '#ffffff',
            boxShadow: '0 25px 60px rgba(0,0,0,0.18)'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', width: 32, height: 32 }}>
                <Psychology fontSize="small" />
              </Avatar>
              <Typography fontSize={11} fontFamily="DM Mono, monospace" color="#4f46e5" fontWeight={700} textTransform="uppercase">
                MACHINE LEARNING ARCHITECTURE
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={800} color="#0f172a" mt={0.5}>
              Cognitive Struggle Detection Model (Scikit-Learn)
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setMlInspectorOpen(false)}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography fontSize={13} color="#64748b" mb={2.5}>
            In addition to Google Gemini foundation models for natural language explanations, TutorMind runs a dedicated 
            <strong> Random Forest Classifier</strong> trained via <strong>scikit-learn</strong> on 4,000 learning telemetry sessions to predict cognitive friction, impasse, and struggle risk in real time.
          </Typography>

          {/* Metric KPIs */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={3}>
            {[
              { label: 'Validation Accuracy', value: `${((mlModelInfo?.accuracy || 0.9538) * 100).toFixed(2)}%`, sub: 'Out-of-sample holdout', color: '#16a34a', bg: '#f0fdf4' },
              { label: 'ROC-AUC Score', value: (mlModelInfo?.roc_auc || 0.9942).toFixed(4), sub: 'Discrimination quality', color: '#4f46e5', bg: '#eef2ff' },
              { label: 'Weighted F1-Score', value: (mlModelInfo?.f1_score || 0.9641).toFixed(4), sub: 'Precision-recall harmonic', color: '#0284c7', bg: '#f0f9ff' },
              { label: '5-Fold Cross-Val', value: `${((mlModelInfo?.cv_mean_accuracy || 0.9460) * 100).toFixed(2)}%`, sub: 'Generalization stability', color: '#d97706', bg: '#fffbeb' }
            ].map((m) => (
              <Paper
                key={m.label}
                elevation={0}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: m.bg,
                  border: `1px solid ${m.color}25`
                }}
              >
                <Typography fontSize={11} fontWeight={700} color="#64748b" textTransform="uppercase">
                  {m.label}
                </Typography>
                <Typography fontSize={20} fontWeight={800} color={m.color} mt={0.3}>
                  {m.value}
                </Typography>
                <Typography fontSize={10} color="#94a3b8">
                  {m.sub}
                </Typography>
              </Paper>
            ))}
          </Stack>

          {/* Explainable AI (XAI) Feature Importance */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography fontSize={12} fontWeight={800} color="#1e293b" mb={1.5} textTransform="uppercase" letterSpacing={0.5}>
              📊 Explainable AI (XAI): Feature Importance Weights (Gini Impurity)
            </Typography>
            <Stack spacing={1.2}>
              {[
                { name: 'Consecutive Error Velocity', weight: 40.15, desc: 'Fastest trigger of conceptual impasse or frustration' },
                { name: 'AI Tutor Inquiries on Concept', weight: 31.74, desc: 'Repetitive clarification requests indicate knowledge gaps' },
                { name: 'Recent Assessment Accuracy', weight: 13.12, desc: 'Baseline topic accuracy across practice chapters' },
                { name: 'Solving Latency / Pacing Ratio', weight: 11.92, desc: 'Time taken per solution step relative to norm' },
                { name: 'Learning Streak Days', weight: 1.93, desc: 'Consistency buffer against intermittent slips' },
                { name: 'Topic Complexity Tier', weight: 1.15, desc: 'Foundational vs Multi-step advanced difficulty' }
              ].map((f) => (
                <Box key={f.name}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.4}>
                    <Typography fontSize={12} fontWeight={700} color="#334155">
                      {f.name} <Box component="span" sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>— {f.desc}</Box>
                    </Typography>
                    <Typography fontSize={12} fontWeight={800} color="#4f46e5">
                      {f.weight}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={f.weight}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: f.weight > 30 ? '#4f46e5' : f.weight > 10 ? '#0ea5e9' : '#94a3b8'
                      }
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Interactive ML Simulator */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#ffffff', border: '1.5px solid #c7d2fe' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Box>
                <Typography fontSize={13} fontWeight={800} color="#1e1b4b">
                  🧪 Interactive Telemetry Simulator & Live Inference
                </Typography>
                <Typography fontSize={11} color="#64748b">
                  Adjust simulated student telemetry below and test the live scikit-learn model inference pipeline:
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                disabled={mlSimLoading}
                startIcon={mlSimLoading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesome fontSize="small" />}
                onClick={() => handleRunMLSim(mlSimTelemetry)}
                sx={{ bgcolor: '#4f46e5', fontWeight: 700, fontSize: 12, '&:hover': { bgcolor: '#4338ca' } }}
              >
                {mlSimLoading ? 'Inferencing...' : 'Run Inference'}
              </Button>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>
              {/* Sliders */}
              <Box sx={{ flex: 1 }}>
                <Typography fontSize={11} fontWeight={700} color="#475569">
                  Recent Assessment Accuracy: {Math.round(mlSimTelemetry.accuracyRate * 100)}%
                </Typography>
                <Slider
                  size="small"
                  value={mlSimTelemetry.accuracyRate}
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  onChange={(_, val) => setMlSimTelemetry((prev) => ({ ...prev, accuracyRate: val }))}
                  sx={{ color: '#4f46e5', mb: 1 }}
                />

                <Typography fontSize={11} fontWeight={700} color="#475569">
                  Consecutive Errors: {mlSimTelemetry.consecutiveErrors} attempts
                </Typography>
                <Slider
                  size="small"
                  value={mlSimTelemetry.consecutiveErrors}
                  min={0}
                  max={5}
                  step={1}
                  onChange={(_, val) => setMlSimTelemetry((prev) => ({ ...prev, consecutiveErrors: val }))}
                  sx={{ color: '#ef4444', mb: 1 }}
                />

                <Typography fontSize={11} fontWeight={700} color="#475569">
                  AI Tutor Inquiries on Topic: {mlSimTelemetry.tutorInquiries} queries
                </Typography>
                <Slider
                  size="small"
                  value={mlSimTelemetry.tutorInquiries}
                  min={0}
                  max={8}
                  step={1}
                  onChange={(_, val) => setMlSimTelemetry((prev) => ({ ...prev, tutorInquiries: val }))}
                  sx={{ color: '#f59e0b', mb: 1 }}
                />

                <Typography fontSize={11} fontWeight={700} color="#475569">
                  Solving Latency Ratio: {mlSimTelemetry.solvingLatency.toFixed(1)}x normal
                </Typography>
                <Slider
                  size="small"
                  value={mlSimTelemetry.solvingLatency}
                  min={0.5}
                  max={3.5}
                  step={0.1}
                  onChange={(_, val) => setMlSimTelemetry((prev) => ({ ...prev, solvingLatency: val }))}
                  sx={{ color: '#0ea5e9' }}
                />
              </Box>

              {/* Simulation Result Card */}
              <Box sx={{ flex: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography fontSize={11} fontWeight={800} color="#64748b" textTransform="uppercase" mb={1}>
                  LIVE INFERENCE RESULT
                </Typography>
                {mlSimResult ? (
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontSize={24} fontWeight={800} color={mlSimResult.struggleRiskScore >= 65 ? '#dc2626' : mlSimResult.struggleRiskScore >= 35 ? '#d97706' : '#16a34a'}>
                        {mlSimResult.struggleRiskScore}%
                      </Typography>
                      <Chip
                        size="small"
                        label={mlSimResult.cognitiveState}
                        sx={{
                          fontWeight: 800,
                          fontSize: 11,
                          bgcolor: mlSimResult.struggleRiskScore >= 65 ? '#fee2e2' : mlSimResult.struggleRiskScore >= 35 ? '#fef3c7' : '#dcfce7',
                          color: mlSimResult.struggleRiskScore >= 65 ? '#dc2626' : mlSimResult.struggleRiskScore >= 35 ? '#b45309' : '#15803d'
                        }}
                      />
                    </Stack>
                    <Typography fontSize={11} color="#64748b">
                      Model: <strong>RandomForestClassifier</strong> • Confidence: <strong>95.4%</strong>
                    </Typography>
                    <Typography fontSize={12} color="#334155" sx={{ fontStyle: 'italic', bgcolor: '#ffffff', p: 1, borderRadius: 1, border: '1px dashed #cbd5e1' }}>
                      💡 "{mlSimResult.recommendedAction || 'Monitor progress.'}"
                    </Typography>
                    {mlSimResult.contributingFactors && (
                      <Stack spacing={0.4} mt={0.5}>
                        {mlSimResult.contributingFactors.slice(0, 3).map((factor) => (
                          <Typography key={factor.feature} fontSize={11} color="#475569">
                            • <strong>{factor.label}</strong>: {factor.value} ({factor.impact} impact)
                          </Typography>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography fontSize={12} color="#94a3b8">
                      Click "Run Inference" above to calculate struggle risk and cognitive state from telemetry.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMlInspectorOpen(false)} sx={{ color: '#64748b', fontWeight: 600 }}>
            Close Inspector
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------------- */}
      {/* DIALOG: BROADCAST CLASSROOM ANNOUNCEMENT */}
      {/* ------------------------------------------------------------------- */}
      <Dialog
        open={announcementDialogOpen}
        onClose={() => setAnnouncementDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            p: 1,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: '#8b5cf6', color: '#ffffff', width: 38, height: 38 }}>
              <Campaign />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                Broadcast Classroom Announcement
              </Typography>
              <Typography variant="caption" color="#64748b">
                Publish a live notice to all students across the Student Dashboard
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <form onSubmit={handleCreateAnnouncementSubmit}>
          <DialogContent sx={{ pt: 1.5 }}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Announcement Headline / Title"
                placeholder="e.g., Important: Midterm Chapter Review on Friday!"
                value={announcementFormData.title}
                onChange={(e) => setAnnouncementFormData((f) => ({ ...f, title: e.target.value }))}
                required
              />

              <Box>
                <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={1}>
                  Priority Level:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {[
                    { key: 'General', label: '📢 General Notice', color: '#0ea5e9', bg: '#e0f2fe' },
                    { key: 'Urgent Alert', label: '🚨 Urgent Alert', color: '#ef4444', bg: '#fee2e2' },
                    { key: 'Assignment Notice', label: '📚 Assignment Alert', color: '#f59e0b', bg: '#fef3c7' },
                    { key: 'Exam Tip', label: '💡 Exam Tip', color: '#8b5cf6', bg: '#ede9fe' }
                  ].map((p) => {
                    const selected = announcementFormData.priority === p.key;
                    return (
                      <Chip
                        key={p.key}
                        label={p.label}
                        onClick={() => setAnnouncementFormData((f) => ({ ...f, priority: p.key }))}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: 12,
                          bgcolor: selected ? p.bg : '#f1f5f9',
                          color: selected ? p.color : '#64748b',
                          border: selected ? `1.5px solid ${p.color}` : '1px solid #e2e8f0',
                          '&:hover': { bgcolor: p.bg }
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Subject Scope</InputLabel>
                <Select
                  value={announcementFormData.topic}
                  label="Subject Scope"
                  onChange={(e) => setAnnouncementFormData((f) => ({ ...f, topic: e.target.value }))}
                >
                  <MenuItem value="Mathematics">Mathematics</MenuItem>
                  <MenuItem value="Physics">Physics</MenuItem>
                  <MenuItem value="Computer Science">Computer Science</MenuItem>
                  <MenuItem value="Chemistry">Chemistry</MenuItem>
                  <MenuItem value="All Subjects">All Subjects</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3.5}
                label="Announcement Message"
                placeholder="Write clear instructions, study pointers, or reminders for your students..."
                value={announcementFormData.message}
                onChange={(e) => setAnnouncementFormData((f) => ({ ...f, message: e.target.value }))}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={() => setAnnouncementDialogOpen(false)} sx={{ color: '#64748b', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={broadcasting}
              startIcon={<Campaign />}
              sx={{
                bgcolor: '#8b5cf6',
                color: '#ffffff',
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: 2,
                px: 2.5,
                '&:hover': { bgcolor: '#7c3aed' }
              }}
            >
              {broadcasting ? 'Broadcasting...' : '🚀 Broadcast to All Students'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 📹 Incoming Video Call Ringing Alert Dialog */}
      <IncomingCallDialog
        open={Boolean(incomingCall)}
        call={incomingCall}
        currentRole="teacher"
        onAccept={handleAcceptIncomingCall}
        onDecline={handleDeclineIncomingCall}
      />

      {/* 🖥️ Virtual Meeting Room (Camera, Mic, Screen Share, Whiteboard & In-Call Chat) */}
      {activeMeeting && (
        <VirtualMeetingRoom
          call={activeMeeting}
          currentUser={teacher}
          currentRole="teacher"
          onEndCall={handleEndMeeting}
        />
      )}

      {/* ⚙️ Teacher Office Hours Management Dialog */}
      <Dialog
        open={officeHoursDialogOpen}
        onClose={() => setOfficeHoursDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: '#059669', width: 36, height: 36 }}>
              <Videocam sx={{ color: '#fff', fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                Configure Virtual Office Hours
              </Typography>
              <Typography variant="caption" color="#64748b">
                Set your live availability and meeting schedule for students
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={() => setOfficeHoursDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          <Stack spacing={2.5}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: officeHours.isLive ? '#ecfdf5' : '#f8fafc',
                border: '1px solid',
                borderColor: officeHours.isLive ? '#a7f3d0' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color={officeHours.isLive ? '#065f46' : '#334155'}>
                  {officeHours.isLive ? '🟢 Live Office Hours: Active & Accepting Calls' : '⚪ Office Hours: Away / Closed'}
                </Typography>
                <Typography variant="caption" color="#64748b">
                  Students see a pulsing green video call button when you are live.
                </Typography>
              </Box>
              <Switch
                checked={Boolean(officeHours.isLive)}
                onChange={(e) => handleToggleOfficeHoursLive(e.target.checked)}
                color="success"
              />
            </Box>

            <TextField
              fullWidth
              label="Weekly Schedule (e.g. Days & Times)"
              value={officeHoursScheduleInput}
              onChange={(e) => setOfficeHoursScheduleInput(e.target.value)}
              placeholder="Monday – Friday · 3:00 PM – 5:30 PM"
              helperText="Visible to students in their dashboard header bar"
            />

            <TextField
              fullWidth
              label="Today's Active Window"
              value={officeHoursWindowInput}
              onChange={(e) => setOfficeHoursWindowInput(e.target.value)}
              placeholder="3:00 PM – 5:30 PM"
            />

            <TextField
              fullWidth
              label="Focus Subjects & Doubts Welcomed"
              value={officeHoursFocusInput}
              onChange={(e) => setOfficeHoursFocusInput(e.target.value)}
              placeholder="All STEM Subjects (Math, Physics, CS, Chemistry)"
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Student Welcome Note / Instructions"
              value={officeHoursMsgInput}
              onChange={(e) => setOfficeHoursMsgInput(e.target.value)}
              placeholder="Live Office Hours are OPEN! Click below to start an interactive 1-on-1 video call."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<Videocam />}
            onClick={() => {
              setOfficeHoursDialogOpen(false);
              handleOpenHostMeetingRoom();
            }}
            sx={{ textTransform: 'none', fontWeight: 700, borderColor: '#059669', color: '#059669' }}
          >
            Launch Host Meeting Room Now
          </Button>
          <Stack direction="row" spacing={1.5}>
            <Button onClick={() => setOfficeHoursDialogOpen(false)} sx={{ color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveOfficeHoursDetails}
              sx={{ bgcolor: '#059669', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#047857' } }}
            >
              Save Changes
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Toast notifications */}
      <Snackbar
        open={Boolean(toast)}
        message={toast}
        autoHideDuration={3500}
        onClose={() => setToast('')}
      />
    </Box>
  );
}
