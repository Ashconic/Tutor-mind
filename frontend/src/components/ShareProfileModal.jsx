import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  CheckCircle,
  Close,
  ContentCopy,
  Download,
  Email,
  Image as ImageIcon,
  IosShare,
  LinkedIn,
  PhoneAndroid,
  Telegram,
  Twitter,
  WhatsApp
} from '@mui/icons-material';

/**
 * Draws a rounded rectangle path on a 2D canvas context.
 */
function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x + r, y);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Generates a high-resolution, branded 1080x1140 showcase card image for the student.
 */
export async function generateProfileCard({
  name = 'Learner',
  level = 1,
  currentXP = 0,
  streak = 0,
  chaptersCount = 0,
  accuracyRate = 100,
  focusTimeDisplay = '0m',
  unlockedBadgeCount = 0,
  totalBadges = 7,
  mathVal = 0,
  physicsVal = 0,
  csVal = 0,
  chemistryVal = 0,
  avatarBg = '#ec735e',
  avatarColor = '#ffffff',
  favoriteTopic = 'Mathematics'
}) {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1140;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Dark Modern Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#161719');
  bgGrad.addColorStop(0.5, '#1e2023');
  bgGrad.addColorStop(1, '#2c2621');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft Ambient Glows
  const glowTopRight = ctx.createRadialGradient(width - 120, 100, 20, width - 120, 100, 520);
  glowTopRight.addColorStop(0, 'rgba(236, 115, 94, 0.35)');
  glowTopRight.addColorStop(1, 'rgba(236, 115, 94, 0)');
  ctx.fillStyle = glowTopRight;
  ctx.fillRect(0, 0, width, height);

  const glowBottomLeft = ctx.createRadialGradient(120, height - 120, 20, 120, height - 120, 480);
  glowBottomLeft.addColorStop(0, 'rgba(246, 200, 87, 0.22)');
  glowBottomLeft.addColorStop(1, 'rgba(246, 200, 87, 0)');
  ctx.fillStyle = glowBottomLeft;
  ctx.fillRect(0, 0, width, height);

  // Outer Border with rounded corners
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#383b42';
  drawRoundedRect(ctx, 32, 32, width - 64, height - 64, 38);
  ctx.stroke();

  // 2. Brand Header Pill
  ctx.fillStyle = '#292b30';
  drawRoundedRect(ctx, 75, 75, 270, 50, 25);
  ctx.fill();
  ctx.fillStyle = '#ec735e';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('📐 TUTORMIND', 100, 108);

  // Top Right Subtitle
  ctx.fillStyle = '#9b9991';
  ctx.font = '600 18px DM Mono, monospace';
  ctx.textAlign = 'right';
  const todayStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  ctx.fillText(`LEARNER SPOTLIGHT • ${todayStr.toUpperCase()}`, width - 80, 108);
  ctx.textAlign = 'left';

  // 3. User Hero Section
  const avatarX = 145;
  const avatarY = 225;
  const avatarRadius = 60;

  // Avatar Circle
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
  ctx.fillStyle = avatarBg || '#ec735e';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.stroke();

  // Avatar Initials
  const initials = (name || 'Learner')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  ctx.fillStyle = avatarColor || '#ffffff';
  ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, avatarX, avatarY + 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // User Name & Subtitles
  ctx.fillStyle = '#fffdf8';
  ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
  const displayName = name.length > 22 ? `${name.slice(0, 22)}…` : name;
  ctx.fillText(displayName, 235, 215);

  ctx.fillStyle = '#f6c857';
  ctx.font = '600 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(`★ Level ${level} Scholar   •   ${favoriteTopic} Enthusiast`, 235, 252);

  // Total XP Pill
  ctx.fillStyle = '#3a3429';
  drawRoundedRect(ctx, width - 330, 195, 250, 56, 28);
  ctx.fill();
  ctx.strokeStyle = '#f6c857';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, width - 330, 195, 250, 56, 28);
  ctx.stroke();
  ctx.fillStyle = '#f6c857';
  ctx.font = 'bold 25px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`⚡ ${Number(currentXP || 0).toLocaleString()} XP`, width - 205, 232);
  ctx.textAlign = 'left';

  // 4. Divider
  ctx.strokeStyle = '#33363b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(75, 315);
  ctx.lineTo(width - 75, 315);
  ctx.stroke();

  // 5. Stat Tiles (3 columns x 2 rows)
  const tiles = [
    { icon: '🔥', label: 'ACTIVE STREAK', val: `${streak} Days`, color: '#ec735e' },
    { icon: '📚', label: 'CHAPTERS MASTERED', val: `${chaptersCount} / 35`, color: '#60a5fa' },
    { icon: '🎯', label: 'QUIZ ACCURACY', val: `${accuracyRate}%`, color: '#34d399' },
    { icon: '⏱️', label: 'FOCUS STUDY TIME', val: focusTimeDisplay, color: '#f6c857' },
    { icon: '🏅', label: 'ACHIEVEMENTS', val: `${unlockedBadgeCount} / ${totalBadges}`, color: '#c084fc' },
    { icon: '🚀', label: 'STATUS', val: 'Active Scholar', color: '#38bdf8' }
  ];

  const tileW = 285;
  const tileH = 125;
  const tileStartX = 75;
  const tileStartY = 350;
  const gapX = 37;
  const gapY = 24;

  tiles.forEach((t, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = tileStartX + col * (tileW + gapX);
    const y = tileStartY + row * (tileH + gapY);

    ctx.fillStyle = 'rgba(32, 35, 40, 0.9)';
    drawRoundedRect(ctx, x, y, tileW, tileH, 18);
    ctx.fill();
    ctx.strokeStyle = '#393c44';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, x, y, tileW, tileH, 18);
    ctx.stroke();

    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillText(t.icon, x + 20, y + 46);

    ctx.fillStyle = '#9b9991';
    ctx.font = 'bold 13px DM Mono, monospace';
    ctx.fillText(t.label, x + 62, y + 42);

    ctx.fillStyle = t.color;
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(t.val, x + 20, y + 96);
  });

  // 6. STEM Curriculum Mastery Section
  const barStartY = 675;
  ctx.fillStyle = '#fffdf8';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('STEM Curriculum Mastery', 75, barStartY);

  ctx.fillStyle = '#9b9991';
  ctx.font = '600 16px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('4 Core Academic Subjects', width - 75, barStartY);
  ctx.textAlign = 'left';

  const subjects = [
    { name: 'Mathematics (23 Chapters across 5 Units)', val: mathVal, color: '#ec735e', icon: '📐' },
    { name: 'Physics (Mechanics, Optics, Thermodynamics, Modern)', val: physicsVal, color: '#818cf8', icon: '⚛️' },
    { name: 'Computer Science (Algorithms, Data, Web, Networks)', val: csVal, color: '#2dd4bf', icon: '💻' },
    { name: 'Chemistry (Atomic, Bonding, Organic, Thermodynamics)', val: chemistryVal, color: '#fb7185', icon: '🧪' }
  ];

  subjects.forEach((s, idx) => {
    const y = barStartY + 35 + idx * 64;
    ctx.fillStyle = '#e2e0d8';
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${s.icon}  ${s.name}`, 75, y + 20);

    ctx.fillStyle = '#fffdf8';
    ctx.font = 'bold 18px DM Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${s.val}%`, width - 75, y + 20);
    ctx.textAlign = 'left';

    // Progress Track
    const trackW = width - 150;
    const trackH = 12;
    const trackY = y + 30;

    ctx.fillStyle = '#2b2d32';
    drawRoundedRect(ctx, 75, trackY, trackW, trackH, 6);
    ctx.fill();

    // Progress Fill
    const fillW = Math.max(12, Math.round((trackW * Math.min(100, Math.max(0, s.val))) / 100));
    ctx.fillStyle = s.color;
    drawRoundedRect(ctx, 75, trackY, fillW, trackH, 6);
    ctx.fill();
  });

  // 7. Footer
  const footerY = height - 125;
  ctx.strokeStyle = '#33363b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(75, footerY);
  ctx.lineTo(width - 75, footerY);
  ctx.stroke();

  ctx.fillStyle = '#ec735e';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('TutorMind Academy', 75, footerY + 45);

  ctx.fillStyle = '#9b9991';
  ctx.font = '15px system-ui, -apple-system, sans-serif';
  ctx.fillText('Intuitive step-by-step STEM learning with interactive visualization & AI tutoring.', 75, footerY + 72);

  ctx.fillStyle = '#f6c857';
  ctx.font = 'bold 16px DM Mono, monospace';
  ctx.textAlign = 'right';
  ctx.fillText('JOIN THE CHALLENGE ➔', width - 75, footerY + 55);
  ctx.textAlign = 'left';

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const dataUrl = canvas.toDataURL('image/png');
      const filename = `tutormind-${(name || 'learner').toLowerCase().replace(/\s+/g, '-')}-card.png`;
      const file = blob ? new File([blob], filename, { type: 'image/png' }) : null;
      resolve({ blob, dataUrl, file, filename });
    }, 'image/png');
  });
}

