import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Avatar,
  Stack,
  Button,
  Chip,
  IconButton
} from '@mui/material';
import {
  Videocam,
  Call,
  CallEnd,
  VolumeUp,
  School,
  Close
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Play a pleasant synthesizer incoming ringtone using the Web Audio API
const playRingtone = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    const ctx = new AudioContext();

    let stopped = false;
    const playChimeNote = (freq, time, duration = 0.25) => {
      if (stopped) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration);
    };

    const interval = setInterval(() => {
      if (stopped || ctx.state === 'closed') return;
      const now = ctx.currentTime;
      playChimeNote(523.25, now); // C5
      playChimeNote(659.25, now + 0.15); // E5
      playChimeNote(783.99, now + 0.3); // G5
      playChimeNote(1046.50, now + 0.45, 0.4); // C6
    }, 2400);

    return () => {
      stopped = true;
      clearInterval(interval);
      try { ctx.close(); } catch {}
    };
  } catch {
    return null;
  }
};

export default function IncomingCallDialog({
  open,
  call,
  currentRole = 'student',
  onAccept,
  onDecline
}) {
  useEffect(() => {
    if (!open) return;
    const stopAudio = playRingtone();
    return () => {
      if (stopAudio) stopAudio();
    };
  }, [open]);

  if (!call) return null;

  const peer = currentRole === 'teacher' ? call.caller : call.caller;
  const peerName = peer?.name || (currentRole === 'teacher' ? 'Student' : 'Prof. Sarah Jenkins');
  const peerRole = currentRole === 'teacher' ? 'Student' : 'Lead STEM Instructor';

  const isHosted = Boolean(call.isHostedMeeting || (call.caller?.role === 'teacher' && (!call.callee?.id || !call.callee?.email)));

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          bgcolor: '#18191b',
          color: '#ffffff',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          position: 'relative'
        }
      }}
    >
      <DialogContent sx={{ p: 2, textAlign: 'center' }}>
        {/* Close icon (Decline shortcut) */}
        <IconButton
          onClick={onDecline}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12, color: '#94a3b8' }}
        >
          <Close fontSize="small" />
        </IconButton>

        {/* Pulse Radar Rings */}
        <Box sx={{ position: 'relative', display: 'inline-block', my: 2 }}>
          <motion.div
            animate={{ scale: [1, 1.45, 1.7], opacity: [0.7, 0.3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: -12,
              left: -12,
              right: -12,
              bottom: -12,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              zIndex: 0
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1.45], opacity: [0.8, 0.4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.5 }}
            style={{
              position: 'absolute',
              top: -6,
              left: -6,
              right: -6,
              bottom: -6,
              borderRadius: '50%',
              backgroundColor: '#34d399',
              zIndex: 0
            }}
          />
          <Avatar
            sx={{
              width: 88,
              height: 88,
              bgcolor: '#ec735e',
              color: '#ffffff',
              fontSize: 32,
              fontWeight: 900,
              boxShadow: '0 8px 24px rgba(236,115,94,0.4)',
              position: 'relative',
              zIndex: 1,
              border: '3px solid #ffffff'
            }}
          >
            {peerName.slice(0, 2).toUpperCase()}
          </Avatar>
        </Box>

        {/* Call Info */}
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'DM Mono, monospace',
            color: '#34d399',
            fontWeight: 800,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            display: 'block',
            mb: 0.5
          }}
        >
          {currentRole === 'teacher'
            ? 'Incoming Student Consultation'
            : isHosted
            ? '🔴 Live Faculty Meeting Hosted'
            : 'Incoming 1-on-1 Video Call'}
        </Typography>

        <Typography variant="h5" fontWeight={900} sx={{ color: '#ffffff', mb: 0.5 }}>
          {peerName}
        </Typography>

        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" mb={2}>
          <Chip
            size="small"
            icon={<School sx={{ fontSize: 14, color: '#f59e0b !important' }} />}
            label={peerRole}
            sx={{ bgcolor: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontWeight: 700, fontSize: 11 }}
          />
          <Chip
            size="small"
            label={call.topic || 'STEM Consultation'}
            sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: 11 }}
          />
        </Stack>

        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: 13, mb: 3 }}>
          {currentRole === 'teacher'
            ? 'A student is requesting live office hours guidance and a screen/whiteboard walkthrough.'
            : isHosted
            ? `${peerName} is currently hosting a live meeting room. Join now to collaborate with audio, video, whiteboard, and screen sharing.`
            : 'Your instructor is inviting you to a live 1-on-1 virtual mentoring session.'}
        </Typography>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            color="error"
            startIcon={<CallEnd />}
            onClick={onDecline}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.2,
              borderColor: 'rgba(239,68,68,0.4)',
              color: '#f87171',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#ef4444',
                bgcolor: 'rgba(239,68,68,0.1)'
              }
            }}
          >
            Decline
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={isHosted ? <Videocam /> : <Call />}
            onClick={onAccept}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.2,
              bgcolor: '#10b981',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 14,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
              '&:hover': {
                bgcolor: '#059669',
                boxShadow: '0 10px 28px rgba(16,185,129,0.5)'
              }
            }}
          >
            {isHosted ? 'Join Meeting' : 'Accept Call'}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
