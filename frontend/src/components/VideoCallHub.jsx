import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Fade,
  Alert
} from '@mui/material';
import {
  Videocam,
  Lock,
  Send,
  AccessTime
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function VideoCallHub({
  user,
  officeHours,
  onCallTeacher,
  onSendPing,
  onToast
}) {
  const isLive = officeHours?.isLive ?? true;
  const teacherName = officeHours?.teacherName || 'Prof. Sarah Jenkins';
  const teacherTitle = officeHours?.teacherTitle || 'Lead Math & STEM Instructor';

  const [topic, setTopic] = useState('1-on-1 Office Hours Consultation');
  const [customTopic, setCustomTopic] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [pingMessage, setPingMessage] = useState('');
  const [pingSent, setPingSent] = useState(false);

  const handleStartCall = () => {
    const finalTopic = topic === 'Custom' && customTopic.trim() ? customTopic.trim() : topic;
    if (onCallTeacher) {
      onCallTeacher(finalTopic);
    }
  };

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!pingMessage.trim()) return;
    if (onSendPing) {
      onSendPing({
        subject: topic === 'Custom' ? (customTopic || 'Question') : topic,
        message: pingMessage.trim()
      });
      setPingSent(true);
      setPingMessage('');
      setTimeout(() => {
        setPingSent(false);
        setShowRequestForm(false);
      }, 4000);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 4 }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%', maxWidth: 540 }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid #e5e7eb',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)',
            bgcolor: '#ffffff',
            overflow: 'hidden'
          }}
        >
          {/* Top Status Bar */}
          <Box
            sx={{
              px: 3.5,
              py: 1.8,
              bgcolor: isLive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              borderBottom: isLive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  bgcolor: isLive ? '#10b981' : '#f59e0b',
                  boxShadow: isLive ? '0 0 10px #10b981' : 'none'
                }}
              />
              <Typography
                fontSize={12}
                fontWeight={700}
                color={isLive ? '#065f46' : '#92400e'}
                letterSpacing={0.5}
                textTransform="uppercase"
              >
                {isLive ? 'Instructor Available Now' : 'Instructor Currently Away'}
              </Typography>
            </Stack>

            <Typography fontSize={11} color="text.secondary" fontWeight={600}>
              {officeHours?.windowDisplay || 'Mon–Fri · 3:00 PM – 5:30 PM'}
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Teacher Profile Info */}
            <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3.5 }}>
              <Avatar
                sx={{
                  width: 58,
                  height: 58,
                  bgcolor: '#ec735e',
                  fontSize: 20,
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(236,115,94,0.3)'
                }}
              >
                SJ
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={800} color="#111827" sx={{ letterSpacing: -0.3 }}>
                  {teacherName}
                </Typography>
                <Typography variant="body2" color="#6b7280" fontWeight={500} sx={{ mt: 0.2 }}>
                  {teacherTitle}
                </Typography>
              </Box>
            </Stack>

            {/* If Teacher is Live: Clean 1-Click Call Flow */}
            {isLive ? (
              <Stack spacing={2.5}>
                <Box>
                  <Typography fontSize={12} fontWeight={700} color="#374151" sx={{ mb: 1 }}>
                    Discussion Topic
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      sx={{
                        borderRadius: 2.5,
                        bgcolor: '#f9fafb',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      <MenuItem value="1-on-1 Office Hours Consultation">1-on-1 Problem Walkthrough</MenuItem>
                      <MenuItem value="Calculus Limits & Derivatives">Calculus & Derivatives</MenuItem>
                      <MenuItem value="Linear Equations & Variables">Linear Equations & Algebra</MenuItem>
                      <MenuItem value="Assignment Help & Homework Review">Homework & Assignment Review</MenuItem>
                      <MenuItem value="Exam Preparation & Study Tips">Exam Preparation</MenuItem>
                      <MenuItem value="Custom">Other / Custom Topic...</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {topic === 'Custom' && (
                  <TextField
                    size="small"
                    placeholder="Enter your topic or question..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    fullWidth
                    sx={{
                      borderRadius: 2.5,
                      '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#f9fafb' }
                    }}
                  />
                )}

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Videocam sx={{ fontSize: 24 }} />}
                  onClick={handleStartCall}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    bgcolor: '#10b981',
                    color: '#ffffff',
                    fontSize: 15,
                    fontWeight: 800,
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                    transition: '0.2s',
                    '&:hover': {
                      bgcolor: '#059669',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 28px rgba(16, 185, 129, 0.45)'
                    }
                  }}
                >
                  Start Video Call Now
                </Button>

                {/* Minimalist Footnote */}
                <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ pt: 1 }}>
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    <Lock sx={{ fontSize: 13, color: '#9ca3af' }} />
                    <Typography fontSize={11} color="#9ca3af" fontWeight={500}>
                      Encrypted & Private
                    </Typography>
                  </Stack>
                  <Typography fontSize={11} color="#d1d5db">•</Typography>
                  <Typography fontSize={11} color="#9ca3af" fontWeight={500}>
                    Interactive Whiteboard Included
                  </Typography>
                </Stack>
              </Stack>
            ) : (
              /* If Teacher is Away: Minimal Callback Request */
              <Stack spacing={2.5}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: '#f9fafb',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <AccessTime sx={{ color: '#f59e0b', fontSize: 20 }} />
                    <Typography fontSize={13} fontWeight={700} color="#111827">
                      Next Active Office Hours
                    </Typography>
                  </Stack>
                  <Typography fontSize={13} color="#4b5563" sx={{ lineHeight: 1.5 }}>
                    Prof. Sarah Jenkins is currently outside live consultation hours. Active daily between <strong>3:00 PM – 5:30 PM</strong>.
                  </Typography>
                </Box>

                {pingSent ? (
                  <Alert severity="success" sx={{ borderRadius: 2.5 }}>
                    Your meeting request has been sent! You will be notified when the instructor is available.
                  </Alert>
                ) : showRequestForm ? (
                  <Fade in={showRequestForm}>
                    <Box component="form" onSubmit={handleSendRequest}>
                      <Stack spacing={1.5}>
                        <TextField
                          size="small"
                          label="Your Question or Topic"
                          placeholder="Briefly describe what you'd like help with..."
                          value={pingMessage}
                          onChange={(e) => setPingMessage(e.target.value)}
                          multiline
                          rows={2.5}
                          fullWidth
                          required
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                        />
                        <Stack direction="row" spacing={1.5}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<Send sx={{ fontSize: 16 }} />}
                            sx={{
                              bgcolor: '#111827',
                              color: '#ffffff',
                              textTransform: 'none',
                              fontWeight: 700,
                              borderRadius: 2.5,
                              px: 3,
                              '&:hover': { bgcolor: '#374151' }
                            }}
                          >
                            Send Request
                          </Button>
                          <Button
                            variant="text"
                            onClick={() => setShowRequestForm(false)}
                            sx={{ textTransform: 'none', color: '#6b7280', fontWeight: 600 }}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </Fade>
                ) : (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => setShowRequestForm(true)}
                    startIcon={<Send sx={{ fontSize: 18 }} />}
                    sx={{
                      py: 1.4,
                      borderRadius: 3,
                      color: '#111827',
                      borderColor: '#d1d5db',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: 14,
                      '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' }
                    }}
                  >
                    Leave a Question for Next Office Hours
                  </Button>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}