export default function ShareProfileModal({
  open,
  onClose,
  profileData,
  onToast
}) {
  const [generating, setGenerating] = useState(true);
  const [cardImage, setCardImage] = useState(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  const {
    name = 'Learner',
    level = 1,
    currentXP = 0,
    streak = 0,
    chaptersCount = 0,
    accuracyRate = 100,
    focusTimeDisplay = '0m',
    unlockedBadgeCount = 0,
    totalBadges = 7,
    mathVal = 0,
    physicsVal = 0,
    csVal = 0,
    chemistryVal = 0,
    avatarBg = '#ec735e',
    avatarColor = '#ffffff',
    favoriteTopic = 'Mathematics'
  } = profileData || {};

  // Formatted share summary text
  const shareText =
    `🏆 ${name} on TutorMind:\n` +
    `• Level ${level} Scholar (${Number(currentXP).toLocaleString()} XP)\n` +
    `• 🔥 ${streak}-Day Learning Streak\n` +
    `• ⏱️ ${focusTimeDisplay} Total Focus Time\n` +
    `• 📚 ${chaptersCount}/35 Chapters Mastered\n` +
    `• 🎯 ${accuracyRate}% Quiz Accuracy\n` +
    `• 🏅 ${unlockedBadgeCount}/${totalBadges} Achievements Unlocked\n\n` +
    `Mastering Mathematics, Physics, Computer Science & Chemistry intuitively at TutorMind!`;

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tutormind.edu';

  // Generate card image whenever modal opens or profile data updates
  useEffect(() => {
    if (!open) return;
    let isCancelled = false;
    setGenerating(true);

    generateProfileCard({
      name,
      level,
      currentXP,
      streak,
      chaptersCount,
      accuracyRate,
      focusTimeDisplay,
      unlockedBadgeCount,
      totalBadges,
      mathVal,
      physicsVal,
      csVal,
      chemistryVal,
      avatarBg,
      avatarColor,
      favoriteTopic
    }).then((res) => {
      if (!isCancelled) {
        setCardImage(res);
        setGenerating(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [open, name, level, currentXP, streak, chaptersCount, accuracyRate, focusTimeDisplay, unlockedBadgeCount, totalBadges, mathVal, physicsVal, csVal, chemistryVal, avatarBg, avatarColor, favoriteTopic]);

  // 1. Native Phone / Device Share (triggers phone apps: WhatsApp, Instagram, Telegram, AirDrop, etc.)
  const handleNativeShare = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) {
      onToast?.('Native share is not supported on this browser. Use the direct buttons below!');
      return;
    }

    try {
      const shareData = {
        title: `${name}'s TutorMind Achievement`,
        text: shareText,
        url: shareUrl
      };

      // Check if file sharing is supported
      if (cardImage?.file && navigator.canShare && navigator.canShare({ files: [cardImage.file] })) {
        shareData.files = [cardImage.file];
      }

      await navigator.share(shareData);
      onToast?.('Card shared successfully!');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed:', err);
        onToast?.('Sharing was canceled or unavailable.');
      }
    }
  };

  // 2. Direct Social Shares
  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const text = `Just hit a ${streak}-day streak and earned ${Number(currentXP).toLocaleString()} XP mastering STEM on @TutorMind! 🚀\n\n`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=TutorMind,EdTech,STEM,Learning`;
    window.open(url, '_blank');
  };

  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${name}'s TutorMind Progress Spotlight`);
    const body = encodeURIComponent(`Hi!\n\nCheck out my learning progress and achievements on TutorMind:\n\n${shareText}\n\nVisit: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // 3. Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!cardImage?.blob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': cardImage.blob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
        onToast?.('Showcase card image copied to clipboard! Paste it directly anywhere.');
        return;
      }
    } catch (err) {
      console.warn('Clipboard image write not supported, falling back to text:', err);
    }
    // Fallback
    handleCopyText();
  };

  // 4. Download Image
  const handleDownloadImage = () => {
    if (!cardImage?.dataUrl) return;
    const link = document.createElement('a');
    link.download = cardImage.filename || `tutormind-${name.toLowerCase().replace(/\s+/g, '-')}-card.png`;
    link.href = cardImage.dataUrl;
    link.click();
    onToast?.('Achievement card saved to your device!');
  };

  // 5. Copy Text & Link
  const handleCopyText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2500);
        onToast?.('Summary text and link copied to clipboard!');
      }
    } catch (err) {
      console.warn('Clipboard write text failed:', err);
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          bgcolor: '#fffdf8',
          border: '1px solid #e6e2d9',
          boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          pt: 2.5,
          px: { xs: 2, sm: 3 },
          borderBottom: '1px solid #f0ede6'
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              letterSpacing: 1.2,
              color: '#ec735e',
              textTransform: 'uppercase',
              fontWeight: 700
            }}
          >
            SHARE YOUR PROGRESS
          </Typography>
          <Typography variant="h5" fontWeight={800} color="#20211f" mt={0.3}>
            Share Profile & Achievement Card
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#777873' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
          {/* Left Column: High-Res Card Snapshot Preview */}
          <Box
            sx={{
              flex: { xs: '1', md: '1.1' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#1a1c1e',
              borderRadius: 2.5,
              p: 2,
              border: '1px solid #2e3135',
              position: 'relative',
              minHeight: 340
            }}
          >
            {generating ? (
              <Stack spacing={2} alignItems="center">
                <CircularProgress size={38} sx={{ color: '#ec735e' }} />
                <Typography fontSize={13} color="#9b9991" fontFamily="DM Mono, monospace">
                  Generating high-res card...
                </Typography>
              </Stack>
            ) : (
              <>
                <Box
                  component="img"
                  src={cardImage?.dataUrl}
                  alt="Student Achievement Card"
                  sx={{
                    width: '100%',
                    maxHeight: 460,
                    objectFit: 'contain',
                    borderRadius: 2,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.01)' }
                  }}
                />
                <Stack direction="row" spacing={1} mt={1.5} alignItems="center">
                  <Chip
                    size="small"
                    icon={<ImageIcon sx={{ fontSize: '14px !important', color: '#f6c857 !important' }} />}
                    label="1080×1140 High-Res PNG"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.08)',
                      color: '#fffdf8',
                      fontSize: 11,
                      fontFamily: 'DM Mono, monospace'
                    }}
                  />
                  <Chip
                    size="small"
                    label="Watermarked & Verified"
                    sx={{
                      bgcolor: 'rgba(236,115,94,0.15)',
                      color: '#ec735e',
                      fontSize: 11,
                      fontFamily: 'DM Mono, monospace'
                    }}
                  />
                </Stack>
              </>
            )}
          </Box>

          {/* Right Column: Multi-Channel Share Options */}
          <Box sx={{ flex: { xs: '1', md: '1' } }}>
            <Typography fontSize={12} color="text.secondary" mb={2}>
              Share your verified student card with your classmates, friends, study groups, or on your social feeds:
            </Typography>

            {/* Primary Phone / Device Share Sheet */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: '#fcf8f3',
                border: '1.5px solid #ec735e',
                boxShadow: '0 4px 14px rgba(236,115,94,0.08)'
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: '#ec735e',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PhoneAndroid fontSize="small" />
                </Box>
                <Box>
                  <Typography fontSize={14} fontWeight={800} color="#20211f">
                    Quick Share to Phone Apps
                  </Typography>
                  <Typography fontSize={11} color="text.secondary">
                    WhatsApp, Instagram, AirDrop, Messages, Drive & more
                  </Typography>
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                size="medium"
                disabled={generating}
                startIcon={<IosShare fontSize="small" />}
                onClick={handleNativeShare}
                sx={{
                  mt: 0.5,
                  bgcolor: '#ec735e',
                  color: '#fff',
                  fontWeight: 700,
                  py: 1.1,
                  borderRadius: 1.8,
                  '&:hover': { bgcolor: '#d95f4c' }
                }}
              >
                {hasNativeShare ? 'Open Phone Share Sheet' : 'Share with Device'}
              </Button>
            </Paper>

            <Typography
              sx={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: 1.1,
                color: '#9b9991',
                textTransform: 'uppercase',
                mb: 1.2
              }}
            >
              DIRECT SOCIAL & CHAT CHANNELS
            </Typography>

            {/* Social Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1.2,
                mb: 2.2
              }}
            >
              {/* WhatsApp */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<WhatsApp sx={{ color: '#25D366' }} />}
                onClick={handleWhatsApp}
                sx={{
                  justifyContent: 'flex-start',
                  borderColor: '#e6e2d9',
                  color: '#20211f',
                  bgcolor: '#fff',
                  py: 0.9,
                  fontWeight: 600,
                  '&:hover': { borderColor: '#25D366', bgcolor: '#f0fdf4' }
                }}
              >
                WhatsApp
              </Button>

              {/* Telegram */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Telegram sx={{ color: '#229ED9' }} />}
                onClick={handleTelegram}
                sx={{
                  justifyContent: 'flex-start',
                  borderColor: '#e6e2d9',
                  color: '#20211f',
                  bgcolor: '#fff',
                  py: 0.9,
                  fontWeight: 600,
                  '&:hover': { borderColor: '#229ED9', bgcolor: '#f0f9ff' }
                }}
              >
                Telegram
              </Button>

              {/* Twitter / X */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Twitter sx={{ color: '#1da1f2' }} />}
                onClick={handleTwitter}
                sx={{
                  justifyContent: 'flex-start',
                  borderColor: '#e6e2d9',
                  color: '#20211f',
                  bgcolor: '#fff',
                  py: 0.9,
                  fontWeight: 600,
                  '&:hover': { borderColor: '#1da1f2', bgcolor: '#f8fafc' }
                }}
              >
                X (Twitter)
              </Button>

              {/* LinkedIn */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<LinkedIn sx={{ color: '#0A66C2' }} />}
                onClick={handleLinkedIn}
                sx={{
                  justifyContent: 'flex-start',
                  borderColor: '#e6e2d9',
                  color: '#20211f',
                  bgcolor: '#fff',
                  py: 0.9,
                  fontWeight: 600,
                  '&:hover': { borderColor: '#0A66C2', bgcolor: '#eff6ff' }
                }}
              >
                LinkedIn
              </Button>
            </Box>

            <Typography
              sx={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: 1.1,
                color: '#9b9991',
                textTransform: 'uppercase',
                mb: 1.2
              }}
            >
              IMAGE & CLIPBOARD ACTIONS
            </Typography>

            <Stack direction="row" spacing={1} mb={1}>
              {/* Copy Image */}
              <Button
                fullWidth
                variant="outlined"
                size="small"
                disabled={generating}
                startIcon={copiedImage ? <CheckCircle sx={{ color: '#2e7d32' }} /> : <ImageIcon />}
                onClick={handleCopyImage}
                sx={{
                  borderColor: copiedImage ? '#2e7d32' : '#e6e2d9',
                  color: copiedImage ? '#2e7d32' : '#20211f',
                  fontWeight: 600,
                  py: 0.8
                }}
              >
                {copiedImage ? 'Image Copied!' : 'Copy Image'}
              </Button>

              {/* Download PNG */}
              <Button
                fullWidth
                variant="outlined"
                size="small"
                disabled={generating}
                startIcon={<Download />}
                onClick={handleDownloadImage}
                sx={{
                  borderColor: '#e6e2d9',
                  color: '#20211f',
                  fontWeight: 600,
                  py: 0.8
                }}
              >
                Save PNG
              </Button>
            </Stack>

            <Stack direction="row" spacing={1}>
              {/* Copy Summary Text */}
              <Button
                fullWidth
                variant="text"
                size="small"
                startIcon={copiedText ? <CheckCircle sx={{ color: '#2e7d32' }} /> : <ContentCopy />}
                onClick={handleCopyText}
                sx={{
                  color: copiedText ? '#2e7d32' : '#5f5e58',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                {copiedText ? 'Text Copied!' : 'Copy Text & Link'}
              </Button>

              {/* Email */}
              <Button
                fullWidth
                variant="text"
                size="small"
                startIcon={<Email />}
                onClick={handleEmail}
                sx={{
                  color: '#5f5e58',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                Email Report
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: '#fbf9f5', borderTop: '1px solid #f0ede6' }}>
        <Button onClick={onClose} sx={{ color: '#777873', fontWeight: 600 }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
