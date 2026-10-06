import React, { useState } from 'react';
import { useTranslation } from './i18n/LanguageContext';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Close,
  Download,
  EditNote,
  EmojiEvents,
  LocalFireDepartment,
  School,
  Share,
  Timeline,
  WorkspacePremium
} from '@mui/icons-material';
import ShareProfileModal from './components/ShareProfileModal';

const Panel = ({ children, sx = {} }) => (
  <Paper
    sx={{
      p: { xs: 2, sm: 2.5 },
      border: '1px solid #e6e2d9',
      borderRadius: 2,
      bgcolor: '#fffdf8',
      boxShadow: '0 10px 30px rgba(44,39,27,.045)',
      minWidth: 0,
      boxSizing: 'border-box',
      ...sx
    }}
  >
    {children}
  </Paper>
);

const Eyebrow = ({ children }) => (
  <Typography
    sx={{
      fontFamily: 'DM Mono, monospace',
      fontSize: 10,
      letterSpacing: 1.2,
      color: '#9b9991',
      textTransform: 'uppercase',
      mb: 0.8
    }}
  >
    {children}
  </Typography>
);

const AVATAR_PALETTES = [
  { name: 'Warm Terracotta', bg: '#ec735e', color: '#ffffff' },
  { name: 'Golden Sand', bg: '#d8c6a7', color: '#35342d' },
  { name: 'Amber Gold', bg: '#f6c857', color: '#382b05' },
  { name: 'Soft Lavender', bg: '#c7b9e9', color: '#2c2247' },
  { name: 'Sage Green', bg: '#84b98a', color: '#16331a' },
  { name: 'Midnight Charcoal', bg: '#20211f', color: '#fffdf8' }
];

const ACHIEVEMENTS = [
  {
    id: 'streak-7',
    icon: '🔥',
    title: '7-Day Inferno',
    category: 'streaks',
    tier: 'Silver',
    tierColor: '#9fa0a4',
    desc: 'Maintained a continuous 7-day learning momentum.',
    unlocked: true,
    unlockedDate: 'Yesterday',
    xpReward: 100,
    rarity: '18% of learners'
  },
  {
    id: 'first-step',
    icon: '✦',
    title: 'First Discovery',
    category: 'special',
    tier: 'Bronze',
    tierColor: '#cd7f32',
    desc: 'Completed your very first interactive math chapter.',
    unlocked: true,
    unlockedDate: '3 weeks ago',
    xpReward: 30,
    rarity: '94% of learners'
  },
  {
    id: 'algebra-ace',
    icon: '📐',
    title: 'Algebra Architect',
    category: 'mastery',
    tier: 'Gold',
    tierColor: '#e5a93b',
    desc: 'Solved over 20 algebraic expressions and balance problems.',
    unlocked: true,
    unlockedDate: '4 days ago',
    xpReward: 150,
    rarity: '24% of learners'
  },
  {
    id: 'perfect-5',
    icon: '✧',
    title: 'Precision Master',
    category: 'special',
    tier: 'Silver',
    tierColor: '#9fa0a4',
    desc: 'Achieved 100% accuracy on 5 consecutive chapter quizzes.',
    unlocked: true,
    unlockedDate: 'Last week',
    xpReward: 80,
    rarity: '31% of learners'
  },
  {
    id: 'all-topics',
    icon: '◒',
    title: 'Broad Horizon',
    category: 'mastery',
    tier: 'Bronze',
    tierColor: '#cd7f32',
    desc: 'Practiced across all 5 subject libraries in one week.',
    unlocked: true,
    unlockedDate: '5 days ago',
    xpReward: 60,
    rarity: '42% of learners'
  },
  {
    id: 'vision-pioneer',
    icon: '👁',
    title: 'Math Visionary',
    category: 'special',
    tier: 'Silver',
    tierColor: '#9fa0a4',
    desc: 'Scanned and solved handwritten math questions with AI.',
    unlocked: true,
    unlockedDate: 'Today',
    xpReward: 75,
    rarity: '29% of learners'
  },
  {
    id: 'calculus-pioneer',
    icon: '∫',
    title: 'Limit Breaker',
    category: 'mastery',
    tier: 'Gold',
    tierColor: '#e5a93b',
    desc: 'Mastered Intuitive Limits and Differential foundations.',
    unlocked: false,
    progress: 60,
    xpReward: 200,
    rarity: '9% of learners'
  },
  {
    id: 'streak-30',
    icon: '⚡',
    title: 'Monthly Titan',
    category: 'streaks',
    tier: 'Diamond',
    tierColor: '#4bb3b8',
    desc: 'Complete a 30-day streak without breaking momentum.',
    unlocked: false,
    progress: 23,
    xpReward: 350,
    rarity: '4% of learners'
  }
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    icon: '✓',
    iconBg: '#e8f4ea',
    iconColor: '#2e7d32',
    title: 'Mastered Linear Equations',
    topic: 'Algebra · Chapter 03',
    time: 'Today, 2:15 PM',
    xp: '+50 XP',
    badge: '100% Quiz'
  },
  {
    id: 2,
    icon: '👁',
    iconBg: '#faf0ea',
    iconColor: '#ec735e',
    title: 'Handwritten Problem Solved',
    topic: 'Math Vision AI',
    time: 'Yesterday',
    xp: '+40 XP',
    badge: 'Step-by-Step'
  },
  {
    id: 3,
    icon: '🔥',
    iconBg: '#fff3dc',
    iconColor: '#bd8c28',
    title: '7-Day Streak Milestone Reached',
    topic: 'Consistency Goal',
    time: '2 days ago',
    xp: '+100 XP',
    badge: 'Badge Unlocked'
  },
  {
    id: 4,
    icon: '✦',
    iconBg: '#eee8fb',
    iconColor: '#6f56b0',
    title: 'Completed Angles in Motion',
    topic: 'Geometry · Chapter 02',
    time: '4 days ago',
    xp: '+45 XP',
    badge: 'Completed'
  }
];

