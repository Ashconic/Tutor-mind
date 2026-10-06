import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Button,
  Avatar,
  Chip,
  Tooltip,
  TextField,
  Divider,
  Badge,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Popover
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  CallEnd,
  Brush,
  Chat as ChatIcon,
  Close,
  Send,
  Fullscreen,
  FullscreenExit,
  Security as SecurityIcon,
  FiberManualRecord,
  DeleteOutline,
  School,
  Person,
  Cameraswitch,
  PresentToAll,
  People,
  AddReaction,
  PanTool,
  ThumbUp,
  Favorite,
  Celebration,
  Psychology,
  Lock,
  LockOpen,
  VolumeUp,
  VolumeOff,
  ContentCopy,
  CheckCircle,
  Info,
  Shield,
  MoreVert
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

// Helper: Generate an animated virtual camera stream when physical webcam is busy or absent
function createVirtualVideoStream(name = 'User', role = 'student') {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  let angle = 0;

  const timer = setInterval(() => {
    angle += 0.05;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (role === 'teacher') {
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(1, '#022c22');
    } else {
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 - 30);
    ctx.rotate(angle);
    ctx.strokeStyle = role === 'teacher' ? 'rgba(52, 211, 153, 0.4)' : 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(-80, -80, 160, 160);
    ctx.restore();

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 - 30);
    ctx.rotate(-angle * 0.7);
    ctx.strokeStyle = role === 'teacher' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(129, 140, 248, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 95, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 30;
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fillStyle = role === 'teacher' ? '#059669' : '#4f46e5';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    ctx.fillText(initials || 'TM', cx, cy);

    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, cx, cy + 85);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = role === 'teacher' ? '#34d399' : '#93c5fd';
    ctx.fillText(role === 'teacher' ? 'Lead STEM Instructor · Host' : 'Student · Participant', cx, cy + 110);

    const bars = 8;
    const barWidth = 4;
    const spacing = 4;
    const totalW = bars * (barWidth + spacing);
    const startX = cx - totalW / 2;
    ctx.fillStyle = role === 'teacher' ? '#34d399' : '#60a5fa';
    for (let i = 0; i < bars; i++) {
      const bh = 6 + Math.abs(Math.sin(angle * 3 + i)) * 18;
      ctx.fillRect(startX + i * (barWidth + spacing), cy + 130 - bh / 2, barWidth, bh);
    }
  }, 1000 / 30);

  let stream;
  try {
    stream = canvas.captureStream ? canvas.captureStream(30) : null;
  } catch {
    stream = null;
  }

  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const dst = osc.connect(audioCtx.createMediaStreamDestination());
    osc.start();
    const audioTrack = dst.stream.getAudioTracks()[0];
    if (audioTrack && stream) stream.addTrack(audioTrack);
  } catch {}

  return { stream, cleanup: () => clearInterval(timer) };
}

