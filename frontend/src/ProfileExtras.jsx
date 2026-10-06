import React from 'react';
import { Avatar, Box, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';

export default function ProfileExtras({ user }) {
  const xp = user?.xp ?? 0;
  const nextLevel = (Math.floor(xp / 100) + 1) * 100;
  const levelProgress = Math.min(100, xp % 100);
  const completedChapters = user?.completedChapters ?? (user?.completedChapterIds?.length ?? 0);
  const weeklyGoal = 6;
  const weeklyProgress = Math.min(100, Math.round((completedChapters / weeklyGoal) * 100));

  const mathVal = user?.topicProgress?.Mathematics ?? (
    user?.topicProgress?.Algebra !== undefined
      ? Math.round(((user.topicProgress.Algebra || 0) + (user.topicProgress.Geometry || 0) + (user.topicProgress.Calculus || 0) + (user.topicProgress.Statistics || 0) + (user.topicProgress.Arithmetic || 0)) / 5)
      : 0
  );

  const milestones = [
    ['Mathematics', mathVal, '#ec735e'],
    ['Physics', user?.topicProgress?.Physics ?? 0, '#4f46e5'],
    ['Computer Science', user?.topicProgress?.['Computer Science'] ?? 0, '#0d9488'],
    ['Chemistry', user?.topicProgress?.Chemistry ?? 0, '#e11d48']
  ];

  const recentList = user?.recentActivity?.length
    ? user.recentActivity.slice(0, 3)
    : [
        { title: 'Welcome to TutorMind', time: 'Today', xp: '+0 XP' }
      ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr .8fr' }, gap: 2, mt: 2 }}>
      <Paper sx={{ p: 2.5, border: '1px solid #e6e2d9', bgcolor: '#20211f', color: '#fffdf8' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography fontSize={10} sx={{ opacity: 0.6, letterSpacing: 1 }}>
              LEVEL PROGRESS
            </Typography>
            <Typography variant="h5" fontSize={18} mt={0.5}>
              Level {Math.floor(xp / 100) + 1} learner
            </Typography>
          </Box>
          <Chip label={`${nextLevel - xp} XP to go`} size="small" sx={{ bgcolor: '#343532', color: '#f6c857', fontSize: 10 }} />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={levelProgress}
          sx={{ mt: 3, height: 7, borderRadius: 4, bgcolor: '#3b3c39', '& .MuiLinearProgress-bar': { bgcolor: '#f6c857' } }}
        />
        <Stack direction="row" justifyContent="space-between" mt={1}>
          <Typography fontSize={9} sx={{ opacity: 0.6 }}>
            {xp % 100} XP earned
          </Typography>
          <Typography fontSize={9} sx={{ opacity: 0.6 }}>
            {nextLevel} XP target
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5, border: '1px solid #e6e2d9', bgcolor: '#fff8f5' }}>
        <Typography fontSize={10} color="text.secondary" letterSpacing={1}>
          WEEKLY CHAPTER GOAL
        </Typography>
        <Typography variant="h5" fontSize={18} mt={0.5}>
          {completedChapters} of {weeklyGoal} chapters
        </Typography>
        <Typography fontSize={10} color="text.secondary" mt={1}>
          {completedChapters >= weeklyGoal ? 'Goal completed! Fantastic work this week.' : `${weeklyGoal - completedChapters} more chapters unlock your weekly milestone.`}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={weeklyProgress}
          sx={{ mt: 2, height: 6, bgcolor: '#f2e1da', '& .MuiLinearProgress-bar': { bgcolor: '#ec735e' } }}
        />
      </Paper>

      <Paper sx={{ p: 2.5, border: '1px solid #e6e2d9', bgcolor: '#fffdf8' }}>
        <Typography fontSize={10} color="text.secondary" letterSpacing={1}>
          TOPIC MASTERY
        </Typography>
        <Typography variant="h5" fontSize={18} mt={0.5} mb={2}>
          Your next frontiers
        </Typography>
        {milestones.map(([name, value, color]) => (
          <Box key={name} mb={1.7}>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontSize={11}>{name}</Typography>
              <Typography fontSize={10} color="text.secondary">
                {value}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{ mt: 0.5, height: 5, bgcolor: '#efede6', '& .MuiLinearProgress-bar': { bgcolor: color } }}
            />
          </Box>
        ))}
      </Paper>

      <Paper sx={{ p: 2.5, border: '1px solid #e6e2d9', bgcolor: '#fffdf8' }}>
        <Typography fontSize={10} color="text.secondary" letterSpacing={1}>
          RECENT ACTIVITY
        </Typography>
        <Typography variant="h5" fontSize={18} mt={0.5}>
          Your learning rhythm
        </Typography>
        {recentList.map((item, idx) => (
          <Stack direction="row" spacing={1.2} alignItems="center" key={item.id || idx} mt={2}>
            <Avatar sx={{ width: 27, height: 27, bgcolor: item.iconBg || '#fbedb5', color: item.iconColor || '#9b7621', fontSize: 12 }}>
              {item.icon || '✦'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontSize={10} fontWeight={700} noWrap>
                {item.title}
              </Typography>
              <Typography fontSize={9} color="text.secondary">
                {item.time || item.date || 'Today'}
              </Typography>
            </Box>
            <Typography fontSize={9} color="primary" fontWeight={700}>
              {item.xp || item.badge || '+0 XP'}
            </Typography>
          </Stack>
        ))}
      </Paper>
    </Box>
  );
}
