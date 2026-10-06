import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip
} from '@mui/material';
import {
  Videocam,
  AccessTime,
  School,
  NotificationsActive,
  Send,
  HelpOutline,
  CheckCircle,
  Psychology
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function TeacherOfficeHoursBar({
  officeHours,
  studentUser,
  onCallTeacher,
  onSendPing
}) {
  const [pingOpen, setPingOpen] = useState(false);
  const [pingTopic, setPingTopic] = useState('Mathematics');
  const [pingNote, setPingNote] = useState('');
  const [pingSent, setPingSent] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);

  const {
    isLive = true,
    status = 'available',
    schedule = 'Monday – Friday · 3:00 PM – 5:30 PM',
    todayActiveWindow = '3:00 PM – 5:30 PM',
    focusSubject = 'All STEM Subjects (Math, Physics, CS & Chemistry)',
    message = 'Live Office Hours are OPEN! Click below to start an interactive 1-on-1 video call.',
    teacherName = 'Prof. Sarah Jenkins'
  } = officeHours || {};

  const handlePingSubmit = async (e) => {
    e?.preventDefault();
    if (pingLoading) return;
    setPingLoading(true);
    try {
      if (onSendPing) {
        await onSendPing({
          studentName: studentUser?.name || 'Student',
          studentEmail: studentUser?.email || '',
          topic: pingTopic,
          note: pingNote
        });
      }
      setPingSent(true);
      setTimeout(() => {
        setPingSent(false);
        setPingOpen(false);
        setPingNote('');
      }, 2000);
    } catch {
      // ignore
    } finally {
      setPingLoading(false);
    }
  };

  const isFreeNow = isLive && status !== 'busy';

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3.5,
          background: isFreeNow
            ? 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)'
            : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: '#ffffff',
          boxShadow: isFreeNow
            ? '0 10px 30px rgba(5, 150, 105, 0.25)'
            : '0 8px 24px rgba(30, 41, 59, 0.15)',
          border: isFreeNow ? '1.5px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle Decorative Ambient Orb */}
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: isFreeNow
              ? 'radial-gradient(circle, rgba(52,211,153,0.3) 0%, rgba(5,150,105,0) 70%)'
              : 'radial-gradient(circle, rgba(148,163,184,0.15) 0%, rgba(30,41,59,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          position="relative"
          zIndex={1}
        >
          {/* Left: Instructor Avatar & Live Pill */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 54,
                  height: 54,
                  bgcolor: isFreeNow ? '#10b981' : '#475569',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 20,
                  border: '2.5px solid #ffffff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}
              >
                SJ
              </Avatar>
              {isFreeNow && (
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.9, 0.3, 0.9] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: '#34d399',
                    border: '2px solid #ffffff'
                  }}
                />
              )}
            </Box>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
                <Chip
                  size="small"
                  label={isFreeNow ? 'LIVE OFFICE HOURS · FREE FOR CALLS' : 'OFFICE HOURS · CURRENTLY AWAY'}
                  sx={{
                    bgcolor: isFreeNow ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.12)',
                    color: isFreeNow ? '#a7f3d0' : '#cbd5e1',
                    border: isFreeNow ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                    fontWeight: 800,
                    fontSize: 10,
                    letterSpacing: 0.8,
                    fontFamily: 'DM Mono, monospace'
                  }}
                />
                <Typography variant="caption" sx={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime sx={{ fontSize: 13, color: '#93c5fd' }} />
                  {schedule}
                </Typography>
              </Stack>

              <Typography variant="h6" fontWeight={900} sx={{ color: '#ffffff', fontSize: { xs: 16, sm: 18 }, mt: 0.5 }}>
                {teacherName} · 1-on-1 Virtual Office
              </Typography>

              <Typography variant="body2" sx={{ color: isFreeNow ? '#d1fae5' : '#94a3b8', fontSize: 12.5, mt: 0.2, maxWidth: 620 }}>
                {isFreeNow ? message : `Instructor is not in live call hours right now. Office hours window is ${todayActiveWindow}. You can leave a call request below.`}
              </Typography>
            </Box>
          </Stack>

          {/* Right: Primary Call or Ping Trigger */}
          <Stack direction="row" spacing={1.5} alignItems="center" width={{ xs: '100%', sm: 'auto' }}>
            {isFreeNow ? (
              <Button
                variant="contained"
                size="large"
                fullWidth={false}
                startIcon={<Videocam sx={{ fontSize: 22 }} />}
                onClick={onCallTeacher}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#065f46',
                  fontWeight: 900,
                  fontSize: 14,
                  px: 3,
                  py: 1.2,
                  borderRadius: 3,
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: '#f0fdf4',
                    boxShadow: '0 10px 28px rgba(0,0,0,0.28)'
                  }
                }}
              >
                Video Call Teacher Now
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                startIcon={<NotificationsActive sx={{ fontSize: 20 }} />}
                onClick={() => setPingOpen(true)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 13.5,
                  px: 2.5,
                  py: 1.2,
                  borderRadius: 3,
                  textTransform: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.25)'
                  }
                }}
              >
                Request Call / Leave Ping
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Ping / Request Office Hours Meeting Dialog */}
      <Dialog
        open={pingOpen}
        onClose={() => setPingOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            p: 1.5,
            bgcolor: '#ffffff',
            border: '1px solid #ded9cd'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#20211f' }}>
          Request 1-on-1 Virtual Office Meeting
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Prof. Sarah Jenkins will receive a high-priority alert and can invite you to a video call during the upcoming active window ({todayActiveWindow}).
          </Typography>

          {pingSent ? (
            <Box sx={{ p: 3, bgcolor: '#f0fdf4', borderRadius: 2, textAlign: 'center', border: '1px solid #86efac' }}>
              <CheckCircle sx={{ fontSize: 44, color: '#16a34a', mb: 1 }} />
              <Typography fontWeight={800} color="#166534">
                Call Request Dispatched!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                The instructor has been alerted on their executive hub.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} mt={1}>
              <TextField
                select
                label="Topic / Subject"
                value={pingTopic}
                onChange={(e) => setPingTopic(e.target.value)}
                SelectProps={{ native: true }}
                size="small"
                fullWidth
              >
                <option value="Mathematics">Mathematics (Calculus / Algebra / Geometry)</option>
                <option value="Physics">Physics (Kinematics / Forces / Energy)</option>
                <option value="Computer Science">Computer Science (Algorithms / Data Structures)</option>
                <option value="Chemistry">Chemistry (Stoichiometry / Bonding)</option>
                <option value="Quiz Review">Quiz Review / Problem Help</option>
              </TextField>

              <TextField
                label="Questions or specific problem details"
                placeholder="e.g. I need help understanding the integration by parts formula in Chapter 04..."
                multiline
                rows={3}
                value={pingNote}
                onChange={(e) => setPingNote(e.target.value)}
                fullWidth
                size="small"
              />
            </Stack>
          )}
        </DialogContent>
        {!pingSent && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPingOpen(false)} sx={{ color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handlePingSubmit}
              disabled={pingLoading}
              sx={{
                bgcolor: '#10b981',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              Submit Request
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}