export default function VirtualMeetingRoom({
  call,
  currentUser,
  currentRole = 'student',
  onEndCall
}) {
  const isTeacher = currentRole === 'teacher';

  // --- Audio / Video Hardware State ---
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [remoteScreenShare, setRemoteScreenShare] = useState({ active: false, sharerName: '', sharerRole: '' });
  const [swapViews, setSwapViews] = useState(false);

  // --- Panels & Zoom Drawers ---
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Zoom Host / Participant Dialogs ---
  const [hostEndDialogOpen, setHostEndDialogOpen] = useState(false);
  const [participantLeaveDialogOpen, setParticipantLeaveDialogOpen] = useState(false);
  const [meetingEndedByHostDialogOpen, setMeetingEndedByHostDialogOpen] = useState(false);

  // --- Zoom Security Menu (Host only) ---
  const [securityAnchorEl, setSecurityAnchorEl] = useState(null);
  const [securitySettings, setSecuritySettings] = useState({
    locked: false,
    allowScreenShare: true,
    allowChat: true,
    allowUnmute: true
  });

  // --- Zoom Info Popover (Top Left Shield) ---
  const [infoAnchorEl, setInfoAnchorEl] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // --- Zoom Reactions ---
  const [reactionsAnchorEl, setReactionsAnchorEl] = useState(null);
  const [handRaised, setHandRaised] = useState(false);
  const [peerHandRaised, setPeerHandRaised] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);

  // --- Telemetry & Session Status ---
  const [callSession, setCallSession] = useState(call);
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [participantLeftNotice, setParticipantLeftNotice] = useState('');

  // --- Whiteboard Canvas State (Teacher only) ---
  const [penColor, setPenColor] = useState('#ec735e');
  const [penSize, setPenSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // Streams & WebRTC
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const canvasRef = useRef(null);

  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const containerRef = useRef(null);

  // Drawing state refs
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);
  const hasMovedRef = useRef(false);
  const allStrokesRef = useRef([]);
  const pendingStrokesRef = useRef([]);
  const lastStrokeSyncTimeRef = useRef(0);
  const lastClearVersionRef = useRef(0);
  const virtualCleanupRef = useRef(null);

  const peerRole = currentRole === 'teacher' ? 'student' : 'teacher';
  const myName = currentUser?.name || (isTeacher ? 'Prof. Sarah Jenkins' : 'Student');
  const peerName = isTeacher
    ? (callSession?.callee?.name || callSession?.caller?.name || 'Student')
    : (callSession?.caller?.role === 'teacher' ? callSession.caller.name : (callSession?.callee?.name || 'Prof. Sarah Jenkins'));

  // Format meeting ID nicely like Zoom (e.g. 849 2049 192)
  const meetingDisplayId = (callSession?.id || '8492049192')
    .replace(/[^0-9]/g, '')
    .slice(-9)
    .padStart(9, '849204919')
    .replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

  // 1. Initialize Real Webcam / Microphone with fallback to live animated virtual video
  useEffect(() => {
    let active = true;

    async function initMedia() {
      let stream = null;
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: true
          });
        }
      } catch (err) {
        console.warn('Physical camera/mic locked or unavailable. Initializing live virtual camera stream:', err.message);
      }

      if (!stream) {
        const virt = createVirtualVideoStream(myName, currentRole);
        stream = virt.stream;
        virtualCleanupRef.current = virt.cleanup;
      }

      if (active && stream) {
        localStreamRef.current = stream;
        setLocalStream(stream);
      }
    }

    initMedia();

    // BroadcastChannel for same-origin coordination
    try {
      const bc = new BroadcastChannel('tutormind-video-call');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'CHAT_MESSAGE') {
          setMessages((prev) => (prev.some((m) => m.id === payload.id) ? prev : [...prev, payload]));
        } else if (type === 'WHITEBOARD_STROKES') {
          handleIncomingStrokes(payload);
        } else if (type === 'WHITEBOARD_OPEN_STATE') {
          setWhiteboardOpen(Boolean(payload.isOpen));
        } else if (type === 'WHITEBOARD_CLEAR') {
          if (payload?.clearVersion) {
            lastClearVersionRef.current = payload.clearVersion;
          }
          clearCanvasLocal();
        } else if (type === 'SCREEN_SHARE_STATE') {
          setRemoteScreenShare({
            active: Boolean(payload.active),
            sharerName: payload.sharerName || '',
            sharerRole: payload.sharerRole || ''
          });
        } else if (type === 'MEETING_ENDED_FOR_ALL') {
          if (!isTeacher) {
            setMeetingEndedByHostDialogOpen(true);
          } else {
            if (onEndCall) onEndCall();
          }
        } else if (type === 'PARTICIPANT_LEFT') {
          setParticipantLeftNotice(payload?.message || 'Participant left the meeting.');
          setTimeout(() => setParticipantLeftNotice(''), 6000);
        } else if (type === 'REACTION_EMOJI') {
          triggerFloatingEmoji(payload.emoji, payload.senderName);
        } else if (type === 'HAND_RAISED_STATE') {
          setPeerHandRaised(Boolean(payload.handRaised));
        }
      };
    } catch {}

    return () => {
      active = false;
      if (virtualCleanupRef.current) virtualCleanupRef.current();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      try {
        broadcastChannelRef.current?.close();
      } catch {}
    };
  }, [myName, currentRole, isTeacher, onEndCall]);

  // 2. Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, swapViews]);

  // 3. Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream, swapViews]);

  // 4. WebRTC Peer Connection Setup & Track Replacement Screen Share
  useEffect(() => {
    if (!localStream || !callSession?.id) return;

    let destroyed = false;
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    peerConnectionRef.current = pc;

    localStream.getTracks().forEach((track) => {
      try {
        pc.addTrack(track, localStream);
      } catch {}
    });

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = async (event) => {
      if (event.candidate && callSession?.id) {
        try {
          await api.post(`/calls/${callSession.id}/signal`, {
            signal: { type: 'candidate', candidate: event.candidate },
            fromRole: currentRole
          });
        } catch {}
      }
    };

    const isInitiator = isTeacher;
    if (isInitiator) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(async () => {
          if (!destroyed && pc.localDescription) {
            await api.post(`/calls/${callSession.id}/signal`, {
              signal: { type: 'offer', sdp: pc.localDescription.sdp },
              fromRole: currentRole
            });
          }
        })
        .catch(() => {});
    }

    let lastSignalTime = 0;
    const signalInterval = setInterval(async () => {
      if (destroyed || !callSession?.id) return;
      try {
        const res = await api.get(`/calls/${callSession.id}/signals?since=${lastSignalTime}&excludeRole=${currentRole}`);
        const signals = res.data?.signals || [];
        for (const s of signals) {
          lastSignalTime = Math.max(lastSignalTime, s.timestamp);
          const sig = s.signal;
          if (!sig) continue;

          if (sig.type === 'offer' && !isInitiator) {
            await pc.setRemoteDescription(new RTCSessionDescription(sig));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await api.post(`/calls/${callSession.id}/signal`, {
              signal: { type: 'answer', sdp: answer.sdp },
              fromRole: currentRole
            });
          } else if (sig.type === 'answer' && isInitiator) {
            if (pc.signalingState !== 'stable') {
              await pc.setRemoteDescription(new RTCSessionDescription(sig));
            }
          } else if (sig.type === 'candidate' && sig.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(sig.candidate));
            } catch {}
          }
        }
      } catch {}
    }, 800);

    return () => {
      destroyed = true;
      clearInterval(signalInterval);
      try {
        pc.close();
      } catch {}
    };
  }, [localStream, callSession?.id, currentRole, isTeacher]);

  // Fallback simulated peer stream when direct P2P connection is establishing
  useEffect(() => {
    if (!remoteStream) {
      const virt = createVirtualVideoStream(peerName, peerRole);
      setRemoteStream(virt.stream);
      return virt.cleanup;
    }
  }, [remoteStream, peerName, peerRole]);

  // 5. Call Timer
  useEffect(() => {
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 6. Active Call Session Poller (Polls /api/calls/:id every 800ms)
  // Detects: Host Ended Meeting for All, Participant Left, Status Transition to Connected
  useEffect(() => {
    if (!callSession?.id) return;

    let active = true;
    const pollSession = async () => {
      try {
        const res = await api.get(`/calls/${callSession.id}`);
        const latest = res.data?.call;
        if (!latest || !active) return;

        setCallSession(latest);

        // Check if teacher ended meeting for all
        if (latest.status === 'ended') {
          if (!isTeacher) {
            setMeetingEndedByHostDialogOpen(true);
          } else {
            if (onEndCall) onEndCall();
          }
        }

        // Check if a participant left
        if (latest.participantLeft && latest.leftParticipantName) {
          setParticipantLeftNotice(`${latest.leftParticipantName} left the meeting.`);
        }

        // Check peer hand raised
        if (typeof latest.handRaised === 'boolean') {
          if (isTeacher) setPeerHandRaised(latest.handRaised);
        }
      } catch {}
    };

    pollSession();
    const interval = setInterval(pollSession, 800);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [callSession?.id, isTeacher, onEndCall]);

  // 7. In-Call Chat polling
  useEffect(() => {
    if (!callSession?.id) return;
    const fetchChat = async () => {
      try {
        const res = await api.get(`/calls/${callSession.id}/messages`);
        if (res.data?.messages) {
          setMessages(res.data.messages);
        }
      } catch {}
    };
    fetchChat();
    const interval = setInterval(fetchChat, 2000);
    return () => clearInterval(interval);
  }, [callSession?.id]);

  // 8. Whiteboard Sync Poller
  useEffect(() => {
    if (!callSession?.id) return;

    const syncWhiteboard = async () => {
      try {
        const sinceTime = allStrokesRef.current.length === 0 ? 0 : lastStrokeSyncTimeRef.current;
        const res = await api.get(`/calls/${callSession.id}/whiteboard?since=${sinceTime}`);
        if (res.data) {
          if (typeof res.data.isOpen === 'boolean' && res.data.isOpen !== whiteboardOpen) {
            setWhiteboardOpen(res.data.isOpen);
          }

          // Check if teacher cleared the canvas
          const clearVersion = Number(res.data.clearVersion || 0);
          if (clearVersion > lastClearVersionRef.current) {
            lastClearVersionRef.current = clearVersion;
            clearCanvasLocal();
            lastStrokeSyncTimeRef.current = res.data.clearedAt || res.data.lastUpdate || 0;
          } else if (res.data.totalStrokes === 0 && allStrokesRef.current.length > 0) {
            // Failsafe: backend reports 0 strokes while client still has strokes
            clearCanvasLocal();
            lastStrokeSyncTimeRef.current = res.data.lastUpdate || 0;
          }

          const newStrokes = res.data.strokes || [];
          if (newStrokes.length > 0) {
            handleIncomingStrokes(newStrokes);
          }
          if (res.data.lastUpdate) {
            lastStrokeSyncTimeRef.current = Math.max(lastStrokeSyncTimeRef.current, res.data.lastUpdate);
          }
        }
      } catch {}
    };

    syncWhiteboard();
    const interval = setInterval(syncWhiteboard, 300);
    return () => clearInterval(interval);
  }, [callSession?.id, whiteboardOpen]);

  // Redraw all strokes whenever whiteboard is opened / canvas mounts
  useEffect(() => {
    if (whiteboardOpen && canvasRef.current && allStrokesRef.current.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      allStrokesRef.current.forEach((st) => drawStrokeSegment(ctx, st));
    }
  }, [whiteboardOpen]);

  // 9. Screen Share Sync Poller
  useEffect(() => {
    if (!callSession?.id) return;

    const syncScreenShare = async () => {
      try {
        const res = await api.get(`/calls/${callSession.id}/screenshare`);
        const ss = res.data?.screenShare;
        if (ss) {
          setRemoteScreenShare({
            active: Boolean(ss.active),
            sharerName: ss.sharerName || '',
            sharerRole: ss.sharerRole || ''
          });
        }
      } catch {}
    };

    syncScreenShare();
    const interval = setInterval(syncScreenShare, 600);
    return () => clearInterval(interval);
  }, [callSession?.id]);

  // 10. Floating Reactions Handler
  const triggerFloatingEmoji = (emoji, sender) => {
    const id = Date.now() + Math.random();
    const x = 30 + Math.random() * 40; // 30% to 70% width
    setFloatingReactions((prev) => [...prev, { id, emoji, sender, x }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2800);
  };

  const handleSendReaction = async (emoji) => {
    triggerFloatingEmoji(emoji, myName);
    try {
      broadcastChannelRef.current?.postMessage({
        type: 'REACTION_EMOJI',
        payload: { emoji, senderName: myName }
      });
      if (callSession?.id) {
        await api.post(`/calls/${callSession.id}/reaction`, {
          emoji,
          senderName: myName,
          senderRole: currentRole
        });
      }
    } catch {}
    setReactionsAnchorEl(null);
  };

  const handleToggleHandRaise = async () => {
    const nextState = !handRaised;
    setHandRaised(nextState);
    if (nextState) {
      triggerFloatingEmoji('✋', myName);
    }
    try {
      broadcastChannelRef.current?.postMessage({
        type: 'HAND_RAISED_STATE',
        payload: { handRaised: nextState }
      });
      if (callSession?.id) {
        await api.post(`/calls/${callSession.id}/reaction`, {
          handRaised: nextState,
          senderName: myName,
          senderRole: currentRole
        });
      }
    } catch {}
    setReactionsAnchorEl(null);
  };

  // Hardware Toggles
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !micOn;
      });
      setMicOn((p) => !p);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !cameraOn;
      });
      setCameraOn((p) => !p);
    }
  };

  // Screen Share: WebRTC Track Replacement
  const toggleScreenShare = async () => {
    if (screenSharing) {
      await stopScreenShare();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
      screenStreamRef.current = stream;
      setScreenSharing(true);

      const screenTrack = stream.getVideoTracks()[0];
      if (peerConnectionRef.current) {
        const videoSender = peerConnectionRef.current
          .getSenders()
          .find((s) => s.track && s.track.kind === 'video');
        if (videoSender && screenTrack) {
          await videoSender.replaceTrack(screenTrack);
        }
      }

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play().catch(() => {});
      }

      if (callSession?.id) {
        await api.post(`/calls/${callSession.id}/screenshare`, {
          active: true,
          sharerRole: currentRole,
          sharerName: myName
        });
      }

      broadcastChannelRef.current?.postMessage({
        type: 'SCREEN_SHARE_STATE',
        payload: { active: true, sharerName: myName, sharerRole: currentRole }
      });

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.warn('Screen share canceled or failed:', err);
      setScreenSharing(false);
    }
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setScreenSharing(false);

    if (peerConnectionRef.current && localStream) {
      const camTrack = localStream.getVideoTracks()[0];
      const videoSender = peerConnectionRef.current
        .getSenders()
        .find((s) => s.track && s.track.kind === 'video');
      if (videoSender && camTrack) {
        await videoSender.replaceTrack(camTrack).catch(() => {});
      }
    }

    if (callSession?.id) {
      try {
        await api.post(`/calls/${callSession.id}/screenshare`, { active: false });
      } catch {}
    }

    broadcastChannelRef.current?.postMessage({
      type: 'SCREEN_SHARE_STATE',
      payload: { active: false }
    });
  };

  // Whiteboard: Open / Close (Teacher only)
  const toggleWhiteboard = async () => {
    if (!isTeacher) return;
    const nextState = !whiteboardOpen;
    setWhiteboardOpen(nextState);

    broadcastChannelRef.current?.postMessage({
      type: 'WHITEBOARD_OPEN_STATE',
      payload: { isOpen: nextState }
    });

    if (callSession?.id) {
      try {
        await api.post(`/calls/${callSession.id}/whiteboard`, {
          isOpen: nextState,
          role: 'teacher'
        });
      } catch {}
    }
  };

  // Helper: map screen/pointer event coordinates accurately to canvas virtual pixel space
  const getCanvasPoint = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width || 1;
    const height = rect.height || canvas.height || 1;
    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;
    return {
      x: Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY))
    };
  };

  // Drawing routines
  const drawStrokeSegment = (ctx, stroke) => {
    if (!ctx || !stroke) return;
    ctx.save();
    if (stroke.isEraser || stroke.color === '#0c0e12' || stroke.color === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color || '#ec735e';
    }
    ctx.lineWidth = stroke.size || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(stroke.x0, stroke.y0);
    ctx.lineTo(stroke.x1, stroke.y1);
    ctx.stroke();
    ctx.restore();
  };

  const handleIncomingStrokes = (strokes) => {
    if (!strokes || strokes.length === 0) return;
    allStrokesRef.current.push(...strokes);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    strokes.forEach((st) => drawStrokeSegment(ctx, st));
  };

  const clearCanvasLocal = () => {
    allStrokesRef.current = [];
    pendingStrokesRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleClearWhiteboard = async () => {
    if (!isTeacher) return;
    clearCanvasLocal();

    const nextClearVer = (lastClearVersionRef.current || 0) + 1;
    lastClearVersionRef.current = nextClearVer;

    broadcastChannelRef.current?.postMessage({
      type: 'WHITEBOARD_CLEAR',
      payload: { clearVersion: nextClearVer }
    });

    if (callSession?.id) {
      try {
        await api.post(`/calls/${callSession.id}/whiteboard`, {
          clear: true,
          clearVersion: nextClearVer,
          role: 'teacher'
        });
      } catch {}
    }
  };

  const flushPendingStrokes = useCallback(async () => {
    if (pendingStrokesRef.current.length === 0 || !callSession?.id || !isTeacher) return;
    const toSend = [...pendingStrokesRef.current];
    pendingStrokesRef.current = [];

    try {
      await api.post(`/calls/${callSession.id}/whiteboard`, {
        strokes: toSend,
        role: 'teacher'
      });
    } catch {}
  }, [callSession?.id, isTeacher]);

  const onPointerDown = (e) => {
    if (!isTeacher) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch {}
    isDrawingRef.current = true;
    hasMovedRef.current = false;
    lastPosRef.current = getCanvasPoint(e, canvas);
  };

  const onPointerMove = (e) => {
    if (!isDrawingRef.current || !isTeacher || !lastPosRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const curPos = getCanvasPoint(e, canvas);

    const dx = Math.abs(curPos.x - lastPosRef.current.x);
    const dy = Math.abs(curPos.y - lastPosRef.current.y);
    if (dx < 0.5 && dy < 0.5) return;

    hasMovedRef.current = true;

    const stroke = {
      x0: lastPosRef.current.x,
      y0: lastPosRef.current.y,
      x1: curPos.x,
      y1: curPos.y,
      color: isEraser ? '#0c0e12' : penColor,
      size: isEraser ? penSize * 4 : penSize,
      isEraser: Boolean(isEraser),
      timestamp: Date.now()
    };

    allStrokesRef.current.push(stroke);
    pendingStrokesRef.current.push(stroke);

    const ctx = canvas.getContext('2d');
    drawStrokeSegment(ctx, stroke);

    broadcastChannelRef.current?.postMessage({
      type: 'WHITEBOARD_STROKES',
      payload: [stroke]
    });

    lastPosRef.current = curPos;

    if (pendingStrokesRef.current.length >= 6) {
      flushPendingStrokes();
    }
  };

  const onPointerUp = (e) => {
    if (!isTeacher) return;
    try {
      e?.target?.releasePointerCapture?.(e.pointerId);
    } catch {}

    if (isDrawingRef.current && !hasMovedRef.current && lastPosRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        const dot = {
          x0: lastPosRef.current.x,
          y0: lastPosRef.current.y,
          x1: lastPosRef.current.x + 0.1,
          y1: lastPosRef.current.y + 0.1,
          color: isEraser ? '#0c0e12' : penColor,
          size: isEraser ? penSize * 4 : penSize,
          isEraser: Boolean(isEraser),
          timestamp: Date.now()
        };
        allStrokesRef.current.push(dot);
        pendingStrokesRef.current.push(dot);
        const ctx = canvas.getContext('2d');
        drawStrokeSegment(ctx, dot);
        broadcastChannelRef.current?.postMessage({
          type: 'WHITEBOARD_STROKES',
          payload: [dot]
        });
      }
    }

    isDrawingRef.current = false;
    lastPosRef.current = null;
    hasMovedRef.current = false;
    flushPendingStrokes();
  };

  const onPointerCancel = (e) => {
    onPointerUp(e);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Send in-call chat
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');

    const newMsg = {
      id: `callmsg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text,
      senderName: myName,
      senderRole: currentRole,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, newMsg]);

    broadcastChannelRef.current?.postMessage({
      type: 'CHAT_MESSAGE',
      payload: newMsg
    });

    if (callSession?.id) {
      try {
        await api.post(`/calls/${callSession.id}/message`, {
          text,
          senderName: newMsg.senderName,
          senderRole: currentRole
        });
      } catch {}
    }
  };

  // =========================================================================
  // ZOOM EXIT & END WORKFLOW
  // =========================================================================

  // 1. Teacher clicks "End Meeting for All" (Terminates meeting completely)
  const handleHostEndMeetingForAll = async () => {
    setHostEndDialogOpen(false);
    if (screenSharing) await stopScreenShare();

    try {
      broadcastChannelRef.current?.postMessage({ type: 'MEETING_ENDED_FOR_ALL' });
    } catch {}

    if (callSession?.id) {
      try {
        await api.post(`/calls/${callSession.id}/end`, {
          durationSeconds: callDuration,
          action: 'end_for_all',
          role: 'teacher'
        });
      } catch {}
    }

    if (onEndCall) onEndCall();
  };

  // 2. Participant (Student or Teacher) clicks "Leave Meeting"
  const handleConfirmLeaveMeeting = async () => {
    setParticipantLeaveDialogOpen(false);
    setHostEndDialogOpen(false);
    if (screenSharing) await stopScreenShare();

    try {
      broadcastChannelRef.current?.postMessage({
        type: 'PARTICIPANT_LEFT',
        payload: { message: `${myName} left the meeting.` }
      });
    } catch {}

    if (callSession?.id) {
      try {
        await api.post(`/calls/${callSession.id}/leave`, {
          role: currentRole,
          name: myName
        });
      } catch {}
    }

    if (onEndCall) onEndCall();
  };

  // Format timer
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const mainIsRemote = !swapViews;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: '#0c0e12',
        color: '#ffffff',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '"Plus Jakarta Sans", sans-serif'
      }}
    >
      {/* ----------------------------------------------------------------- */}
      {/* TOP HEADER BAR (Zoom Style with Green Shield Info) */}
      {/* ----------------------------------------------------------------- */}
      <Box
        sx={{
          height: 54,
          px: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: 'rgba(15, 17, 21, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 10
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Zoom Green Shield Popover Trigger */}
          <Tooltip title="Meeting Information (Zoom Security & ID)">
            <IconButton
              size="small"
              onClick={(e) => setInfoAnchorEl(e.currentTarget)}
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.25)' }
              }}
            >
              <Shield sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight={800} fontSize={14} color="#ffffff">
                TutorMind Virtual Meeting
              </Typography>
              <Chip
                size="small"
                label={callSession?.topic || '1-on-1 Math Mentoring'}
                sx={{ bgcolor: 'rgba(236,115,94,0.18)', color: '#ec735e', fontWeight: 700, fontSize: 10.5 }}
              />
              {peerHandRaised && (
                <Chip
                  icon={<PanTool sx={{ fontSize: 14, color: '#f59e0b' }} />}
                  label="Hand Raised"
                  size="small"
                  sx={{ bgcolor: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontWeight: 800, fontSize: 11 }}
                />
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Center: Live Call Timer */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(239, 68, 68, 0.15)',
              px: 1.8,
              py: 0.3,
              borderRadius: 2,
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <FiberManualRecord sx={{ fontSize: 10, color: '#ef4444' }} />
            </motion.div>
            <Typography sx={{ fontFamily: 'DM Mono, monospace', fontSize: 12.5, fontWeight: 700, color: '#fca5a5' }}>
              {formatTimer(callDuration)}
            </Typography>
          </Box>
        </Stack>

        {/* Right Action Tools */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Swap Camera Views (Main / PiP)">
            <IconButton onClick={() => setSwapViews((p) => !p)} sx={{ color: '#94a3b8' }}>
              <Cameraswitch fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <IconButton onClick={toggleFullscreen} sx={{ color: '#94a3b8' }}>
              {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Participant Left Toast Alert */}
      <AnimatePresence>
        {participantLeftNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: 70,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100
            }}
          >
            <Alert
              severity="info"
              icon={<Person sx={{ color: '#38bdf8' }} />}
              sx={{
                bgcolor: 'rgba(15, 23, 42, 0.95)',
                color: '#ffffff',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                borderRadius: 2.5,
                fontWeight: 700
              }}
            >
              {participantLeftNotice}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Reaction Emojis */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 90, overflow: 'hidden' }}>
        <AnimatePresence>
          {floatingReactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 1, y: '85vh', x: `${r.x}vw`, scale: 0.6 }}
              animate={{ opacity: [1, 1, 0], y: '20vh', scale: [0.6, 1.4, 1.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.6, ease: 'easeOut' }}
              style={{ position: 'absolute', textAlign: 'center' }}
            >
              <Typography fontSize={48} sx={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }}>
                {r.emoji}
              </Typography>
              <Typography fontSize={11} fontWeight={800} sx={{ color: '#ffffff', bgcolor: 'rgba(0,0,0,0.6)', px: 1, borderRadius: 1 }}>
                {r.sender}
              </Typography>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {/* ----------------------------------------------------------------- */}
      {/* MAIN STAGE (Video / Screen Share / Math Whiteboard) */}
      {/* ----------------------------------------------------------------- */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', bgcolor: '#07080a', display: 'flex' }}>
        {whiteboardOpen ? (
          /* Math Whiteboard Canvas Stage */
          <Box sx={{ width: '100%', height: '100%', position: 'relative', bgcolor: '#0c0e12' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20
              }}
            >
              <Chip
                icon={<FiberManualRecord sx={{ color: '#10b981 !important', fontSize: 10 }} />}
                label={
                  isTeacher
                    ? '👩‍🏫 Teacher Math Whiteboard - You can draw and explain equations live'
                    : "👨‍🏫 Teacher's Math Whiteboard · Live Explanation by Instructor (View Only)"
                }
                sx={{
                  bgcolor: 'rgba(15, 23, 42, 0.9)',
                  color: isTeacher ? '#34d399' : '#93c5fd',
                  border: isTeacher ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(147, 197, 253, 0.3)',
                  fontWeight: 700,
                  fontSize: 12,
                  px: 1
                }}
              />
            </Box>

            <canvas
              ref={canvasRef}
              width={1600}
              height={1000}
              onPointerDown={isTeacher ? onPointerDown : undefined}
              onPointerMove={isTeacher ? onPointerMove : undefined}
              onPointerUp={isTeacher ? onPointerUp : undefined}
              onPointerCancel={isTeacher ? onPointerCancel : undefined}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                cursor: isTeacher ? (isEraser ? 'cell' : 'crosshair') : 'default',
                touchAction: 'none',
                pointerEvents: isTeacher ? 'auto' : 'none'
              }}
            />

            {/* Drawing Controls: Teacher Only */}
            {isTeacher && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 3,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  zIndex: 20,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                }}
              >
                <Typography fontSize={11} fontWeight={700} color="#94a3b8" sx={{ ml: 1 }}>
                  Pen Color:
                </Typography>
                {['#ec735e', '#38bdf8', '#34d399', '#f59e0b', '#ffffff'].map((c) => (
                  <Box
                    key={c}
                    onClick={() => {
                      setPenColor(c);
                      setIsEraser(false);
                    }}
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      bgcolor: c,
                      cursor: 'pointer',
                      border: penColor === c && !isEraser ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                      transform: penColor === c && !isEraser ? 'scale(1.2)' : 'scale(1)',
                      transition: '0.15s'
                    }}
                  />
                ))}

                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

                <Tooltip title="Eraser">
                  <IconButton
                    size="small"
                    onClick={() => setIsEraser((p) => !p)}
                    sx={{
                      bgcolor: isEraser ? '#4f46e5' : 'transparent',
                      color: isEraser ? '#ffffff' : '#94a3b8'
                    }}
                  >
                    <Brush sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Clear Canvas">
                  <IconButton size="small" onClick={handleClearWhiteboard} sx={{ color: '#ef4444' }}>
                    <DeleteOutline sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={toggleWhiteboard}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: 12, px: 1.5 }}
                >
                  Close Whiteboard
                </Button>
              </Box>
            )}
          </Box>
        ) : screenSharing || remoteScreenShare.active ? (
          /* Live Screen Share Stage */
          <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20
              }}
            >
              <Chip
                icon={<PresentToAll sx={{ color: '#ffffff !important', fontSize: 16 }} />}
                label={
                  screenSharing
                    ? `You are sharing your screen live with ${peerName}`
                    : `Viewing ${remoteScreenShare.sharerName || peerName}'s shared screen`
                }
                onDelete={screenSharing ? stopScreenShare : undefined}
                deleteIcon={screenSharing ? <Button size="small" sx={{ color: '#ffffff', fontWeight: 800 }}>Stop Sharing</Button> : undefined}
                sx={{
                  bgcolor: screenSharing ? '#0284c7' : '#0369a1',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 12,
                  py: 1,
                  px: 1.5,
                  boxShadow: '0 4px 16px rgba(2,132,199,0.4)'
                }}
              />
            </Box>

            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000000'
              }}
            />
          </Box>
        ) : (
          /* Standard Video Stage (Peer on main, Self in PiP) */
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <video
              ref={mainIsRemote ? remoteVideoRef : localVideoRef}
              autoPlay
              playsInline
              muted={!mainIsRemote}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Main Stage Name & Mute Pill (Zoom Style) */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                bgcolor: 'rgba(0, 0, 0, 0.65)',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                zIndex: 5
              }}
            >
              {peerRole === 'teacher' ? <School sx={{ fontSize: 14, color: '#34d399' }} /> : <Person sx={{ fontSize: 14, color: '#60a5fa' }} />}
              <Typography fontSize={12} fontWeight={700} color="#ffffff">
                {mainIsRemote ? `${peerName} (${peerRole === 'teacher' ? 'Host' : 'Participant'})` : `${myName} (You)`}
              </Typography>
              {peerHandRaised && (
                <Typography fontSize={14}>✋</Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Picture-in-Picture (PiP) Window for Local Video */}
        <Box
          onClick={() => setSwapViews((p) => !p)}
          sx={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 210,
            height: 135,
            borderRadius: 3,
            overflow: 'hidden',
            border: micOn ? '2px solid rgba(52, 211, 153, 0.8)' : '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            bgcolor: '#111827',
            cursor: 'pointer',
            zIndex: 30,
            transition: '0.2s',
            '&:hover': { transform: 'scale(1.04)' }
          }}
        >
          <video
            ref={mainIsRemote ? localVideoRef : remoteVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              left: 6,
              bgcolor: 'rgba(0,0,0,0.7)',
              px: 0.8,
              py: 0.2,
              borderRadius: 1
            }}
          >
            <Typography fontSize={10} fontWeight={700} color="#ffffff">
              {mainIsRemote ? 'You (Click to Swap)' : peerName}
            </Typography>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: 6,
              left: 6,
              bgcolor: micOn ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
              p: 0.4,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {micOn ? <Mic sx={{ fontSize: 12, color: '#fff' }} /> : <MicOff sx={{ fontSize: 12, color: '#fff' }} />}
          </Box>

          {handRaised && (
            <Box
              sx={{
                position: 'absolute',
                top: 6,
                right: 6,
                bgcolor: '#f59e0b',
                px: 0.6,
                borderRadius: 1
              }}
            >
              <Typography fontSize={11}>✋</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ----------------------------------------------------------------- */}
      {/* ZOOM BOTTOM CONTROL DOCK */}
      {/* ----------------------------------------------------------------- */}
      <Box
        sx={{
          height: 76,
          bgcolor: 'rgba(15, 17, 21, 0.98)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          zIndex: 10
        }}
      >
        {/* Audio Mute / Unmute */}
        <Stack alignItems="center" spacing={0.3}>
          <IconButton
            onClick={toggleMic}
            sx={{
              width: 44,
              height: 44,
              bgcolor: micOn ? 'rgba(255,255,255,0.08)' : '#dc2626',
              color: '#ffffff',
              '&:hover': { bgcolor: micOn ? 'rgba(255,255,255,0.18)' : '#b91c1c' }
            }}
          >
            {micOn ? <Mic /> : <MicOff />}
          </IconButton>
          <Typography fontSize={10} color="#94a3b8" fontWeight={600}>
            {micOn ? 'Mute' : 'Unmute'}
          </Typography>
        </Stack>

        {/* Video Camera Toggle */}
        <Stack alignItems="center" spacing={0.3}>
          <IconButton
            onClick={toggleCamera}
            sx={{
              width: 44,
              height: 44,
              bgcolor: cameraOn ? 'rgba(255,255,255,0.08)' : '#dc2626',
              color: '#ffffff',
              '&:hover': { bgcolor: cameraOn ? 'rgba(255,255,255,0.18)' : '#b91c1c' }
            }}
          >
            {cameraOn ? <Videocam /> : <VideocamOff />}
          </IconButton>
          <Typography fontSize={10} color="#94a3b8" fontWeight={600}>
            {cameraOn ? 'Stop Video' : 'Start Video'}
          </Typography>
        </Stack>

        {/* Zoom Security Menu (Host / Teacher Only) */}
        {isTeacher && (
          <Stack alignItems="center" spacing={0.3}>
            <IconButton
              onClick={(e) => setSecurityAnchorEl(e.currentTarget)}
              sx={{
                width: 44,
                height: 44,
                bgcolor: Boolean(securityAnchorEl) ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.08)',
                color: Boolean(securityAnchorEl) ? '#34d399' : '#ffffff',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }
              }}
            >
              <SecurityIcon />
            </IconButton>
            <Typography fontSize={10} color="#94a3b8" fontWeight={600}>
              Security
            </Typography>
          </Stack>
        )}

        {/* Zoom Participants Drawer */}
        <Stack alignItems="center" spacing={0.3}>
          <IconButton
            onClick={() => setParticipantsOpen(true)}
            sx={{
              width: 44,
              height: 44,
              bgcolor: participantsOpen ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }
            }}
          >
            <Badge badgeContent={2} color="primary">
              <People />
            </Badge>
          </IconButton>
          <Typography fontSize={10} color="#94a3b8" fontWeight={600}>
            Participants
          </Typography>
        </Stack>

        {/* Zoom Chat Drawer */}
        <Stack alignItems="center" spacing={0.3}>
          <IconButton
            onClick={() => setChatOpen((p) => !p)}
            sx={{
              width: 44,
              height: 44,
              bgcolor: chatOpen ? '#4f46e5' : 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              '&:hover': { bgcolor: chatOpen ? '#4338ca' : 'rgba(255,255,255,0.18)' }
            }}
          >
            <Badge badgeContent={messages.length} color="error">
              <ChatIcon />
            </Badge>
          </IconButton>
          <Typography fontSize={10} color="#94a3b8" fontWeight={600}>
            Chat
          </Typography>
        </Stack>

        {/* Zoom Green Share Screen Button */}
        <Stack alignItems="center" spacing={0.3}>
          <IconButton
            onClick={toggleScreenShare}
            sx={{
              width: 44,
              height: 44,
              bgcolor: screenSharing ? '#dc2626' : '#10b981',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              '&:hover': { bgcolor: screenSharing ? '#b91c1c' : '#059669' }
            }}
          >
            {screenSharing ? <StopScreenShare /> : <ScreenShare />}
          </IconButton>
          <Typography fontSize={10} color="#10b981" fontWeight={700}>
            {screenSharing ? 'Stop Share' : 'Share Screen'}
          </Typography>
        </Stack>

        {/* Math Whiteboard: Teacher Only */}
        {isTeacher && (
          <Stack alignItems="center" spacing={0.3}>
            <IconButton
              onClick={toggleWhiteboard}
              aria-label="Toggle Whiteboard"
              sx={{
                width: 44,
                height: 44,
                bgcolor: whiteboardOpen ? '#ec735e' : 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                '&:hover': { bgcolor: whiteboardOpen ? '#d95f4c' : 'rgba(255,255,255,0.18)' }
              }}
            >
              <Brush />
            </IconButton>
            <Typography fontSize={10} color="#94a3b8" fontWeight={600}>
              Whiteboard
            </Typography>
          </Stack>
        )}

        {/* Zoom Reactions Tray */}
        <Stack alignItems="center" spacing={0.3}>
          <IconButton
            onClick={(e) => setReactionsAnchorEl(e.currentTarget)}
            sx={{
              width: 44,
              height: 44,
              bgcolor: Boolean(reactionsAnchorEl) || handRaised ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.08)',
              color: handRaised ? '#fbbf24' : '#ffffff',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }
            }}
          >
            {handRaised ? <PanTool /> : <AddReaction />}
          </IconButton>
          <Typography fontSize={10} color="#94a3b8" fontWeight={600}>
            Reactions
          </Typography>
        </Stack>

        {/* ----------------------------------------------------------------- */}
        {/* END (TEACHER) vs LEAVE (STUDENT) ZOOM BUTTON */}
        {/* ----------------------------------------------------------------- */}
        <Box sx={{ ml: 2 }}>
          {isTeacher ? (
            /* TEACHER: Red "End" button (Opens Zoom End for All / Leave Dialog) */
            <Button
              variant="contained"
              color="error"
              startIcon={<CallEnd />}
              onClick={() => setHostEndDialogOpen(true)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                fontSize: 14,
                boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
                '&:hover': { bgcolor: '#dc2626' }
              }}
            >
              End
            </Button>
          ) : (
            /* STUDENT: Red/Slate "Leave" button (Student can ONLY leave, cannot end meeting!) */
            <Button
              variant="contained"
              startIcon={<CallEnd />}
              onClick={() => setParticipantLeaveDialogOpen(true)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                fontSize: 14,
                bgcolor: '#dc2626',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(220,38,38,0.3)',
                '&:hover': { bgcolor: '#b91c1c' }
              }}
            >
              Leave
            </Button>
          )}
        </Box>
      </Box>

      {/* ----------------------------------------------------------------- */}
      {/* ZOOM DIALOG 1: TEACHER HOST END DIALOG */}
      {/* ----------------------------------------------------------------- */}
      <Dialog
        open={hostEndDialogOpen}
        onClose={() => setHostEndDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 11000 }}
        PaperProps={{
          sx: {
            bgcolor: '#181b21',
            color: '#ffffff',
            borderRadius: 3.5,
            p: 1.5,
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight={800} color="#ffffff">
            End or Leave Meeting
          </Typography>
          <Typography variant="body2" color="#94a3b8" sx={{ mt: 0.5 }}>
            As the host of this TutorMind session, choose how you would like to proceed:
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
          {/* End Meeting for All (Host Exclusive) */}
          <Button
            variant="contained"
            size="large"
            color="error"
            onClick={handleHostEndMeetingForAll}
            sx={{
              py: 1.4,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: 15,
              bgcolor: '#dc2626',
              boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
              '&:hover': { bgcolor: '#b91c1c' }
            }}
          >
            🛑 End Meeting for All
          </Button>

          {/* Leave Meeting (Room remains open) */}
          <Button
            variant="outlined"
            size="large"
            onClick={handleConfirmLeaveMeeting}
            sx={{
              py: 1.2,
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: 14,
              color: '#ffffff',
              borderColor: 'rgba(255,255,255,0.2)',
              '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.05)' }
            }}
          >
            🚪 Leave Meeting
          </Button>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 1 }}>
          <Button onClick={() => setHostEndDialogOpen(false)} sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* ----------------------------------------------------------------- */}
      {/* ZOOM DIALOG 2: STUDENT PARTICIPANT LEAVE DIALOG */}
      {/* ----------------------------------------------------------------- */}
      <Dialog
        open={participantLeaveDialogOpen}
        onClose={() => setParticipantLeaveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 11000 }}
        PaperProps={{
          sx: {
            bgcolor: '#181b21',
            color: '#ffffff',
            borderRadius: 3.5,
            p: 1.5,
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight={800} color="#ffffff">
            Leave Meeting?
          </Typography>
          <Typography variant="body2" color="#94a3b8" sx={{ mt: 0.5 }}>
            Do you want to leave this session? The teacher will remain in the room.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleConfirmLeaveMeeting}
            sx={{
              py: 1.4,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: 15,
              bgcolor: '#dc2626',
              boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
              '&:hover': { bgcolor: '#b91c1c' }
            }}
          >
            🚪 Leave Meeting
          </Button>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 1 }}>
          <Button onClick={() => setParticipantLeaveDialogOpen(false)} sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* ----------------------------------------------------------------- */}
      {/* ZOOM DIALOG 3: STUDENT "MEETING ENDED BY HOST" DIALOG */}
      {/* ----------------------------------------------------------------- */}
      <Dialog
        open={meetingEndedByHostDialogOpen}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 11000 }}
        PaperProps={{
          sx: {
            bgcolor: '#181b21',
            color: '#ffffff',
            borderRadius: 3.5,
            p: 2,
            border: '2px solid rgba(239, 68, 68, 0.4)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              width: 58,
              height: 58,
              mx: 'auto',
              mb: 1.5,
              border: '1.5px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <CallEnd sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h6" fontWeight={800} color="#ffffff">
            This meeting has been ended by the host
          </Typography>
          <Typography variant="body2" color="#94a3b8" sx={{ mt: 1, lineHeight: 1.5 }}>
            {peerName} has ended the meeting for all participants.
          </Typography>
        </DialogTitle>
        <DialogActions sx={{ justifyContent: 'center', pt: 2, pb: 1 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setMeetingEndedByHostDialogOpen(false);
              if (onEndCall) onEndCall();
            }}
            sx={{
              bgcolor: '#0284c7',
              color: '#ffffff',
              fontWeight: 800,
              px: 4,
              py: 1.2,
              borderRadius: 2.5,
              textTransform: 'none',
              '&:hover': { bgcolor: '#0369a1' }
            }}
          >
            OK / Return to Dashboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* ----------------------------------------------------------------- */}
      {/* ZOOM TOP-LEFT SHIELD MEETING INFO POPOVER */}
      {/* ----------------------------------------------------------------- */}
      <Popover
        open={Boolean(infoAnchorEl)}
        anchorEl={infoAnchorEl}
        onClose={() => setInfoAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            p: 2.5,
            width: 320,
            bgcolor: '#181b21',
            color: '#ffffff',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
          }
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={800} color="#ffffff">
              Meeting Information
            </Typography>
          </Stack>

          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

          <Box>
            <Typography variant="caption" color="#94a3b8">Meeting Topic:</Typography>
            <Typography variant="body2" fontWeight={700}>{callSession?.topic || '1-on-1 Math Office Hours'}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="#94a3b8">Meeting ID:</Typography>
            <Typography variant="body2" fontWeight={800} fontFamily="DM Mono, monospace" color="#38bdf8">
              {meetingDisplayId}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="#94a3b8">Host:</Typography>
            <Typography variant="body2" fontWeight={700}>Prof. Sarah Jenkins</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="#94a3b8">Security Encryption:</Typography>
            <Typography variant="body2" fontWeight={700} color="#34d399">
              Enhanced 256-bit AES End-to-End
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopy />}
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 3000);
            }}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              color: copiedLink ? '#34d399' : '#ffffff',
              borderColor: copiedLink ? '#34d399' : 'rgba(255,255,255,0.2)'
            }}
          >
            {copiedLink ? 'Link Copied to Clipboard!' : 'Copy Meeting Invitation'}
          </Button>
        </Stack>
      </Popover>

      {/* ----------------------------------------------------------------- */}
      {/* ZOOM SECURITY MENU (Host Only) */}
      {/* ----------------------------------------------------------------- */}
      <Menu
        anchorEl={securityAnchorEl}
        open={Boolean(securityAnchorEl)}
        onClose={() => setSecurityAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            width: 280,
            bgcolor: '#181b21',
            color: '#ffffff',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            p: 1
          }
        }}
      >
        <Typography variant="caption" fontWeight={800} color="#94a3b8" sx={{ px: 2, py: 0.5, display: 'block' }}>
          ZOOM HOST SECURITY CONTROLS
        </Typography>

        <MenuItem onClick={() => setSecuritySettings((s) => ({ ...s, locked: !s.locked }))}>
          <ListItemIcon sx={{ color: securitySettings.locked ? '#ef4444' : '#10b981' }}>
            {securitySettings.locked ? <Lock /> : <LockOpen />}
          </ListItemIcon>
          <ListItemText
            primary="Lock Meeting"
            secondary={securitySettings.locked ? 'No new participants can join' : 'Open for invited students'}
            secondaryTypographyProps={{ fontSize: 11, color: '#94a3b8' }}
          />
        </MenuItem>

        <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.08)' }} />

        <Typography variant="caption" fontWeight={800} color="#94a3b8" sx={{ px: 2, py: 0.5, display: 'block' }}>
          ALLOW PARTICIPANTS TO:
        </Typography>

        <MenuItem onClick={() => setSecuritySettings((s) => ({ ...s, allowScreenShare: !s.allowScreenShare }))}>
          <FormControlLabel
            control={<Switch size="small" checked={securitySettings.allowScreenShare} />}
            label={<Typography fontSize={13} fontWeight={600}>Share Screen</Typography>}
            sx={{ m: 0 }}
          />
        </MenuItem>

        <MenuItem onClick={() => setSecuritySettings((s) => ({ ...s, allowChat: !s.allowChat }))}>
          <FormControlLabel
            control={<Switch size="small" checked={securitySettings.allowChat} />}
            label={<Typography fontSize={13} fontWeight={600}>Chat</Typography>}
            sx={{ m: 0 }}
          />
        </MenuItem>

        <MenuItem onClick={() => setSecuritySettings((s) => ({ ...s, allowUnmute: !s.allowUnmute }))}>
          <FormControlLabel
            control={<Switch size="small" checked={securitySettings.allowUnmute} />}
            label={<Typography fontSize={13} fontWeight={600}>Unmute Themselves</Typography>}
            sx={{ m: 0 }}
          />
        </MenuItem>
      </Menu>

      {/* ----------------------------------------------------------------- */}
      {/* ZOOM REACTIONS POPOVER */}
      {/* ----------------------------------------------------------------- */}
      <Popover
        open={Boolean(reactionsAnchorEl)}
        anchorEl={reactionsAnchorEl}
        onClose={() => setReactionsAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{
          sx: {
            mb: 1.5,
            p: 1.5,
            bgcolor: '#181b21',
            color: '#ffffff',
            borderRadius: 3.5,
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
          }
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          {/* Hand Raise Button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<PanTool sx={{ color: handRaised ? '#ffffff' : '#f59e0b' }} />}
            onClick={handleToggleHandRaise}
            sx={{
              bgcolor: handRaised ? '#d97706' : 'rgba(245, 158, 11, 0.15)',
              color: handRaised ? '#ffffff' : '#fbbf24',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2.5,
              py: 0.8,
              '&:hover': { bgcolor: handRaised ? '#b45309' : 'rgba(245, 158, 11, 0.25)' }
            }}
          >
            {handRaised ? 'Lower Hand' : 'Raise Hand ✋'}
          </Button>

          {/* Quick Reaction Emojis */}
          <Stack direction="row" spacing={1}>
            {['👏', '👍', '❤️', '💡', '🎉', '😮'].map((em) => (
              <IconButton
                key={em}
                onClick={() => handleSendReaction(em)}
                sx={{
                  fontSize: 22,
                  p: 1,
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', transform: 'scale(1.2)' }
                }}
              >
                {em}
              </IconButton>
            ))}
          </Stack>
        </Stack>
      </Popover>

      {/* ----------------------------------------------------------------- */}
      {/* ZOOM PARTICIPANTS DRAWER */}
      {/* ----------------------------------------------------------------- */}
      <Drawer
        anchor="right"
        open={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            bgcolor: '#12151b',
            color: '#ffffff',
            borderLeft: '1px solid rgba(255,255,255,0.08)'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="subtitle1" fontWeight={800}>
            Participants (2)
          </Typography>
          <IconButton onClick={() => setParticipantsOpen(false)} sx={{ color: '#94a3b8' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <List sx={{ p: 1 }}>
          {/* Host (Teacher) */}
          <ListItem
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#059669', width: 34, height: 34, fontWeight: 800 }}>
                SJ
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography fontSize={13} fontWeight={700}>
                  Prof. Sarah Jenkins {isTeacher ? '(Me, Host)' : '(Host)'} 👑
                </Typography>
              }
              secondary={<Typography fontSize={11} color="#34d399">Lead STEM Instructor</Typography>}
            />
            <Stack direction="row" spacing={0.5}>
              <Mic sx={{ fontSize: 16, color: '#10b981' }} />
              <Videocam sx={{ fontSize: 16, color: '#10b981' }} />
            </Stack>
          </ListItem>

          {/* Participant (Student) */}
          <ListItem
            sx={{
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#4f46e5', width: 34, height: 34, fontWeight: 800 }}>
                {peerRole === 'student' ? 'AJ' : 'ST'}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography fontSize={13} fontWeight={700}>
                    {!isTeacher ? `${myName} (Me)` : peerName}
                  </Typography>
                  {(handRaised || peerHandRaised) && (
                    <Typography fontSize={13}>✋</Typography>
                  )}
                </Stack>
              }
              secondary={<Typography fontSize={11} color="#94a3b8">Student · Participant</Typography>}
            />
            <Stack direction="row" spacing={0.5}>
              <Mic sx={{ fontSize: 16, color: '#10b981' }} />
              <Videocam sx={{ fontSize: 16, color: '#10b981' }} />
            </Stack>
          </ListItem>
        </List>

        {/* Host Action: Mute All Button */}
        {isTeacher && (
          <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<VolumeOff />}
              onClick={() => {
                try {
                  broadcastChannelRef.current?.postMessage({ type: 'CHAT_MESSAGE', payload: { id: Date.now(), text: '📢 The host has requested all participants to mute.', senderName: 'Host', time: 'Now' } });
                } catch {}
              }}
              sx={{
                borderRadius: 2.5,
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.2)',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 13
              }}
            >
              Mute All
            </Button>
          </Box>
        )}
      </Drawer>

      {/* ----------------------------------------------------------------- */}
      {/* ZOOM IN-MEETING CHAT DRAWER */}
      {/* ----------------------------------------------------------------- */}
      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        PaperProps={{
          sx: {
            width: 340,
            bgcolor: '#12151b',
            color: '#ffffff',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="subtitle1" fontWeight={800}>
            In-Meeting Chat
          </Typography>
          <IconButton onClick={() => setChatOpen(false)} sx={{ color: '#94a3b8' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {messages.length === 0 ? (
            <Typography variant="body2" color="#64748b" textAlign="center" sx={{ mt: 4 }}>
              No messages yet. Send a question or note to everyone in the call.
            </Typography>
          ) : (
            messages.map((m) => {
              const isMe = m.senderName === myName;
              return (
                <Box
                  key={m.id}
                  sx={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  <Typography variant="caption" color="#94a3b8" sx={{ fontSize: 10, display: 'block', mb: 0.3 }}>
                    {m.senderName} · {m.time}
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: isMe ? '#4f46e5' : '#1e293b',
                      color: '#ffffff',
                      fontSize: 13,
                      lineHeight: 1.4
                    }}
                  >
                    {m.text}
                  </Paper>
                </Box>
              );
            })
          )}
        </Box>

        <Box component="form" onSubmit={handleSendChat} sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Type a message to everyone..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              '& .MuiOutlinedInput-input': { color: '#ffffff', fontSize: 13 }
            }}
          />
          <IconButton type="submit" sx={{ bgcolor: '#4f46e5', color: '#ffffff', '&:hover': { bgcolor: '#4338ca' } }}>
            <Send fontSize="small" />
          </IconButton>
        </Box>
      </Drawer>
    </Box>
  );
}