export function getTrailing28Days(dailyActivity = {}, isDemo = false, currentXP = 0, focusMinutes = 0) {
  const days = [];
  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = String(d.getDate()).padStart(2, '0');
    const dayLetter = dayLetters[d.getDay()];

    let entry = dailyActivity[dateStr] || { minutes: 0, xp: 0 };
    if (isDemo && !dailyActivity[dateStr]) {
      const demoMins = [25, 35, 15, 28, 40, 55, 20, 22, 12, 38, 26, 35, 60, 25, 20, 32, 24, 42, 28, 50, 34, 24, 36, 28, 48, 30, 52, 28][27 - i];
      const demoXP = [50, 75, 30, 60, 90, 120, 45, 50, 25, 80, 55, 75, 130, 50, 40, 70, 50, 95, 60, 110, 70, 50, 80, 60, 105, 65, 115, 60][27 - i];
      entry = { minutes: demoMins, xp: demoXP };
    } else if (i === 0 && entry.minutes === 0 && entry.xp === 0) {
      if (focusMinutes > 0 || currentXP > 0) {
        entry = { minutes: focusMinutes, xp: currentXP % 100 };
      }
    }

    const xp = entry.xp || 0;
    const mins = entry.minutes || 0;
    let level = 0;
    if (xp >= 100 || mins >= 45) level = 4;
    else if (xp >= 60 || mins >= 30) level = 3;
    else if (xp >= 30 || mins >= 15) level = 2;
    else if (xp > 0 || mins > 0) level = 1;

    days.push({
      day: dayLetter,
      level,
      date: i === 0 ? 'Today' : `${monthShort} ${dayNum}`,
      fullDate: dateStr,
      mins,
      xp,
      isToday: i === 0
    });
  }
  return days;
}

export function getTrailing7Days(dailyActivity = {}, isDemo = false, focusMinutes = 0, streak = 0) {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];
    const dayLetter = dayLetters[d.getDay()];

    let entry = dailyActivity[dateStr] || { minutes: 0, xp: 0 };
    if (isDemo && !dailyActivity[dateStr]) {
      const demoMins = [18, 27, 21, 31, 25, 38, 19][6 - i];
      entry = { minutes: demoMins, xp: demoMins * 2 };
    } else if (i === 0 && entry.minutes === 0 && entry.xp === 0 && focusMinutes > 0) {
      entry = { minutes: focusMinutes, xp: 50 };
    }

    days.push({
      day: dayName,
      letter: dayLetter,
      date: dateStr,
      minutes: entry.minutes || 0,
      xp: entry.xp || 0,
      isToday: i === 0,
      active: (entry.minutes > 0 || entry.xp > 0) || (i === 0 && streak > 0)
    });
  }
  return days;
}

export default function ProfilePage({ user, setUser, setPage, onToast }) {
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeFilter, setBadgeFilter] = useState('all');
  
  const { t } = useTranslation();
  const isDemo = false;
  const defaultName = user?.name || user?.email?.split('@')[0] || 'Learner';
  const defaultBio = user?.bio || 'Ready to explore math concepts step by step.';

  const [name, setName] = useState(user?.name || defaultName);
  const [bio, setBio] = useState(user?.bio || defaultBio);
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 50);
  const [favoriteTopic, setFavoriteTopic] = useState(user?.favoriteTopic || 'Mathematics');
  const [avatarBg, setAvatarBg] = useState(user?.avatarBg || '#d8c6a7');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#35342d');

  const currentXP = user?.xp ?? (isDemo ? 1240 : 0);
  const level = Math.floor(currentXP / 100) + 1;
  const levelProgress = currentXP % 100;
  const xpNeeded = 100 - levelProgress;
  const streak = user?.streak ?? (isDemo ? 7 : 0);
  const chaptersCount = user?.completedChapters ?? (isDemo ? 18 : 0);
  const problemsCount = user?.problemsSolved ?? (isDemo ? 142 : 0);
  const accuracyRate = problemsCount > 0 ? (user?.accuracy ?? 100) : 0;
  const focusMinutes = user?.focusMinutes ?? (isDemo ? 860 : 0);
  const focusTimeDisplay = focusMinutes > 0 ? `${Math.floor(focusMinutes / 60)}h ${focusMinutes % 60}m` : '0m';

  const mathVal = user?.topicProgress?.['Mathematics'] ?? (
    user?.topicProgress?.['Algebra'] !== undefined
      ? Math.round(((user.topicProgress.Algebra || 0) + (user.topicProgress.Geometry || 0) + (user.topicProgress.Calculus || 0) + (user.topicProgress.Statistics || 0) + (user.topicProgress.Arithmetic || 0)) / 5)
      : (isDemo ? 68 : 0)
  );
  const physicsVal = user?.topicProgress?.['Physics'] ?? (isDemo ? 65 : 0);
  const csVal = user?.topicProgress?.['Computer Science'] ?? (isDemo ? 70 : 0);
  const chemistryVal = user?.topicProgress?.['Chemistry'] ?? (isDemo ? 55 : 0);

  const topicsData = [
    { name: t('topics.Mathematics') || 'Mathematics', value: mathVal, color: '#ec735e', chapters: '23 chapters (5 Units)', status: mathVal >= 70 ? t('profile.status_proficient') : mathVal > 0 ? t('profile.status_in_progress') : t('profile.status_not_started') },
    { name: t('topics.Physics') || 'Physics', value: physicsVal, color: '#4f46e5', chapters: '4 chapters', status: physicsVal >= 50 ? t('profile.status_proficient') : physicsVal > 0 ? t('profile.status_in_progress') : t('profile.status_not_started') },
    { name: t('topics.Computer Science') || 'Computer Science', value: csVal, color: '#0d9488', chapters: '4 chapters', status: csVal >= 50 ? t('profile.status_proficient') : csVal > 0 ? t('profile.status_in_progress') : t('profile.status_not_started') },
    { name: t('topics.Chemistry') || 'Chemistry', value: chemistryVal, color: '#e11d48', chapters: '4 chapters', status: chemistryVal >= 50 ? t('profile.status_proficient') : chemistryVal > 0 ? t('profile.status_in_progress') : t('profile.status_not_started') }
  ];

  const dynamicBadges = ACHIEVEMENTS.map((b) => {
    if (b.id === 'streak-7') return { ...b, unlocked: streak >= 7 };
    if (b.id === 'first-step') return { ...b, unlocked: chaptersCount >= 1 };
    if (b.id === 'algebra-ace') return { ...b, unlocked: mathVal >= 70 };
    if (b.id === 'perfect-5') return { ...b, unlocked: problemsCount >= 5 && accuracyRate === 100 };
    if (b.id === 'all-topics') return { ...b, unlocked: mathVal > 0 && physicsVal > 0 && csVal > 0 && chemistryVal > 0 };
    if (b.id === 'vision-pioneer') return { ...b, unlocked: Boolean(user?.visionSolves && user.visionSolves >= 1) };
    if (b.id === 'calculus-pioneer') {
      const calcProgress = user?.topicProgress?.Calculus ?? (
        user?.completedChapterIds?.some((id) => id.includes('Limits') || id.includes('Derivatives') || id.includes('Integrals') || id.includes('Differential'))
          ? 100
          : Math.min(100, Math.round(mathVal * 0.75))
      );
      const isUn = calcProgress >= 30;
      return { ...b, unlocked: isUn, progress: Math.min(100, Math.round((calcProgress / 30) * 100)) };
    }
    if (b.id === 'streak-30') {
      const isUn = streak >= 30;
      return { ...b, unlocked: isUn, progress: Math.min(100, Math.round((streak / 30) * 100)) };
    }
    return { ...b, unlocked: false };
  });

  const unlockedBadgeCount = dynamicBadges.filter((b) => b.unlocked).length;

  const defaultStarterActivity = [
    {
      id: 1,
      icon: '✦',
      iconBg: '#eee8fb',
      iconColor: '#6f56b0',
      title: t('auth.account_created'),
      topic: t('auth.welcome'),
      time: t('overview.today'),
      xp: '+0 XP',
      badge: 'Getting Started'
    }
  ];

  const activities = user?.recentActivity?.length ? user.recentActivity : (isDemo ? RECENT_ACTIVITIES : defaultStarterActivity);

  const heatmapData = getTrailing28Days(user?.dailyActivity || {}, isDemo, currentXP, focusMinutes);
  const trailing7Days = getTrailing7Days(user?.dailyActivity || {}, isDemo, focusMinutes, streak);

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name,
      initials: name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      bio,
      dailyGoal,
      favoriteTopic,
      avatarBg,
      avatarColor
    };
    setUser(updatedUser);
    setEditOpen(false);
    onToast?.(t('profile.toast_updated'));
  };

  const handleExport = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Name', user?.name || name],
      ['Email', user?.email || ''],
      ['Account Profile', user?.accountId === '2' ? 'Learner 2' : 'Learner 1'],
      ['Level', level],
      ['Total XP', currentXP],
      ['Active Streak (Days)', streak],
      ['Chapters Completed', chaptersCount],
      ['Problems Solved', problemsCount],
      ['Accuracy Rate', `${accuracyRate}%`],
      ['Total Focus Time', focusTimeDisplay],
      ['Daily Goal Target (XP)', dailyGoal],
      ['Favorite Subject', favoriteTopic],
      ['Bio', `"${bio}"`],
      ['Mathematics Mastery', `${mathVal}%`],
      ['Physics Mastery', `${physicsVal}%`],
      ['Computer Science Mastery', `${csVal}%`],
      ['Chemistry Mastery', `${chemistryVal}%`],
      ['Achievements Unlocked', `${unlockedBadgeCount} of ${dynamicBadges.length}`]
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tutormind-profile-${(user?.name || 'learner').toLowerCase().replace(/\s+/g, '-')}-account-${user?.accountId || '1'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onToast?.('Comprehensive progress report downloaded.');
  };

  const handleShare = () => {
    setShareOpen(true);
  };

  const filteredBadges = dynamicBadges.filter((b) => {
    if (badgeFilter === 'all') return true;
    if (badgeFilter === 'unlocked') return b.unlocked;
    if (badgeFilter === 'locked') return !b.unlocked;
    return b.category === badgeFilter;
  });

  const getHeatmapColor = (level, isToday) => {
    if (isToday) return '#ec735e';
    switch (level) {
      case 1:
        return '#fae8e2';
      case 2:
        return '#f4c3b5';
      case 3:
        return '#ea8e79';
      case 4:
        return '#ec735e';
      default:
        return '#efede6';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {/* Top Header Row */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ md: 'flex-end' }}
        gap={2}
        mb={3.5}
      >
        <Box>
          <Eyebrow>{t('profile.eyebrow')}</Eyebrow>
          <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 800 }}>
            {user?.name || name}
          </Typography>
          <Typography color="text.secondary" fontSize={13} mt={0.3}>
            {t('profile.subtitle')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Share fontSize="small" />}
            onClick={handleShare}
            sx={{ borderColor: '#e6e2d9', color: '#20211f', '&:hover': { borderColor: '#20211f' } }}
          >
            Share
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download fontSize="small" />}
            onClick={handleExport}
            sx={{ borderColor: '#e6e2d9', color: '#20211f', '&:hover': { borderColor: '#20211f' } }}
          >
            {t('profile.export_csv')}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<EditNote fontSize="small" />}
            onClick={() => setEditOpen(true)}
            sx={{ bgcolor: '#ec735e', '&:hover': { bgcolor: '#d95f4c' } }}
          >
            {t('profile.edit_profile')}
          </Button>
        </Stack>
      </Stack>

      {/* Hero Banner Card */}
      <Paper
        sx={{
          mb: 2.5,
          p: 0,
          overflow: 'hidden',
          borderRadius: 2.5,
          border: '1px solid #e6e2d9',
          background: 'linear-gradient(125deg, #1f201e 0%, #2f302d 60%, #3e322b 100%)',
          color: '#fffdf8',
          boxShadow: '0 15px 35px rgba(32,33,31,.12)',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -30,
            top: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,115,94,0.18) 0%, rgba(246,200,87,0.04) 70%, transparent 100%)',
            pointerEvents: 'none'
          }}
        />

        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 2.5, md: 3.5 }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            {/* Avatar & User Info */}
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: { xs: 72, sm: 84 },
                    height: { xs: 72, sm: 84 },
                    bgcolor: avatarBg,
                    color: avatarColor,
                    fontSize: { xs: 24, sm: 28 },
                    fontWeight: 800,
                    border: '3px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                  }}
                >
                  {user?.initials || name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </Avatar>
                <Tooltip title="Tier II Scholar">
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      bgcolor: '#f6c857',
                      color: '#20211f',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 13,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      border: '2px solid #20211f'
                    }}
                  >
                    ✦
                  </Box>
                </Tooltip>
              </Box>

              <Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="h4" sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800 }}>
                    {user?.name || name}
                  </Typography>
                  <Chip
                    label={`LEVEL ${level}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(246,200,87,0.18)',
                      color: '#f6c857',
                      fontWeight: 800,
                      fontSize: 10,
                      border: '1px solid rgba(246,200,87,0.4)',
                      height: 22
                    }}
                  />
                </Stack>
                <Typography fontSize={12} sx={{ opacity: 0.7, mt: 0.2 }}>
                  {user?.email || ''} · Member
                </Typography>
                <Typography
                  fontSize={12}
                  sx={{
                    opacity: 0.9,
                    mt: 1,
                    fontStyle: 'italic',
                    color: '#e8e4db',
                    maxWidth: 480
                  }}
                >
                  “{bio}”
                </Typography>
              </Box>
            </Stack>

            {/* Level XP Progress Card */}
            <Paper
              sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 2,
                minWidth: { xs: '100%', sm: 240 },
                backdropFilter: 'blur(8px)'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontSize={10} sx={{ fontFamily: 'DM Mono, monospace', letterSpacing: 1, color: '#d0cec7' }}>
                  LEVEL PROGRESS
                </Typography>
                <Typography fontSize={12} fontWeight={800} sx={{ color: '#f6c857' }}>
                  {levelProgress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={levelProgress}
                sx={{
                  mt: 1.2,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.12)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#f6c857',
                    borderRadius: 4
                  }
                }}
              />
              <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography fontSize={10} sx={{ opacity: 0.65 }}>
                  {user?.xp || 1240} total XP
                </Typography>
                <Typography fontSize={10} sx={{ color: '#ec735e', fontWeight: 700 }}>
                  {t('profile.xp_to_level', { xp: xpNeeded, level: level + 1 })}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Paper>

      {/* 4 Key Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2.5 }}>
        {/* Streak Card */}
        <Panel>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocalFireDepartment sx={{ color: '#ec735e', fontSize: 20 }} />
            <Eyebrow>{t('profile.consistency')}</Eyebrow>
          </Stack>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
            {streak} <span style={{ fontSize: 15, fontWeight: 500 }}>{t('profile.days')}</span>
          </Typography>
          <Typography fontSize={11} color="text.secondary" mt={0.4}>
            {streak > 0 ? t('profile.active_streak', { streak }) : t('profile.start_streak')}
          </Typography>
          <Stack direction="row" spacing={0.6} mt={1.5}>
            {trailing7Days.map((d, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  py: 0.4,
                  borderRadius: 1,
                  bgcolor: d.isToday && d.active ? '#ec735e' : d.active ? '#fae8e2' : '#efede6',
                  color: d.isToday && d.active ? '#ffffff' : d.active ? '#ec735e' : '#9b9991',
                  fontSize: 9,
                  fontWeight: 800
                }}
              >
                {d.letter}
              </Box>
            ))}
          </Stack>
        </Panel>

        {/* Lessons Completed */}
        <Panel>
          <Stack direction="row" spacing={1} alignItems="center">
            <School sx={{ color: '#5e62d6', fontSize: 20 }} />
            <Eyebrow>{t('profile.chapters_done')}</Eyebrow>
          </Stack>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
            {chaptersCount} <span style={{ fontSize: 15, fontWeight: 500 }}>{t('profile.units')}</span>
          </Typography>
          <Typography fontSize={11} color="text.secondary" mt={0.4}>
            {t('profile.across_subjects')}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} mt={1.8}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.round((chaptersCount / 25) * 100))}
              sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: '#efede6', '& .MuiLinearProgress-bar': { bgcolor: '#5e62d6' } }}
            />
            <Typography fontSize={10} fontWeight={700} color="#5e62d6">
              {Math.min(100, Math.round((chaptersCount / 25) * 100))}%
            </Typography>
          </Stack>
        </Panel>

        {/* Study Focus Time */}
        <Panel>
          <Stack direction="row" spacing={1} alignItems="center">
            <Timeline sx={{ color: '#84b98a', fontSize: 20 }} />
            <Eyebrow>{t('profile.focus_time')}</Eyebrow>
          </Stack>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
            {focusTimeDisplay}
          </Typography>
          <Typography fontSize={11} color="text.secondary" mt={0.4}>
            {focusMinutes > 0 ? t('profile.avg_min_day', { min: Math.round(focusMinutes / Math.max(1, streak)) }) : t('profile.no_study_logged')}
          </Typography>
          <Typography fontSize={10} sx={{ color: focusMinutes > 0 ? '#5e9b69' : 'text.secondary', fontWeight: 700, mt: 1.8 }}>
            {focusMinutes > 0 ? t('profile.momentum_building') : t('profile.ready_start_lesson')}
          </Typography>
        </Panel>

        {/* Problem Accuracy */}
        <Panel>
          <Stack direction="row" spacing={1} alignItems="center">
            <WorkspacePremium sx={{ color: '#f6c857', fontSize: 20 }} />
            <Eyebrow>{t('profile.quiz_accuracy')}</Eyebrow>
          </Stack>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
            {accuracyRate}%
          </Typography>
          <Typography fontSize={11} color="text.secondary" mt={0.4}>
            {t('profile.problems_solved', { count: problemsCount })}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} mt={1.8}>
            <Chip
              label={problemsCount > 0 ? t('profile.active_learner') : t('profile.start_first_quiz')}
              size="small"
              sx={{ bgcolor: '#fff3dc', color: '#9b7621', fontSize: 9, fontWeight: 700, height: 20 }}
            />
          </Stack>
        </Panel>
      </Box>

      {/* 30-Day Activity Heatmap Grid */}
      <Panel sx={{ mb: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={2} gap={1}>
          <Box>
            <Eyebrow>{t('profile.learning_rhythm')}</Eyebrow>
            <Typography variant="h5" fontSize={18} fontWeight={800}>
              {t('profile.heatmap_title')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontSize={10} color="text.secondary">
              {t('profile.less')}
            </Typography>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <Box
                key={lvl}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '2px',
                  bgcolor: lvl === 0 ? '#efede6' : getHeatmapColor(lvl, false)
                }}
              />
            ))}
            <Typography fontSize={10} color="text.secondary">
              {t('profile.more')}
            </Typography>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
            p: 1.5,
            bgcolor: '#fbf9f4',
            borderRadius: 2,
            border: '1px solid #f0ece1'
          }}
        >
          {heatmapData.map((item, idx) => (
            <Tooltip
              key={idx}
              arrow
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography fontSize={11} fontWeight={700}>
                    {item.date} {item.isToday ? '(Today)' : ''}
                  </Typography>
                  <Typography fontSize={10}>{item.mins} mins practiced</Typography>
                  <Typography fontSize={10} color="#f6c857">
                    +{item.xp} XP earned
                  </Typography>
                </Box>
              }
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 0.8, sm: 1.2 },
                  textAlign: 'center',
                  bgcolor: getHeatmapColor(item.level, item.isToday),
                  color: item.level >= 3 || item.isToday ? '#ffffff' : '#20211f',
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  border: item.isToday ? '2px solid #20211f' : '1px solid rgba(0,0,0,0.04)',
                  transition: 'all .2s',
                  '&:hover': {
                    transform: 'scale(1.08)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Typography fontSize={9} fontWeight={800} sx={{ opacity: 0.8 }}>
                  {item.day}
                </Typography>
                <Typography fontSize={11} fontWeight={800}>
                  {item.mins}m
                </Typography>
              </Paper>
            </Tooltip>
          ))}
        </Box>
      </Panel>

      {/* 2x2 Portfolio Grid: Topic Mastery, Achievements, Activity Timeline, Goals */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' }, gap: 2.5, mb: 2.5 }}>
        {/* 1. Subject Mastery / Learning Fingerprint */}
        <Panel>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Eyebrow>{t('profile.subject_mastery')}</Eyebrow>
              <Typography variant="h5" fontSize={18} fontWeight={800}>
                {t('profile.core_domains')}
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setPage?.('learn')}
              sx={{ color: '#ec735e', fontWeight: 700, fontSize: 11 }}
            >
              {t('learn.library')} →
            </Button>
          </Stack>

          <Stack spacing={2}>
            {topicsData.map((topic) => (
              <Box
                key={topic.name}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#fcfaf5',
                  border: '1px solid #f0ece1',
                  transition: 'border-color .2s',
                  '&:hover': { borderColor: topic.color }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: topic.color }} />
                    <Typography fontSize={13} fontWeight={800}>
                      {topic.name}
                    </Typography>
                    <Chip
                      label={topic.status}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 9,
                        bgcolor: topic.value > 50 ? '#fae8e2' : '#f1ede7',
                        color: topic.value > 50 ? '#ec735e' : '#777873'
                      }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography fontSize={12} fontWeight={800}>
                      {topic.value}%
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setPage?.('learn')}
                      sx={{ fontSize: 10, py: 0, px: 0.8, color: '#ec735e', minWidth: 'auto' }}
                    >
                      {t('overview.start_learning')}
                    </Button>
                  </Stack>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={topic.value}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#efede6',
                    '& .MuiLinearProgress-bar': { bgcolor: topic.color, borderRadius: 3 }
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Panel>

        {/* 2. Achievement Showcase / Trophy Case */}
        <Panel>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Box>
              <Eyebrow>{t('profile.tab_achievements')}</Eyebrow>
              <Typography variant="h5" fontSize={18} fontWeight={800}>
                {t('profile.tab_achievements')}
              </Typography>
            </Box>
            <Chip
              icon={<EmojiEvents sx={{ fontSize: 14, color: '#f6c857 !important' }} />}
              label={`${unlockedBadgeCount} / ${dynamicBadges.length} ${t('profile.unlocked')}`}
              size="small"
              sx={{ bgcolor: '#fff3dc', color: '#9b7621', fontWeight: 700, fontSize: 10 }}
            />
          </Stack>

          {/* Filter Tabs */}
          <Tabs
            value={badgeFilter}
            onChange={(_, val) => setBadgeFilter(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 32,
              mb: 2,
              '& .MuiTab-root': {
                minHeight: 32,
                fontSize: 10,
                py: 0.5,
                px: 1.2,
                textTransform: 'none',
                fontWeight: 700,
                color: '#9b9991',
                '&.Mui-selected': { color: '#ec735e' }
              },
              '& .MuiTabs-indicator': { bgcolor: '#ec735e' }
            }}
          >
            <Tab label={t('profile.filter_all')} value="all" />
            <Tab label={t('profile.filter_unlocked')} value="unlocked" />
            <Tab label={t('profile.filter_locked')} value="locked" />
          </Tabs>

          {/* Badge Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.2 }}>
            {filteredBadges.map((badge) => (
              <Paper
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderRadius: 2,
                  bgcolor: badge.unlocked ? '#fff8eb' : '#f5f3ec',
                  border: badge.unlocked ? `1px solid ${badge.tierColor}` : '1px dashed #d6d3ca',
                  opacity: badge.unlocked ? 1 : 0.65,
                  transition: 'all .2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 18px rgba(44,39,27,.08)'
                  }
                }}
              >
                <Box sx={{ fontSize: 24, mb: 0.5 }}>{badge.icon}</Box>
                <Typography fontSize={11} fontWeight={800} noWrap>
                  {badge.title}
                </Typography>
                <Typography fontSize={9} color="text.secondary" noWrap>
                  {badge.unlocked ? t('profile.unlocked') : `${t('profile.locked')} (${badge.progress || 0}%)`}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Panel>

        {/* 3. Recent Activity Feed */}
        <Panel>
          <Eyebrow>{t('profile.milestone_history')}</Eyebrow>
          <Typography variant="h5" fontSize={18} fontWeight={800} mb={2}>
            {t('profile.milestone_sub')}
          </Typography>
          <Stack spacing={1.5}>
            {activities.map((act) => (
              <Paper
                key={act.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: '#fbf9f5',
                  border: '1px solid #f0ece1',
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: act.iconBg,
                      color: act.iconColor,
                      fontSize: 14,
                      fontWeight: 800
                    }}
                  >
                    {act.icon}
                  </Avatar>
                  <Box>
                    <Typography fontSize={12} fontWeight={700}>
                      {act.title}
                    </Typography>
                    <Typography fontSize={10} color="text.secondary">
                      {act.topic} · {act.time}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={act.badge}
                    size="small"
                    sx={{ height: 20, fontSize: 9, bgcolor: '#fff', border: '1px solid #e6e2d9', fontWeight: 700 }}
                  />
                  <Typography fontSize={11} fontWeight={800} color="#ec735e">
                    {act.xp}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Panel>

        {/* 4. Daily Goal & Preferences Summary */}
        <Panel>
          <Eyebrow>{t('profile.daily_goal')}</Eyebrow>
          <Typography variant="h5" fontSize={18} fontWeight={800} mb={1}>
            {t('profile.learning_preferences')}
          </Typography>
          <Typography fontSize={12} color="text.secondary" mb={2.5}>
            {t('profile.preferences_sub')}
          </Typography>

          <Paper sx={{ p: 2, bgcolor: '#fff8f5', border: '1px solid #fae1da', borderRadius: 2, mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontSize={11} fontWeight={700} color="#ec735e">
                {t('profile.daily_goal')}: {dailyGoal} XP / {t('profile.days')}
              </Typography>
              <CheckCircle sx={{ color: '#2e7d32', fontSize: 18 }} />
            </Stack>
            <LinearProgress
              variant="determinate"
              value={100}
              sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: '#f4c3b5', '& .MuiLinearProgress-bar': { bgcolor: '#ec735e' } }}
            />
          </Paper>

          <Stack direction="row" justifyContent="space-between" alignItems="center" pt={1}>
            <Box>
              <Typography fontSize={11} fontWeight={700}>
                {t('profile.favorite_subject')}
              </Typography>
              <Typography fontSize={10} color="text.secondary">
                {t('topics.' + favoriteTopic) || favoriteTopic}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setEditOpen(true)}
              sx={{ fontSize: 10, borderColor: '#e6e2d9', color: '#20211f' }}
            >
              {t('profile.edit_profile')}
            </Button>
          </Stack>
        </Panel>
      </Box>

      {/* Badge Details Dialog */}
      <Dialog
        open={Boolean(selectedBadge)}
        onClose={() => setSelectedBadge(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            bgcolor: '#fffdf8',
            border: '1px solid #e6e2d9'
          }
        }}
      >
        {selectedBadge && (
          <>
            <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Eyebrow>{t('profile.tab_achievements').toUpperCase()}</Eyebrow>
              <IconButton size="small" onClick={() => setSelectedBadge(null)}>
                <Close fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', pt: 2 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: selectedBadge.unlocked ? '#fff3dc' : '#f1ede7',
                  border: `2px solid ${selectedBadge.tierColor}`,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 34,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
                }}
              >
                {selectedBadge.icon}
              </Box>
              <Typography variant="h5" fontWeight={800}>
                {selectedBadge.title}
              </Typography>
              <Chip
                label={`${selectedBadge.tier} · +${selectedBadge.xpReward} XP`}
                size="small"
                sx={{
                  mt: 1,
                  mb: 2,
                  bgcolor: selectedBadge.unlocked ? '#fae8e2' : '#f1ede7',
                  color: selectedBadge.unlocked ? '#ec735e' : '#777873',
                  fontWeight: 700,
                  fontSize: 10
                }}
              />
              <Typography fontSize={13} color="text.secondary" lineHeight={1.6}>
                {selectedBadge.desc}
              </Typography>

              <Divider sx={{ my: 2.5, borderColor: '#f0ece1' }} />

              <Stack direction="row" justifyContent="space-between">
                <Box textAlign="left">
                  <Typography fontSize={10} color="text.secondary">
                    STATUS
                  </Typography>
                  <Typography fontSize={11} fontWeight={700} color={selectedBadge.unlocked ? '#2e7d32' : 'text.secondary'}>
                    {selectedBadge.unlocked ? t('profile.unlocked') : t('profile.status_in_progress')}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography fontSize={10} color="text.secondary">
                    RARITY
                  </Typography>
                  <Typography fontSize={11} fontWeight={700} color="#ec735e">
                    {selectedBadge.rarity}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button fullWidth variant="contained" onClick={() => setSelectedBadge(null)} sx={{ bgcolor: '#20211f', color: '#fff' }}>
                {t('common.close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1.5,
            bgcolor: '#fffdf8',
            border: '1px solid #e6e2d9'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Eyebrow>{t('profile.learning_preferences').toUpperCase()}</Eyebrow>
            <Typography variant="h5" fontWeight={800}>
              {t('profile.modal_edit_title')}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setEditOpen(false)}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            {/* Avatar Color Picker */}
            <Box>
              <Typography fontSize={11} fontWeight={700} mb={1}>
                {t('profile.avatar_theme')}
              </Typography>
              <Stack direction="row" spacing={1.2}>
                {AVATAR_PALETTES.map((pal) => (
                  <Tooltip key={pal.name} title={pal.name}>
                    <IconButton
                      onClick={() => {
                        setAvatarBg(pal.bg);
                        setAvatarColor(pal.color);
                      }}
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: pal.bg,
                        color: pal.color,
                        border: avatarBg === pal.bg ? '3px solid #20211f' : '2px solid transparent',
                        '&:hover': { bgcolor: pal.bg }
                      }}
                    >
                      {avatarBg === pal.bg ? '✓' : ''}
                    </IconButton>
                  </Tooltip>
                ))}
              </Stack>
            </Box>

            <TextField
              label={t('profile.display_name')}
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              label={t('profile.bio')}
              fullWidth
              multiline
              rows={2}
              size="small"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography fontSize={11} fontWeight={700} mb={0.6}>
                  {t('profile.target_xp')}
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                >
                  <MenuItem value={30}>Casual (30 XP / ~10 min)</MenuItem>
                  <MenuItem value={50}>Regular (50 XP / ~15 min)</MenuItem>
                  <MenuItem value={100}>Serious (100 XP / ~30 min)</MenuItem>
                  <MenuItem value={150}>Intense (150 XP / ~45 min)</MenuItem>
                </Select>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography fontSize={11} fontWeight={700} mb={0.6}>
                  {t('profile.favorite_topic')}
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={favoriteTopic}
                  onChange={(e) => setFavoriteTopic(e.target.value)}
                >
                  <MenuItem value="Mathematics">{t('topics.Mathematics') || 'Mathematics'}</MenuItem>
                  <MenuItem value="Physics">{t('topics.Physics') || 'Physics'}</MenuItem>
                  <MenuItem value="Computer Science">{t('topics.Computer Science') || 'Computer Science'}</MenuItem>
                  <MenuItem value="Chemistry">{t('topics.Chemistry') || 'Chemistry'}</MenuItem>
                </Select>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#777873' }}>
            {t('profile.modal_cancel')}
          </Button>
          <Button variant="contained" onClick={handleSaveProfile} sx={{ bgcolor: '#ec735e', '&:hover': { bgcolor: '#d95f4c' } }}>
            {t('profile.modal_save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Profile & Achievement Modal */}
      <ShareProfileModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        onToast={onToast}
        profileData={{
          name: user?.name || name,
          level,
          currentXP,
          streak,
          chaptersCount,
          accuracyRate,
          focusTimeDisplay,
          unlockedBadgeCount,
          totalBadges: dynamicBadges.length,
          mathVal,
          physicsVal,
          csVal,
          chemistryVal,
          avatarBg,
          avatarColor,
          favoriteTopic
        }}
      />
    </motion.div>
  );
}

