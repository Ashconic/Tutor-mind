import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  IconButton,
  Divider,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Alert,
  Dialog,
  CircularProgress,
  TextField
} from '@mui/material';
import {
  Close,
  MenuBook,
  Functions,
  Lightbulb,
  WarningAmber,
  Quiz,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  Psychology,
  School,
  Timer,
  Speed,
  AutoAwesome,
  Replay,
  HelpOutline,
  SmartToy,
  EmojiEvents,
  Refresh,
  Stars,
  Send,
  DeleteOutline,
  OpenInNew,
  Fullscreen,
  FullscreenExit,
  PlayCircleOutline,
  YouTube
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import MathMessage from './MathMessage';
import ChapterDiagram from './ChapterDiagram';
import {
  getTextbookChapter,
  getTextbookChapterById,
  SUBJECT_THEMES,
  getAdjacentChapters
} from '../data/textbookData';
import { getVideosForChapter } from '../data/chapterVideos';
import { useTranslation } from '../i18n/LanguageContext';

export default function TextbookReader({
  chapter: initialChapter,
  user,
  onClose,
  onToast,
  onCompleteQuiz,
  onAskTutor
}) {
  const { t } = useTranslation();

  // Load detailed chapter data from textbook data engine
  const [currentChapterId, setCurrentChapterId] = useState(() => {
    if (!initialChapter) return null;
    if (typeof initialChapter === 'string') return initialChapter;
    return `${initialChapter.topic}:${initialChapter.title}`;
  });

  useEffect(() => {
    if (initialChapter) {
      const id = typeof initialChapter === 'string' ? initialChapter : `${initialChapter.topic}:${initialChapter.title}`;
      setCurrentChapterId(id);
    }
  }, [initialChapter]);

  const [activeTab, setActiveTab] = useState('theory'); // 'theory' | 'formulas' | 'examples' | 'pitfalls' | 'quiz'
  const [isFullScreen, setIsFullScreen] = useState(true);
  // --- ADAPTIVE AI QUIZ ENGINE STATE ---
  const [aiQuizState, setAiQuizState] = useState({
    questionNumber: 1,
    totalQuestions: 3,
    currentQuestion: null,
    loading: false,
    selectedOption: null,
    isChecked: false,
    isCorrect: false,
    score: 0,
    completed: false,
    awarded: false,
    whyWrongText: '',
    attemptCount: 0,
    aiExplanation: '',
    aiExplanationLoading: false
  });

  const fetchAIExplanation = async (q, selected) => {
    if (!q || !selected) return;
    setAiQuizState((prev) => ({ ...prev, aiExplanationLoading: true, aiExplanation: '' }));
    try {
      const topicName = chapterData?.topic || 'Mathematics';
      const chTitle = chapterData?.title || currentChapterId || 'Chapter';
      const res = await api.post('/ai/quiz/explain-failure', {
        question: String(q?.question || ''),
        selectedOption: String(selected || ''),
        correctOption: String(q?.answer || ''),
        chapterTitle: chTitle,
        topic: topicName,
        concept: q?.concept || ''
      });
      if (res.data?.explanation) {
        setAiQuizState((prev) => ({
          ...prev,
          aiExplanation: typeof res.data.explanation === 'string' ? res.data.explanation : JSON.stringify(res.data.explanation),
          aiExplanationLoading: false
        }));
      } else {
        setAiQuizState((prev) => ({ ...prev, aiExplanationLoading: false }));
      }
    } catch {
      setAiQuizState((prev) => ({ ...prev, aiExplanationLoading: false }));
    }
  };

  const isOptionCorrect = (selected, answer) => {
    if (selected === null || selected === undefined || answer === null || answer === undefined) return false;
    const sSel = String(selected).trim();
    const sAns = String(answer).trim();
    if (sSel === sAns) return true;
    const cleanSel = sSel.replace(/^[A-D][\.\)]\s*/i, '').trim();
    const cleanAns = sAns.replace(/^[A-D][\.\)]\s*/i, '').trim();
    if (cleanSel === cleanAns) return true;
    const stripMath = (s) => String(s || '').replace(/[\$\s\\]/g, '').trim();
    return stripMath(cleanSel) === stripMath(cleanAns);
  };

  const getWhyWrongReason = (selected, whyWrong) => {
    if (!selected || !whyWrong || typeof whyWrong !== 'object') return null;
    const sSel = String(selected).trim();
    if (whyWrong[sSel]) return typeof whyWrong[sSel] === 'string' ? whyWrong[sSel] : JSON.stringify(whyWrong[sSel]);
    const cleanSel = sSel.replace(/^[A-D][\.\)]\s*/i, '').trim();
    for (const [k, v] of Object.entries(whyWrong)) {
      const cleanK = String(k).replace(/^[A-D][\.\)]\s*/i, '').trim();
      if (cleanK === cleanSel || cleanK.replace(/[\$\s\\]/g, '') === cleanSel.replace(/[\$\s\\]/g, '')) {
        return typeof v === 'string' ? v : JSON.stringify(v);
      }
    }
    return null;
  };

  const loadAIQuestion = async (qNum = 1) => {
    if (!chapterData) return;
    setAiQuizState((prev) => ({
      ...prev,
      questionNumber: qNum,
      loading: true,
      selectedOption: null,
      isChecked: false,
      isCorrect: false,
      whyWrongText: '',
      aiExplanation: '',
      aiExplanationLoading: false
    }));

    const difficultyTier = qNum === 1 ? 'Foundational' : qNum === 2 ? 'Intermediate' : 'Advanced';
    const studentLevel = user?.level || 1;

    try {
      const res = await api.post('/ai/quiz/generate', {
        topic: chapterData.topic,
        chapterTitle: chapterData.title,
        chapterOverview: chapterData.overview || '',
        studentLevel,
        questionNumber: qNum,
        totalQuestions: 3,
        difficultyTier
      });

      if (res.data?.question) {
        setAiQuizState((prev) => ({
          ...prev,
          questionNumber: qNum,
          currentQuestion: res.data.question,
          loading: false
        }));
        return;
      }
    } catch (err) {
      console.warn('AI quiz generation endpoint error, falling back to chapter curriculum:', err);
    }

    // Curated fallback
    const localQuizList = chapterData.quiz || [];
    const localQ = localQuizList.length > 0 ? localQuizList[(qNum - 1) % localQuizList.length] : null;
    if (localQ) {
      setAiQuizState((prev) => ({
        ...prev,
        questionNumber: qNum,
        currentQuestion: {
          id: `fallback-${qNum}`,
          questionNumber: qNum,
          totalQuestions: 3,
          difficulty: difficultyTier,
          question: localQ.question,
          options: localQ.options,
          answer: localQ.answer,
          concept: chapterData.title,
          explanation: localQ.explanation || 'Apply inverse operations or the core theorem to solve for the unknown.',
          stepByStepSolution: [
            `Step 1: Read the problem carefully and identify the given quantities.`,
            `Step 2: Recall the primary equation or rule for ${chapterData.title}.`,
            `Step 3: Solve algebraically to arrive at the correct result: ${localQ.answer}.`
          ],
          whyWrong: {}
        },
        loading: false
      }));
    } else {
      const def = chapterData.definitions?.[0];
      const fallbackQuestion = def
        ? `In ${chapterData.title}, what does the concept of "${def.term}" define?`
        : `Which statement is mathematically true regarding ${chapterData.title}?`;
      const fallbackAnswer = def ? def.meaning : `Every algebraic operation must preserve mathematical balance.`;
      const fallbackOptions = [
        fallbackAnswer,
        `Values can be estimated without applying exact properties.`,
        `Negative values should simply be ignored.`,
        `The inverse operation is always addition.`
      ];

      setAiQuizState((prev) => ({
        ...prev,
        questionNumber: qNum,
        currentQuestion: {
          id: `procedural-${qNum}`,
          questionNumber: qNum,
          totalQuestions: 3,
          difficulty: difficultyTier,
          question: fallbackQuestion,
          options: fallbackOptions,
          answer: fallbackAnswer,
          concept: chapterData.title,
          explanation: def ? `${def.term}: ${def.meaning}` : `Review the core concepts of ${chapterData.title}.`,
          stepByStepSolution: [
            `Step 1: Identify the fundamental concepts of ${chapterData.title}.`,
            `Step 2: Apply the formal mathematical definition.`,
            `Step 3: Conclude with the verified rule: ${fallbackAnswer}.`
          ],
          whyWrong: {}
        },
        loading: false
      }));
    }
  };

  const chapterData = useMemo(() => {
    if (!currentChapterId) return null;
    return getTextbookChapterById(currentChapterId) || (typeof initialChapter === 'object' ? initialChapter : null);
  }, [currentChapterId, initialChapter]);

  const completedChapterIds = user?.completedChapterIds || [];
  const isMastered = completedChapterIds.includes(currentChapterId);

  const theme = SUBJECT_THEMES[chapterData?.topic] || {
    color: '#ec735e',
    lightBg: '#fae8e2',
    icon: '📚'
  };

  const adjacent = useMemo(() => {
    return getAdjacentChapters(currentChapterId);
  }, [currentChapterId]);

  const chapterVideos = useMemo(() => {
    if (!chapterData) return [];
    return getVideosForChapter(chapterData.title, chapterData.topic || 'Mathematics');
  }, [chapterData]);

  // Reset quiz state when switching chapters
  useEffect(() => {
    setAiQuizState({
      questionNumber: 1,
      totalQuestions: 3,
      currentQuestion: null,
      loading: false,
      selectedOption: null,
      isChecked: false,
      isCorrect: false,
      score: 0,
      completed: false,
      awarded: false,
      whyWrongText: '',
      attemptCount: 0
    });
    setActiveTab('theory');
  }, [currentChapterId]);

  // Load question 1 on entering the quiz tab if not already loaded
  useEffect(() => {
    if (activeTab === 'quiz' && !aiQuizState.currentQuestion && !aiQuizState.loading && !aiQuizState.completed) {
      loadAIQuestion(1);
    }
  }, [activeTab, currentChapterId]);

  const handleSelectOption = (option) => {
    if (aiQuizState.isChecked) return;
    setAiQuizState((prev) => ({
      ...prev,
      selectedOption: option
    }));
  };

  const handleCheckAnswer = () => {
    try {
      if (!aiQuizState.selectedOption || !aiQuizState.currentQuestion || aiQuizState.isChecked) return;

      const q = aiQuizState.currentQuestion;
      const selected = aiQuizState.selectedOption;
      const correct = isOptionCorrect(selected, q?.answer);
      const whyReason = !correct ? getWhyWrongReason(selected, q?.whyWrong) : '';
      const newScore = correct ? (Number(aiQuizState.score) || 0) + 1 : (Number(aiQuizState.score) || 0);

      setAiQuizState((prev) => ({
        ...prev,
        isChecked: true,
        isCorrect: correct,
        score: newScore,
        whyWrongText: whyReason || '',
        attemptCount: (prev.attemptCount || 0) + 1
      }));

      const topicName = chapterData?.topic || 'Mathematics';
      const chTitle = chapterData?.title || currentChapterId || 'Chapter';
      const chUnit = chapterData?.unit || '';

      if (correct) {
        onToast?.('🎉 Excellent! Correct Answer (+15 XP)');
      } else {
        onToast?.('💡 Not quite! Review the breakdown below — instructor notified & AI diagnosis ready!');
        // 1. Dispatch real-time struggle signal to Teacher Dashboard
        api.post('/student/struggle-signal', {
          subject: topicName,
          chapterId: currentChapterId,
          chapterTitle: chTitle,
          unit: chUnit,
          triggerType: 'wrong_answer',
          question: String(q?.question || ''),
          selectedAnswer: String(selected || ''),
          correctAnswer: String(q?.answer || ''),
          concept: q?.concept || '',
          detail: `Selected "${selected}" on: "${String(q?.question || '').replace(/[\$\n]/g, ' ').slice(0, 60)}..." (Correct: "${q?.answer || ''}")`
        }).catch(() => {});

        // 2. Fetch instant Socratic AI explanation of the mistake
        fetchAIExplanation(q, selected);
      }
    } catch (err) {
      console.error('Safe recovery from handleCheckAnswer error:', err);
      setAiQuizState((prev) => ({
        ...prev,
        isChecked: true,
        isCorrect: false
      }));
    }
  };

  const handleRetryQuestion = () => {
    setAiQuizState((prev) => ({
      ...prev,
      selectedOption: null,
      isChecked: false,
      isCorrect: false,
      whyWrongText: '',
      aiExplanation: '',
      aiExplanationLoading: false
    }));
  };

  const handleNextQuestion = () => {
    try {
      if (aiQuizState.questionNumber >= aiQuizState.totalQuestions) {
        const finalScore = Number(aiQuizState.score) || 0;
        setAiQuizState((prev) => ({ ...prev, completed: true }));

        const passed = finalScore >= 2;
        const topicName = chapterData?.topic || 'Mathematics';
        const chTitle = chapterData?.title || currentChapterId || 'Chapter';
        const chUnit = chapterData?.unit || '';

        if (passed && !aiQuizState.awarded) {
          setAiQuizState((prev) => ({ ...prev, awarded: true }));
          onCompleteQuiz?.(
            50,
            `Mastered Chapter: ${chTitle}`,
            topicName,
            currentChapterId
          );
          onToast?.(`🏆 Chapter Mastered! Score: ${finalScore}/3. +50 XP Awarded!`);
        } else {
          onToast?.(`Quiz complete! Score: ${finalScore}/3. Keep practicing to master the chapter!`);
          if (finalScore < 2) {
            const scorePct = Math.round((finalScore / 3) * 100);
            api.post('/student/struggle-signal', {
              subject: topicName,
              chapterId: currentChapterId,
              chapterTitle: chTitle,
              unit: chUnit,
              triggerType: 'quiz_failure',
              score: scorePct,
              detail: `Scored ${finalScore}/3 (${scorePct}%) on chapter mastery quiz`
            }).catch(() => {});
          }
        }
      } else {
        const nextQ = aiQuizState.questionNumber + 1;
        loadAIQuestion(nextQ);
      }
    } catch (err) {
      console.error('Safe recovery from handleNextQuestion error:', err);
    }
  };

  const handleRestartQuiz = () => {
    setAiQuizState({
      questionNumber: 1,
      totalQuestions: 3,
      currentQuestion: null,
      loading: false,
      selectedOption: null,
      isChecked: false,
      isCorrect: false,
      score: 0,
      completed: false,
      awarded: aiQuizState.awarded,
      whyWrongText: '',
      attemptCount: 0
    });
    loadAIQuestion(1);
  };

  // --- IN-READER TUTORMIND TUTOR STATE ---
  const [tutorMessages, setTutorMessages] = useState([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const tutorEndRef = React.useRef(null);

  useEffect(() => {
    if (!chapterData) return;
    const firstName = (user?.name || 'there').split(' ')[0];
    setTutorMessages([
      {
        role: 'bot',
        text: `Hello ${firstName}! 👋 I am your TutorMind AI Tutor for **${chapterData.title}** (${chapterData.topic}). Ask me any questions about concepts, definitions, formulas, or worked examples in this chapter, or pick a suggested question below!`
      }
    ]);
  }, [currentChapterId, user?.name]);

  const sendTutorMessage = async (customText) => {
    const text = (customText || tutorInput).trim();
    if (!text || tutorLoading) return;
    setTutorInput('');

    const userMsg = { role: 'user', text };
    setTutorMessages((prev) => [...prev, userMsg]);
    setTutorLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: `[Context: Math textbook chapter "${chapterData.title}" (${chapterData.topic}), Student Level: ${user?.level || 1}]\n\nStudent question: ${text}`,
        sessionId: `chapter-tutor-${currentChapterId}-${user?.email || 'anon'}`
      });

      setTutorMessages((prev) => [
        ...prev,
        { role: 'bot', text: response.data.reply }
      ]);
    } catch (err) {
      setTutorMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: err.response?.data?.message || 'I am momentarily unreachable. Please check that the server is running and try again!'
        }
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tutor') {
      tutorEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tutorMessages, tutorLoading, activeTab]);

  const chapterQuickPrompts = useMemo(() => {
    if (!chapterData) return [];
    return [
      `Explain "${chapterData.title}" with an intuitive real-world analogy`,
      `What are the most important formulas to remember in ${chapterData.title}?`,
      `Show me another worked example step-by-step`,
      `What is the most common mistake students make in this chapter?`
    ];
  }, [chapterData]);

  const handleAskAITutorAboutMistake = () => {
    if (!aiQuizState.currentQuestion) return;
    const q = aiQuizState.currentQuestion;
    const promptContext = `In chapter "${chapterData?.title || 'this chapter'}", I missed this question:
"${q.question}"
I chose: "${aiQuizState.selectedOption}"
Correct answer is: "${q.answer}"
Can you explain why my choice was wrong and guide me through the concept step-by-step?`;

    setActiveTab('tutor');
    sendTutorMessage(promptContext);
  };

  const handleAskAITutor = () => {
    setActiveTab('tutor');
  };

  if (!chapterData) return null;

  return (
    <Dialog
      fullScreen={isFullScreen}
      open={Boolean(chapterData)}
      onClose={onClose}
      maxWidth={isFullScreen ? false : 'xl'}
      fullWidth
      PaperProps={{
        sx: isFullScreen
          ? {
              width: '100vw',
              height: '100vh',
              maxWidth: '100vw',
              maxHeight: '100vh',
              m: 0,
              p: 0,
              borderRadius: 0,
              bgcolor: '#fffdf8',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }
          : {
              width: '100%',
              maxWidth: '1300px',
              height: { xs: '96vh', sm: '92vh' },
              bgcolor: '#fffdf8',
              border: '1px solid #e6e2d9',
              borderRadius: { xs: 2.5, sm: 3.5 },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(32,33,31,0.22)'
            }
      }}
    >
        {/* =================================================================== */}
        {/* HEADER BAR                                                          */}
        {/* =================================================================== */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            bgcolor: '#faf8f2',
            borderBottom: '1px solid #e6e2d9',
            flexShrink: 0
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1.5}
          >
            {/* Left: Breadcrumbs & Badges */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" mb={0.5}>
                <Chip
                  label={chapterData.topic}
                  size="small"
                  sx={{
                    bgcolor: theme.lightBg,
                    color: theme.color,
                    fontWeight: 800,
                    fontSize: 11,
                    height: 22
                  }}
                />
                <Chip
                  label={`Chapter ${String(chapterData.chapterNum || 1).padStart(2, '0')}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: '#dcd8cf',
                    color: '#66655f',
                    fontSize: 11,
                    fontWeight: 700,
                    height: 22
                  }}
                />
                {chapterData.difficulty && (
                  <Chip
                    icon={<Speed sx={{ fontSize: '13px !important' }} />}
                    label={chapterData.difficulty}
                    size="small"
                    sx={{
                      bgcolor: '#f1ede7',
                      color: '#55544e',
                      fontSize: 10,
                      fontWeight: 600,
                      height: 22
                    }}
                  />
                )}
                {chapterData.readTime && (
                  <Chip
                    icon={<Timer sx={{ fontSize: '13px !important' }} />}
                    label={chapterData.readTime}
                    size="small"
                    sx={{
                      bgcolor: '#f1ede7',
                      color: '#55544e',
                      fontSize: 10,
                      fontWeight: 600,
                      height: 22
                    }}
                  />
                )}
                {isMastered && (
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: '13px !important', color: '#2e7d32' }} />}
                    label="Mastered"
                    size="small"
                    sx={{
                      bgcolor: '#e8f4ea',
                      color: '#2e7d32',
                      fontWeight: 800,
                      fontSize: 10,
                      height: 22
                    }}
                  />
                )}
              </Stack>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: 20, sm: 24, md: 26 },
                  fontWeight: 900,
                  color: '#20211f',
                  lineHeight: 1.2
                }}
              >
                {chapterData.title}
              </Typography>
              {chapterData.subtitle && (
                <Typography fontSize={{ xs: 12, sm: 13 }} color="text.secondary" mt={0.3}>
                  {chapterData.subtitle}
                </Typography>
              )}
            </Box>

            {/* Right: Actions */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Psychology sx={{ color: '#ec735e' }} />}
                onClick={handleAskAITutor}
                sx={{
                  borderColor: '#e6e2d9',
                  color: '#20211f',
                  bgcolor: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': { borderColor: '#ec735e', bgcolor: '#fff5f2' }
                }}
              >
                Ask Tutor
              </Button>
              <Tooltip title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                <IconButton
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  size="small"
                  sx={{
                    bgcolor: '#ece8de',
                    color: '#20211f',
                    '&:hover': { bgcolor: '#e0dbcf' }
                  }}
                  aria-label={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullScreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={onClose}
                size="small"
                sx={{
                  bgcolor: '#ece8de',
                  color: '#20211f',
                  '&:hover': { bgcolor: '#e0dbcf' }
                }}
                aria-label="Close textbook"
              >
                <Close fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          {/* Tab Navigation */}
          <Box sx={{ mt: 2, borderTop: '1px solid #ece7dc', pt: 0.5 }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#77756e',
                  py: 0.5,
                  px: 1.8,
                  '&.Mui-selected': {
                    color: theme.color
                  }
                },
                '& .MuiTabs-indicator': {
                  bgcolor: theme.color,
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab
                value="theory"
                icon={<MenuBook sx={{ fontSize: 16 }} />}
                iconPosition="start"
                label="1. Theory & Concepts"
              />
              <Tab
                value="formulas"
                icon={<Functions sx={{ fontSize: 16 }} />}
                iconPosition="start"
                label={`2. Definitions & Formulas (${(chapterData.definitions?.length || 0) + (chapterData.keyFormulas?.length || 0)})`}
              />
              <Tab
                value="examples"
                icon={<Lightbulb sx={{ fontSize: 16 }} />}
                iconPosition="start"
                label={`3. Worked Examples (${chapterData.workedExamples?.length || 0})`}
              />
              {chapterData.pitfalls && chapterData.pitfalls.length > 0 && (
                <Tab
                  value="pitfalls"
                  icon={<WarningAmber sx={{ fontSize: 16 }} />}
                  iconPosition="start"
                  label={`4. Common Pitfalls (${chapterData.pitfalls.length})`}
                />
              )}
              <Tab
                value="quiz"
                icon={<AutoAwesome sx={{ fontSize: 16, color: '#ec735e' }} />}
                iconPosition="start"
                label="5. Adaptive AI Quiz (+50 XP)"
              />
              <Tab
                value="tutor"
                icon={<Psychology sx={{ fontSize: 16, color: '#ec735e' }} />}
                iconPosition="start"
                label="6. Ask TutorMind Tutor"
              />
              <Tab
                value="videos"
                icon={<PlayCircleOutline sx={{ fontSize: 16, color: '#ef4444' }} />}
                iconPosition="start"
                label={`7. Video Lessons (${chapterVideos.length})`}
              />
            </Tabs>
          </Box>
        </Box>

        {/* =================================================================== */}
        {/* MAIN SCROLLABLE CONTENT BODY                                        */}
        {/* =================================================================== */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: { xs: 2, sm: 3, md: 4 },
            bgcolor: '#fffdf8'
          }}
        >
          <Box sx={{ maxWidth: '1360px', mx: 'auto', width: '100%' }}>
            <AnimatePresence mode="wait">
            {/* ------------------------------------------------------------- */}
            {/* TAB 1: THEORY & CONCEPTS                                      */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'theory' && (
              <motion.div
                key="theory"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Overview Card */}
                {chapterData.overview && (
                  <Paper
                    sx={{
                      p: 2.5,
                      mb: 3,
                      bgcolor: '#faf6ee',
                      border: '1.5px solid #eae2d1',
                      borderRadius: 3
                    }}
                  >
                    <Typography
                      fontFamily="DM Mono, monospace"
                      fontSize={11}
                      fontWeight={700}
                      color="#8c7759"
                      letterSpacing={1}
                      textTransform="uppercase"
                      mb={1}
                    >
                      💡 Chapter Overview & Intuition
                    </Typography>
                    <MathMessage content={chapterData.overview} />
                  </Paper>
                )}

                {/* Curated YouTube Video Lesson Recommendation Banner */}
                {chapterVideos && chapterVideos.length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 3,
                      borderRadius: 3,
                      bgcolor: '#fef2f2',
                      border: '1.5px solid #fecaca',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { sm: 'center' },
                      gap: 1.5
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: '#fee2e2', color: '#dc2626', width: 42, height: 42 }}>
                        <PlayCircleOutline />
                      </Avatar>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography fontSize={13.5} fontWeight={800} color="#991b1b">
                            Curated YouTube Video Recommendation
                          </Typography>
                          <Chip
                            size="small"
                            label={chapterVideos[0].channel}
                            sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 800, fontSize: 10.5, height: 20 }}
                          />
                          <Chip
                            size="small"
                            label={chapterVideos[0].duration}
                            sx={{ bgcolor: '#ffffff', color: '#64748b', fontSize: 10, height: 20, border: '1px solid #fecaca' }}
                          />
                        </Stack>
                        <Typography fontSize={12} color="#475569" mt={0.3}>
                          "{chapterVideos[0].title}" — {chapterVideos[0].keyTakeaway}
                        </Typography>
                      </Box>
                    </Stack>

                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setActiveTab('videos')}
                      startIcon={<PlayCircleOutline />}
                      sx={{
                        bgcolor: '#dc2626',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: 12,
                        textTransform: 'none',
                        borderRadius: 2,
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                        '&:hover': { bgcolor: '#b91c1c' }
                      }}
                    >
                      Watch Video Lessons ({chapterVideos.length})
                    </Button>
                  </Paper>
                )}

                {/* Educational Vector Diagram & Geometric Model */}
                <ChapterDiagram
                  chapterId={currentChapterId || chapterData.id}
                  topic={chapterData.topic}
                  title={chapterData.title}
                />

                {/* Main Theory Text */}
                <Box sx={{ color: '#20211f', lineHeight: 1.8 }}>
                  <MathMessage content={chapterData.theory} />
                </Box>

                {/* Next Tab Hint */}
                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid #ede8de',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => setActiveTab('formulas')}
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: theme.color,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Next: Definitions & Formulas
                  </Button>
                </Box>
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: DEFINITIONS & KEY FORMULAS                             */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'formulas' && (
              <motion.div
                key="formulas"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Formal Definitions */}
                {chapterData.definitions && chapterData.definitions.length > 0 && (
                  <Box mb={4}>
                    <Typography
                      fontFamily="DM Mono, monospace"
                      fontSize={11}
                      fontWeight={700}
                      color="#9b9991"
                      letterSpacing={1}
                      textTransform="uppercase"
                      mb={2}
                    >
                      Formal Mathematical Definitions
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 2
                      }}
                    >
                      {chapterData.definitions.map((def, idx) => (
                        <Paper
                          key={idx}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            bgcolor: '#faf9f5',
                            border: '1px solid #e6e2d9',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 18px rgba(0,0,0,0.04)'
                            }
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={1}>
                            <Typography fontWeight={800} fontSize={15} color="#20211f">
                              {def.term}
                            </Typography>
                            {def.symbol && (
                              <Chip
                                label={def.symbol}
                                size="small"
                                sx={{
                                  fontFamily: 'DM Mono, monospace',
                                  fontSize: 11,
                                  bgcolor: '#eeeae1',
                                  color: '#444'
                                }}
                              />
                            )}
                          </Stack>
                          <Typography fontSize={13} color="#454540" lineHeight={1.6} mb={1.5}>
                            {def.meaning}
                          </Typography>
                          {def.example && (
                            <Box
                              sx={{
                                p: 1.5,
                                bgcolor: '#fff',
                                borderRadius: 2,
                                border: '1px dashed #ded9ce',
                                fontSize: 12
                              }}
                            >
                              <Typography fontSize={10} fontWeight={700} color="#888" textTransform="uppercase" mb={0.3}>
                                Example
                              </Typography>
                              <MathMessage content={def.example} />
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Key Formulas & Identities */}
                {chapterData.keyFormulas && chapterData.keyFormulas.length > 0 && (
                  <Box mb={3}>
                    <Typography
                      fontFamily="DM Mono, monospace"
                      fontSize={11}
                      fontWeight={700}
                      color="#9b9991"
                      letterSpacing={1}
                      textTransform="uppercase"
                      mb={2}
                    >
                      Key Formulas, Identities & Rules
                    </Typography>
                    <Stack spacing={2}>
                      {chapterData.keyFormulas.map((f, idx) => (
                        <Paper
                          key={idx}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            bgcolor: '#ffffff',
                            border: '1.5px solid #ded9cd'
                          }}
                        >
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ sm: 'center' }}
                            gap={2}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography fontWeight={800} fontSize={14} color="#20211f" mb={1}>
                                {f.name}
                              </Typography>
                              <Paper
                                sx={{
                                  p: 1.8,
                                  bgcolor: '#faf8f2',
                                  borderRadius: 2,
                                  border: '1px solid #eee8db',
                                  textAlign: 'center'
                                }}
                              >
                                <MathMessage content={`$$${f.formula}$$`} />
                              </Paper>
                            </Box>
                            {f.note && (
                              <Box
                                sx={{
                                  flex: 1,
                                  p: 2,
                                  bgcolor: '#fcfbfa',
                                  borderRadius: 2,
                                  borderLeft: `4px solid ${theme.color}`
                                }}
                              >
                                <Typography fontSize={11} fontWeight={700} color="#777" mb={0.5}>
                                  HOW TO APPLY
                                </Typography>
                                <Typography fontSize={12} color="#454540" lineHeight={1.6}>
                                  <MathMessage content={f.note} />
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Next Tab Hint */}
                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid #ede8de',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Button variant="outlined" onClick={() => setActiveTab('theory')} startIcon={<ArrowBack />}>
                    Back to Theory
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setActiveTab('examples')}
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: theme.color,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Next: Worked Examples
                  </Button>
                </Box>
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: WORKED EXAMPLES                                        */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'examples' && (
              <motion.div
                key="examples"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Typography
                  fontFamily="DM Mono, monospace"
                  fontSize={11}
                  fontWeight={700}
                  color="#9b9991"
                  letterSpacing={1}
                  textTransform="uppercase"
                  mb={2}
                >
                  Step-by-Step Worked Problems with Reasoning
                </Typography>

                <Stack spacing={3}>
                  {(chapterData.workedExamples || []).map((ex, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        borderRadius: 3.5,
                        bgcolor: '#ffffff',
                        border: '1.5px solid #ded9cd',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                      }}
                    >
                      {/* Example Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar
                            sx={{
                              width: 26,
                              height: 26,
                              fontSize: 12,
                              fontWeight: 800,
                              bgcolor: theme.color,
                              color: '#fff'
                            }}
                          >
                            {idx + 1}
                          </Avatar>
                          <Typography fontWeight={800} fontSize={15} color="#20211f">
                            Example {idx + 1}
                          </Typography>
                        </Stack>
                        {ex.difficulty && (
                          <Chip
                            label={ex.difficulty}
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 700,
                              bgcolor:
                                ex.difficulty === 'Beginner'
                                  ? '#e8f4ea'
                                  : ex.difficulty === 'Intermediate'
                                  ? '#fff3dc'
                                  : '#fce8e6',
                              color:
                                ex.difficulty === 'Beginner'
                                  ? '#2e7d32'
                                  : ex.difficulty === 'Intermediate'
                                  ? '#8f6500'
                                  : '#c5221f'
                            }}
                          />
                        )}
                      </Stack>

                      {/* Problem Statement */}
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: '#faf8f4',
                          border: '1px solid #eae4d7',
                          borderRadius: 2,
                          mb: 2
                        }}
                      >
                        <Typography fontSize={11} fontWeight={700} color="#777" textTransform="uppercase" mb={0.5}>
                          Problem
                        </Typography>
                        <Typography fontSize={14} fontWeight={600} color="#20211f">
                          <MathMessage content={ex.problem} />
                        </Typography>
                      </Paper>

                      {/* Step-by-Step Solution */}
                      <Typography fontSize={11} fontWeight={700} color="#777" textTransform="uppercase" mb={1.5}>
                        Step-by-Step Solution
                      </Typography>
                      <Stack spacing={1.2} mb={2}>
                        {(ex.steps || []).map((step, sIdx) => (
                          <Stack
                            key={sIdx}
                            direction="row"
                            spacing={1.5}
                            alignItems="flex-start"
                            sx={{
                              p: 1.5,
                              bgcolor: '#fdfcf9',
                              borderRadius: 2,
                              border: '1px solid #f0ecdf'
                            }}
                          >
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                bgcolor: '#ece8de',
                                color: '#555',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: 11,
                                fontWeight: 700,
                                flexShrink: 0,
                                mt: 0.2
                              }}
                            >
                              {sIdx + 1}
                            </Box>
                            <Box sx={{ flex: 1, fontSize: 13, color: '#333', lineHeight: 1.6 }}>
                              <MathMessage content={step} />
                            </Box>
                          </Stack>
                        ))}
                      </Stack>

                      {/* Final Answer Banner */}
                      {ex.finalAnswer && (
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: '#eaf5ed',
                            border: '1.5px solid #a3d9b1',
                            borderRadius: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            mb: ex.proTip ? 2 : 0
                          }}
                        >
                          <CheckCircle sx={{ color: '#2e7d32', fontSize: 22 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography fontSize={11} fontWeight={800} color="#1b5e20" textTransform="uppercase">
                              Final Answer
                            </Typography>
                            <Typography fontSize={14} fontWeight={700} color="#0f4014">
                              <MathMessage content={ex.finalAnswer} />
                            </Typography>
                          </Box>
                        </Paper>
                      )}

                      {/* Pro-Tip */}
                      {ex.proTip && (
                        <Paper
                          sx={{
                            p: 1.8,
                            bgcolor: '#fff9e6',
                            border: '1px solid #fae69e',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.2
                          }}
                        >
                          <Lightbulb sx={{ color: '#d99000', fontSize: 20, mt: 0.2 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography fontSize={11} fontWeight={800} color="#8a5a00" textTransform="uppercase" mb={0.3}>
                              Pro-Tip & Insight
                            </Typography>
                            <Typography fontSize={12} color="#573a00" lineHeight={1.5}>
                              <MathMessage content={ex.proTip} />
                            </Typography>
                          </Box>
                        </Paper>
                      )}
                    </Paper>
                  ))}
                </Stack>

                {/* Next Tab Hint */}
                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid #ede8de',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Button variant="outlined" onClick={() => setActiveTab('formulas')} startIcon={<ArrowBack />}>
                    Back to Formulas
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() =>
                      setActiveTab(
                        chapterData.pitfalls && chapterData.pitfalls.length > 0
                          ? 'pitfalls'
                          : 'quiz'
                      )
                    }
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: theme.color,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    {chapterData.pitfalls && chapterData.pitfalls.length > 0
                      ? 'Next: Common Pitfalls'
                      : 'Next: Chapter Quiz'}
                  </Button>
                </Box>
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 4: COMMON PITFALLS                                        */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'pitfalls' && (
              <motion.div
                key="pitfalls"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Typography
                  fontFamily="DM Mono, monospace"
                  fontSize={11}
                  fontWeight={700}
                  color="#9b9991"
                  letterSpacing={1}
                  textTransform="uppercase"
                  mb={2}
                >
                  Common Pitfalls, Misconceptions & Traps to Avoid
                </Typography>

                <Stack spacing={2}>
                  {(chapterData.pitfalls || []).map((pitfall, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: '#fffbfb',
                        border: '1.5px solid #fad2cf',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: '#fce8e6',
                          color: '#d93025',
                          width: 34,
                          height: 34,
                          fontSize: 16
                        }}
                      >
                        ⚠️
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={800} fontSize={14} color="#b31412" mb={0.5}>
                          Trap #{idx + 1}
                        </Typography>
                        <Typography fontSize={13} color="#454540" lineHeight={1.6}>
                          <MathMessage content={pitfall} />
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Stack>

                {/* Next Tab Hint */}
                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid #ede8de',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Button variant="outlined" onClick={() => setActiveTab('examples')} startIcon={<ArrowBack />}>
                    Back to Examples
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setActiveTab('quiz')}
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: theme.color,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Next: Take Adaptive AI Quiz
                  </Button>
                </Box>
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 5: ADAPTIVE AI CHAPTER QUIZ ENGINE                        */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header Banner */}
                <Paper
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: '#ffffff',
                    border: '1.5px solid #ded9cd',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    mb: 3
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ sm: 'center' }}
                    spacing={1.5}
                    mb={2}
                  >
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AutoAwesome sx={{ color: '#ec735e', fontSize: 20 }} />
                        <Typography fontWeight={800} fontSize={16} color="#20211f">
                          Adaptive AI Chapter Assessment
                        </Typography>
                      </Stack>
                      <Typography fontSize={12} color="text.secondary" mt={0.3}>
                        Questions dynamically generated by Gemini AI tailored to your learning level (Level {user?.level || 1})
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        icon={<Stars sx={{ color: '#ec735e !important', fontSize: 18 }} />}
                        label="+50 XP Master Bonus"
                        sx={{
                          bgcolor: '#fff5f2',
                          border: '1px solid #fbdad2',
                          color: '#ec735e',
                          fontWeight: 800,
                          fontSize: 12
                        }}
                      />
                      <Chip
                        label={`Level ${user?.level || 1} Student`}
                        size="small"
                        sx={{
                          bgcolor: '#f2f0e8',
                          color: '#555',
                          fontWeight: 700,
                          fontSize: 11
                        }}
                      />
                    </Stack>
                  </Stack>

                  {/* Progressive Difficulty Stepper */}
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: '#faf8f2',
                      borderRadius: 2,
                      border: '1px solid #ede8de',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      {[
                        { step: 1, label: 'Q1: Foundational', color: '#2e7d32', bg: '#eaf5ed' },
                        { step: 2, label: 'Q2: Intermediate', color: '#8f6500', bg: '#fff3dc' },
                        { step: 3, label: 'Q3: Advanced', color: '#7b1fa2', bg: '#f3e8fd' }
                      ].map((tier) => {
                        const isCurrent = aiQuizState.questionNumber === tier.step && !aiQuizState.completed;
                        const isDone = aiQuizState.questionNumber > tier.step || aiQuizState.completed;

                        return (
                          <Chip
                            key={tier.step}
                            label={tier.label}
                            size="small"
                            sx={{
                              fontSize: 11,
                              fontWeight: 800,
                              bgcolor: isCurrent ? tier.bg : isDone ? '#eaf5ed' : '#ece8de',
                              color: isCurrent ? tier.color : isDone ? '#2e7d32' : '#888',
                              border: isCurrent ? `1.5px solid ${tier.color}` : '1px solid transparent',
                              transition: 'all 0.2s ease'
                            }}
                            icon={
                              isDone ? (
                                <CheckCircle sx={{ fontSize: '14px !important', color: '#2e7d32 !important' }} />
                              ) : undefined
                            }
                          />
                        );
                      })}
                    </Stack>

                    <Typography fontSize={12} fontWeight={700} color="#666">
                      Current Score: <Box component="span" sx={{ color: theme.color, fontWeight: 800 }}>{aiQuizState.score}</Box> / 3
                    </Typography>
                  </Box>
                </Paper>

                {/* Main Body */}
                {aiQuizState.loading ? (
                  /* Loading State */
                  <Paper
                    sx={{
                      p: { xs: 4, sm: 6 },
                      borderRadius: 3.5,
                      bgcolor: '#ffffff',
                      border: '1.5px dashed #ded9cd',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 280
                    }}
                  >
                    <CircularProgress size={36} sx={{ color: theme.color, mb: 2 }} />
                    <Typography fontWeight={800} fontSize={16} color="#20211f" mb={0.5}>
                       AI is generating your question...
                    </Typography>
                    <Typography fontSize={13} color="text.secondary" maxWidth={450}>
                      Adapting to <strong>{aiQuizState.questionNumber === 1 ? 'Foundational' : aiQuizState.questionNumber === 2 ? 'Intermediate' : 'Advanced'}</strong> difficulty for <strong>{chapterData.title}</strong> based on your level.
                    </Typography>
                  </Paper>
                ) : aiQuizState.completed ? (
                  /* Completed Assessment Summary */
                  <Paper
                    sx={{
                      p: { xs: 3, sm: 4 },
                      borderRadius: 3.5,
                      bgcolor: aiQuizState.score >= 2 ? '#f4faf5' : '#fffaf5',
                      border: `2px solid ${aiQuizState.score >= 2 ? '#a3d9b1' : '#fcd5cb'}`,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                      textAlign: 'center'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: aiQuizState.score >= 2 ? '#eaf5ed' : '#fce8e6',
                        color: aiQuizState.score >= 2 ? '#2e7d32' : '#d93025',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <EmojiEvents sx={{ fontSize: 36 }} />
                    </Avatar>

                    <Typography fontWeight={900} fontSize={22} color="#20211f" mb={1}>
                      {aiQuizState.score === 3
                        ? '🏆 Perfect Mastery! 100% Score'
                        : aiQuizState.score >= 2
                        ? '🎉 Assessment Passed! Chapter Mastered'
                        : 'Great Practice Session!'}
                    </Typography>

                    <Typography fontSize={14} color="#555" maxWidth={540} mx="auto" mb={3} lineHeight={1.6}>
                      You correctly answered <strong>{aiQuizState.score} of 3 questions</strong> across Foundational, Intermediate, and Advanced tiers.
                      {aiQuizState.score >= 2
                        ? ' +50 XP has been awarded and this chapter has been marked as Mastered in your learning progress.'
                        : ' Review the worked examples and generate another AI quiz to solidify your understanding.'}
                    </Typography>

                    <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
                      <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleRestartQuiz}
                        sx={{
                          borderColor: '#ded9cd',
                          color: '#20211f',
                          bgcolor: '#ffffff',
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2.5,
                          px: 2.5,
                          '&:hover': { bgcolor: '#f7f5ef' }
                        }}
                      >
                        Generate Fresh AI Practice Quiz
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<MenuBook />}
                        onClick={() => setActiveTab('theory')}
                        sx={{
                          borderColor: '#ded9cd',
                          color: '#20211f',
                          bgcolor: '#ffffff',
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2.5,
                          px: 2.5,
                          '&:hover': { bgcolor: '#f7f5ef' }
                        }}
                      >
                        Review Chapter Theory
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={onClose}
                        sx={{
                          borderColor: '#ded9cd',
                          color: '#20211f',
                          bgcolor: '#ffffff',
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2.5,
                          px: 2.5,
                          '&:hover': { bgcolor: '#f7f5ef' }
                        }}
                      >
                        Back to Learn Library
                      </Button>
                      {adjacent.next && (
                        <Button
                          variant="contained"
                          endIcon={<ArrowForward />}
                          onClick={() => setCurrentChapterId(adjacent.next.id)}
                          sx={{
                            bgcolor: theme.color,
                            fontWeight: 800,
                            textTransform: 'none',
                            borderRadius: 2.5,
                            px: 3,
                            '&:hover': { opacity: 0.9 }
                          }}
                        >
                          Next Chapter: {adjacent.next.title}
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                ) : aiQuizState.currentQuestion ? (
                  /* Active AI Question View */
                  <Stack spacing={3}>
                    <Paper
                      sx={{
                        p: { xs: 2.5, sm: 3.5 },
                        borderRadius: 3.5,
                        bgcolor: '#ffffff',
                        border: '1.5px solid',
                        borderColor: aiQuizState.isChecked
                          ? aiQuizState.isCorrect
                            ? '#a3d9b1'
                            : '#f8b4af'
                          : '#ded9cd',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                        transition: 'border-color 0.2s ease'
                      }}
                    >
                      {/* Question Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: 13,
                              fontWeight: 800,
                              bgcolor: aiQuizState.isChecked
                                ? aiQuizState.isCorrect
                                  ? '#2e7d32'
                                  : '#d93025'
                                : theme.color,
                              color: '#fff'
                            }}
                          >
                            {aiQuizState.isChecked
                              ? aiQuizState.isCorrect
                                ? '✓'
                                : '✗'
                              : `Q${aiQuizState.questionNumber}`}
                          </Avatar>
                          <Box>
                            <Typography fontSize={11} fontWeight={800} color="#888" textTransform="uppercase">
                              Question {aiQuizState.questionNumber} of 3
                            </Typography>
                            {aiQuizState.currentQuestion.concept && (
                              <Typography fontSize={12} fontWeight={700} color={theme.color}>
                                Concept: {aiQuizState.currentQuestion.concept}
                              </Typography>
                            )}
                          </Box>
                        </Stack>

                        <Chip
                          label={
                            aiQuizState.questionNumber === 1
                              ? 'Foundational'
                              : aiQuizState.questionNumber === 2
                              ? 'Intermediate'
                              : 'Advanced'
                          }
                          size="small"
                          sx={{
                            fontSize: 11,
                            fontWeight: 800,
                            bgcolor:
                              aiQuizState.questionNumber === 1
                                ? '#e8f4ea'
                                : aiQuizState.questionNumber === 2
                                ? '#fff3dc'
                                : '#f3e8fd',
                            color:
                              aiQuizState.questionNumber === 1
                                ? '#2e7d32'
                                : aiQuizState.questionNumber === 2
                                ? '#8f6500'
                                : '#7b1fa2'
                          }}
                        />
                      </Stack>

                      {/* Question Text */}
                      <Box sx={{ my: 2.5, px: { xs: 0.5, sm: 1 } }}>
                        <Typography fontSize={16} fontWeight={700} color="#20211f" lineHeight={1.6}>
                          <MathMessage content={aiQuizState.currentQuestion.question} />
                        </Typography>
                      </Box>

                      {/* Options Grid */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 1.5,
                          my: 2
                        }}
                      >
                        {(Array.isArray(aiQuizState.currentQuestion?.options) ? aiQuizState.currentQuestion.options : []).map((option, optIdx) => {
                          const isThisSelected = aiQuizState.selectedOption === option;
                          const isAnswer = isOptionCorrect(option, aiQuizState.currentQuestion.answer);

                          let btnBg = '#fffdfa';
                          let btnBorder = '#e0dbce';
                          let btnColor = '#20211f';

                          if (aiQuizState.isChecked) {
                            if (isAnswer) {
                              btnBg = '#eaf5ed';
                              btnBorder = '#2e7d32';
                              btnColor = '#1b5e20';
                            } else if (isThisSelected && !aiQuizState.isCorrect) {
                              btnBg = '#fce8e6';
                              btnBorder = '#d93025';
                              btnColor = '#c5221f';
                            } else {
                              btnBg = '#faf9f5';
                              btnBorder = '#ede8de';
                              btnColor = '#777';
                            }
                          } else if (isThisSelected) {
                            btnBg = theme.lightBg;
                            btnBorder = theme.color;
                            btnColor = theme.color;
                          }

                          return (
                            <Paper
                              key={optIdx}
                              onClick={() => handleSelectOption(option)}
                              sx={{
                                p: 2,
                                borderRadius: 2.5,
                                border: '1.5px solid',
                                borderColor: btnBorder,
                                bgcolor: btnBg,
                                cursor: aiQuizState.isChecked ? 'default' : 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                '&:hover': {
                                  borderColor: aiQuizState.isChecked ? btnBorder : theme.color,
                                  bgcolor: aiQuizState.isChecked ? btnBg : '#fff8f5'
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  border: '1.5px solid',
                                  borderColor: isThisSelected || (aiQuizState.isChecked && isAnswer) ? 'currentColor' : '#ccc',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: btnColor,
                                  flexShrink: 0
                                }}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </Box>
                              <Box sx={{ flex: 1, fontSize: 14, fontWeight: isThisSelected ? 700 : 500, color: btnColor }}>
                                <MathMessage content={option} />
                              </Box>
                              {aiQuizState.isChecked && isAnswer && (
                                <CheckCircle sx={{ color: '#2e7d32', fontSize: 20 }} />
                              )}
                            </Paper>
                          );
                        })}
                      </Box>

                      {/* FEEDBACK & WORKED SOLUTION BREAKDOWN */}
                      {aiQuizState.isChecked && (
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #ede8de' }}>
                          {aiQuizState.isCorrect ? (
                            /* Correct Feedback */
                            <Paper
                              sx={{
                                p: 2.5,
                                bgcolor: '#eaf5ed',
                                border: '1.5px solid #a3d9b1',
                                borderRadius: 3,
                                mb: 2.5
                              }}
                            >
                              <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                                <CheckCircle sx={{ color: '#2e7d32', fontSize: 24 }} />
                                <Typography fontWeight={900} fontSize={16} color="#1b5e20">
                                  🎉 Brilliant! Correct Answer! (+15 XP)
                                </Typography>
                              </Stack>
                              <Typography fontSize={13} color="#2b5230" lineHeight={1.6}>
                                <MathMessage content={aiQuizState.currentQuestion.explanation} />
                              </Typography>
                            </Paper>
                          ) : (
                            /* Incorrect / Failed: Detailed Step-by-Step Remediation */
                            <Stack spacing={2} mb={2.5}>
                              {/* Error Callout Banner */}
                              <Paper
                                sx={{
                                  p: 2.5,
                                  bgcolor: '#fff5f4',
                                  border: '1.5px solid #f8b4af',
                                  borderRadius: 3
                                }}
                              >
                                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#fce8e6', color: '#d93025', fontSize: 14, fontWeight: 800 }}>
                                    ✗
                                  </Avatar>
                                  <Typography fontWeight={800} fontSize={15} color="#b31412">
                                    Not quite! Here is how this problem is solved:
                                  </Typography>
                                </Stack>

                                <Stack direction="row" spacing={1} alignItems="center" mt={0.5} mb={1.5} flexWrap="wrap">
                                  <Chip
                                    size="small"
                                    icon={<Warning sx={{ fontSize: '13px !important', color: '#b91c1c !important' }} />}
                                    label="Live Support Alerted (Teacher Notified)"
                                    sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: 11, border: '1px solid #fca5a5' }}
                                  />
                                  <Chip
                                    size="small"
                                    icon={<AutoAwesome sx={{ fontSize: '13px !important', color: '#7c3aed !important' }} />}
                                    label="AI Socratic Diagnosis Ready"
                                    sx={{ bgcolor: '#ede9fe', color: '#6d28d9', fontWeight: 700, fontSize: 11, border: '1px solid #ddd6fe' }}
                                  />
                                </Stack>

                                {/* Socratic AI Tutor Remediation Card */}
                                <Paper
                                  sx={{
                                    p: 2,
                                    my: 1.5,
                                    bgcolor: '#f5f3ff',
                                    border: '1.5px solid #ddd6fe',
                                    borderRadius: 2.5
                                  }}
                                >
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <AutoAwesome sx={{ color: '#7c3aed', fontSize: 18 }} />
                                      <Typography fontSize={12} fontWeight={800} color="#6d28d9" textTransform="uppercase">
                                        🤖 Socratic AI Remediation
                                      </Typography>
                                    </Stack>
                                    <Chip label="Instant AI Coach" size="small" sx={{ bgcolor: '#ede9fe', color: '#6d28d9', fontWeight: 700, fontSize: 10, height: 20 }} />
                                  </Stack>

                                  {aiQuizState.aiExplanationLoading ? (
                                    <Stack direction="row" spacing={1.5} alignItems="center" py={1.5}>
                                      <CircularProgress size={16} sx={{ color: '#7c3aed' }} />
                                      <Typography fontSize={12} color="#6d28d9" fontWeight={500}>
                                        Analyzing your mistake and generating conceptual guidance...
                                      </Typography>
                                    </Stack>
                                  ) : (
                                    <Box sx={{ fontSize: 13, color: '#3b0764', lineHeight: 1.6 }}>
                                      <MathMessage
                                        content={
                                          aiQuizState.aiExplanation ||
                                          aiQuizState.whyWrongText ||
                                          'When you encounter this problem, review each operation in reverse order. Ask the AI Tutor below for an interactive step-by-step walkthrough!'
                                        }
                                      />
                                    </Box>
                                  )}

                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<Psychology sx={{ fontSize: 16 }} />}
                                    onClick={handleAskAITutorAboutMistake}
                                    sx={{
                                      mt: 1.5,
                                      bgcolor: '#7c3aed',
                                      color: '#ffffff',
                                      fontSize: 12,
                                      fontWeight: 700,
                                      textTransform: 'none',
                                      borderRadius: 2,
                                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                                      '&:hover': { bgcolor: '#6d28d9' }
                                    }}
                                  >
                                    💬 Chat with Socratic AI Tutor About This Mistake
                                  </Button>
                                </Paper>

                                {/* Diagnosis of student mistake */}
                                {aiQuizState.whyWrongText && (
                                  <Paper
                                    sx={{
                                      p: 1.8,
                                      my: 1.5,
                                      bgcolor: '#ffffff',
                                      border: '1px solid #fad2cf',
                                      borderRadius: 2
                                    }}
                                  >
                                    <Typography fontSize={11} fontWeight={800} color="#d93025" textTransform="uppercase" mb={0.5}>
                                      💡 Diagnosis of your choice:
                                    </Typography>
                                    <Typography fontSize={13} color="#454540" lineHeight={1.5}>
                                      <MathMessage content={aiQuizState.whyWrongText} />
                                    </Typography>
                                  </Paper>
                                )}

                                {/* Step-by-Step Solution */}
                                {(() => {
                                  const rawSteps = aiQuizState.currentQuestion?.stepByStepSolution;
                                  const steps = Array.isArray(rawSteps)
                                    ? rawSteps
                                    : typeof rawSteps === 'string'
                                    ? [rawSteps]
                                    : [];
                                  if (steps.length === 0) return null;
                                  return (
                                    <Box sx={{ mt: 2 }}>
                                      <Typography fontSize={11} fontWeight={800} color="#777" textTransform="uppercase" mb={1.5}>
                                        📘 Step-by-Step Worked Solution:
                                      </Typography>
                                      <Stack spacing={1}>
                                        {steps.map((step, sIdx) => (
                                          <Paper
                                            key={sIdx}
                                            sx={{
                                              p: 1.5,
                                              bgcolor: '#ffffff',
                                              borderRadius: 2,
                                              border: '1px solid #f0ecdf',
                                              display: 'flex',
                                              alignItems: 'flex-start',
                                              gap: 1.5
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: '50%',
                                                bgcolor: '#ece8de',
                                                color: '#555',
                                                display: 'grid',
                                                placeItems: 'center',
                                                fontSize: 11,
                                                fontWeight: 800,
                                                flexShrink: 0,
                                                mt: 0.1
                                              }}
                                            >
                                              {sIdx + 1}
                                            </Box>
                                            <Box sx={{ flex: 1, fontSize: 13, color: '#333', lineHeight: 1.6 }}>
                                              <MathMessage content={String(step || '')} />
                                            </Box>
                                          </Paper>
                                        ))}
                                      </Stack>
                                    </Box>
                                  );
                                })()}

                                {/* Final Answer Callout */}
                                <Paper
                                  sx={{
                                    p: 1.8,
                                    mt: 2,
                                    bgcolor: '#eaf5ed',
                                    border: '1px solid #a3d9b1',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                  }}
                                >
                                  <CheckCircle sx={{ color: '#2e7d32', fontSize: 20 }} />
                                  <Box sx={{ flex: 1 }}>
                                    <Typography fontSize={11} fontWeight={800} color="#1b5e20" textTransform="uppercase">
                                      Correct Answer:
                                    </Typography>
                                    <Typography fontSize={14} fontWeight={700} color="#0f4014">
                                      <MathMessage content={aiQuizState.currentQuestion.answer} />
                                    </Typography>
                                  </Box>
                                </Paper>
                              </Paper>
                            </Stack>
                          )}

                          {/* Control Buttons when Checked */}
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
                            <Stack direction="row" spacing={1}>
                              {!aiQuizState.isCorrect && (
                                <Button
                                  variant="outlined"
                                  startIcon={<Replay />}
                                  onClick={handleRetryQuestion}
                                  sx={{
                                    borderColor: '#ded9cd',
                                    color: '#20211f',
                                    bgcolor: '#ffffff',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: '#f5f3ec' }
                                  }}
                                >
                                  Retry Question
                                </Button>
                              )}
                              <Button
                                variant="outlined"
                                startIcon={<Psychology sx={{ color: '#ec735e' }} />}
                                onClick={handleAskAITutorAboutMistake}
                                sx={{
                                  borderColor: '#ded9cd',
                                  color: '#20211f',
                                  bgcolor: '#ffffff',
                                  fontWeight: 700,
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  '&:hover': { borderColor: '#ec735e', bgcolor: '#fff5f2' }
                                }}
                              >
                                Ask AI Tutor
                              </Button>
                            </Stack>

                            <Button
                              variant="contained"
                              endIcon={<ArrowForward />}
                              onClick={handleNextQuestion}
                              sx={{
                                bgcolor: theme.color,
                                fontWeight: 800,
                                fontSize: 14,
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 3,
                                '&:hover': { opacity: 0.9 }
                              }}
                            >
                              {aiQuizState.questionNumber >= aiQuizState.totalQuestions
                                ? 'Finish Assessment & View Results'
                                : `Next: Level ${aiQuizState.questionNumber + 1} (${aiQuizState.questionNumber === 1 ? 'Intermediate' : 'Advanced'}) ➜`}
                            </Button>
                          </Stack>
                        </Box>
                      )}

                      {/* Control Button Before Checking */}
                      {!aiQuizState.isChecked && (
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #ede8de' }}>
                          <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={!aiQuizState.selectedOption}
                            onClick={handleCheckAnswer}
                            sx={{
                              bgcolor: theme.color,
                              py: 1.4,
                              fontWeight: 800,
                              fontSize: 15,
                              borderRadius: 2.5,
                              '&:hover': { opacity: 0.9 }
                            }}
                          >
                            {aiQuizState.selectedOption
                              ? 'Submit Answer'
                              : 'Select an Option Above to Submit'}
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Stack>
                ) : (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: 3.5,
                      bgcolor: '#ffffff',
                      border: '1.5px solid #ded9cd'
                    }}
                  >
                    <Typography fontWeight={800} fontSize={16} color="#20211f" mb={1}>
                      Start Your Adaptive AI Assessment
                    </Typography>
                    <Typography fontSize={13} color="text.secondary" mb={2.5}>
                      Test your understanding of {chapterData.title} with 3 adaptive questions tailored to your level.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => loadAIQuestion(1)}
                      startIcon={<AutoAwesome />}
                      sx={{
                        bgcolor: theme.color,
                        fontWeight: 800,
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        '&:hover': { opacity: 0.9 }
                      }}
                    >
                      Begin Adaptive Assessment
                    </Button>
                  </Paper>
                )}
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 6: ASK TUTORMIND TUTOR                                    */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'tutor' && (
              <motion.div
                key="tutor"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                {/* Header Banner */}
                <Paper
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: '#ffffff',
                    border: '1.5px solid #ded9cd',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    mb: 2.5
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ sm: 'center' }}
                    spacing={1.5}
                  >
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Psychology sx={{ color: '#ec735e', fontSize: 24 }} />
                        <Typography fontWeight={800} fontSize={16} color="#20211f">
                          Ask TutorMind Tutor · {chapterData.title}
                        </Typography>
                      </Stack>
                      <Typography fontSize={12} color="text.secondary" mt={0.3}>
                        Live 1-on-1 AI tutoring powered by Gemini 3.7 with complete chapter context
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DeleteOutline />}
                        onClick={() => {
                          const firstName = (user?.name || 'there').split(' ')[0];
                          setTutorMessages([
                            {
                              role: 'bot',
                              text: `Chat reset. Ask me anything about **${chapterData.title}**!`
                            }
                          ]);
                        }}
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'none',
                          color: '#666',
                          borderColor: '#ded9cd'
                        }}
                      >
                        Clear Chat
                      </Button>
                      {onAskTutor && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<OpenInNew />}
                          onClick={() => {
                            const promptContext = `I am studying the chapter "${chapterData.title}" (${chapterData.topic}). Can you guide me through this topic?`;
                            onAskTutor(promptContext, chapterData.topic);
                          }}
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'none',
                            color: '#ec735e',
                            borderColor: '#fbdad2',
                            bgcolor: '#fff9f7',
                            '&:hover': { bgcolor: '#fff0ec' }
                          }}
                        >
                          Full Screen
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>

                {/* Chat Messages Container */}
                <Paper
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: '#fcfbf8',
                    border: '1.5px solid #ded9cd',
                    minHeight: 320,
                    maxHeight: 460,
                    overflowY: 'auto',
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  {tutorMessages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          justifyContent: isUser ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-start',
                          gap: 1.5
                        }}
                      >
                        {!isUser && (
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: '#fff0ec',
                              color: '#ec735e',
                              border: '1.5px solid #fbdad2',
                              flexShrink: 0
                            }}
                          >
                            <SmartToy sx={{ fontSize: 18 }} />
                          </Avatar>
                        )}
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: { xs: '85%', sm: '75%' },
                            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            bgcolor: isUser ? theme.color : '#ffffff',
                            color: isUser ? '#ffffff' : '#20211f',
                            border: isUser ? 'none' : '1px solid #eae5d8',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                          }}
                        >
                          <Typography fontSize={11} fontWeight={700} sx={{ opacity: 0.7, mb: 0.5 }}>
                            {isUser ? 'You' : 'TutorMind Tutor'}
                          </Typography>
                          <Box sx={{ fontSize: 13, lineHeight: 1.6, color: isUser ? '#ffffff' : 'inherit' }}>
                            <MathMessage content={msg.text} />
                          </Box>
                        </Paper>
                        {isUser && (
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: '#ece8de',
                              color: '#444',
                              fontSize: 12,
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            {(user?.name || 'You').slice(0, 2).toUpperCase()}
                          </Avatar>
                        )}
                      </Box>
                    );
                  })}

                  {tutorLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: '#fff0ec',
                          color: '#ec735e',
                          border: '1.5px solid #fbdad2'
                        }}
                      >
                        <SmartToy sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Paper sx={{ p: 1.5, px: 2, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #eae5d8', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CircularProgress size={16} sx={{ color: '#ec735e' }} />
                        <Typography fontSize={12} color="text.secondary">
                          TutorMind Tutor is formulating an answer...
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                  <div ref={tutorEndRef} />
                </Paper>

                {/* Suggested Questions */}
                <Box sx={{ mb: 2 }}>
                  <Typography fontSize={11} fontWeight={800} color="#888" textTransform="uppercase" mb={1}>
                    💡 Suggested Questions for this Chapter:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {chapterQuickPrompts.map((prompt, pIdx) => (
                      <Chip
                        key={pIdx}
                        label={prompt}
                        onClick={() => sendTutorMessage(prompt)}
                        clickable
                        disabled={tutorLoading}
                        sx={{
                          fontSize: 12,
                          fontWeight: 600,
                          bgcolor: '#ffffff',
                          border: '1px solid #e0dbce',
                          color: '#20211f',
                          py: 1,
                          '&:hover': { bgcolor: '#fff5f2', borderColor: '#ec735e' }
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Chat Input Bar */}
                <Paper
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendTutorMessage();
                  }}
                  sx={{
                    p: 0.8,
                    pl: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 3,
                    border: '1.5px solid #ded9cd',
                    bgcolor: '#ffffff',
                    '&:focus-within': { borderColor: theme.color }
                  }}
                >
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder={`Ask any question about ${chapterData.title}... (e.g. "Can you explain this with an analogy?")`}
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    disabled={tutorLoading}
                    InputProps={{ disableUnderline: true }}
                    sx={{ fontSize: 14 }}
                  />
                  <IconButton
                    type="submit"
                    disabled={!tutorInput.trim() || tutorLoading}
                    sx={{
                      bgcolor: theme.color,
                      color: '#ffffff',
                      p: 1.2,
                      ml: 1,
                      '&:hover': { bgcolor: theme.color, opacity: 0.9 },
                      '&.Mui-disabled': { bgcolor: '#ece8de', color: '#aaa' }
                    }}
                  >
                    <Send fontSize="small" />
                  </IconButton>
                </Paper>
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 7: RECOMMENDED YOUTUBE VIDEO LESSONS                      */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'videos' && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{ paddingBottom: 32 }}
              >
                {/* Header Banner */}
                <Paper
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: '#ffffff',
                    border: '1.5px solid #ded9cd',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    mb: 3
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ sm: 'center' }}
                    spacing={1.5}
                  >
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <YouTube sx={{ color: '#ef4444', fontSize: 28 }} />
                        <Typography fontWeight={800} fontSize={17} color="#20211f">
                          Recommended Video Lessons · {chapterData.title}
                        </Typography>
                      </Stack>
                      <Typography fontSize={12} color="text.secondary" mt={0.4}>
                        Hand-curated conceptual walkthroughs and worked examples from premier educators
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      endIcon={<OpenInNew fontSize="small" />}
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${chapterData.topic || 'Math'} ${chapterData.title} lesson`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        textTransform: 'none',
                        color: '#dc2626',
                        borderColor: '#fca5a5',
                        bgcolor: '#fff5f5',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#fee2e2', borderColor: '#ef4444' }
                      }}
                    >
                      Search More on YouTube ↗
                    </Button>
                  </Stack>
                </Paper>

                {/* Video Cards Grid */}
                <Stack spacing={3}>
                  {chapterVideos && chapterVideos.length > 0 ? (
                    chapterVideos.map((video, idx) => (
                      <Paper
                        key={video.youtubeId || idx}
                        elevation={0}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 3,
                          bgcolor: '#ffffff',
                          border: '1px solid #e8e4db',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}
                      >
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
                          {/* Embedded Responsive YouTube Player */}
                          <Box
                            sx={{
                              width: { xs: '100%', md: '420px' },
                              position: 'relative',
                              pt: { xs: '56.25%', md: '236px' },
                              borderRadius: 2.5,
                              overflow: 'hidden',
                              bgcolor: '#0f172a',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                              flexShrink: 0
                            }}
                          >
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
                              title={video.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 0
                              }}
                            />
                          </Box>

                          {/* Video Info & Takeaways */}
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={0.8}>
                                <Chip
                                  icon={<YouTube sx={{ fontSize: '13px !important', color: '#dc2626 !important' }} />}
                                  label={video.channel}
                                  size="small"
                                  sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 800, fontSize: 11 }}
                                />
                                {video.duration && (
                                  <Chip
                                    label={`⏱️ ${video.duration}`}
                                    size="small"
                                    sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: 11 }}
                                  />
                                )}
                                {video.difficulty && (
                                  <Chip
                                    label={video.difficulty}
                                    size="small"
                                    sx={{ bgcolor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontSize: 10.5 }}
                                  />
                                )}
                                {video.isFeatured && (
                                  <Chip
                                    label="⭐ Recommended"
                                    size="small"
                                    sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: 10.5 }}
                                  />
                                )}
                              </Stack>

                              <Typography fontSize={16} fontWeight={800} color="#0f172a" mb={1} lineHeight={1.3}>
                                {video.title}
                              </Typography>

                              <Paper sx={{ p: 1.5, bgcolor: '#fafaf9', border: '1px dashed #e7e5e4', borderRadius: 2, mb: 1.5 }}>
                                <Typography fontSize={11} fontWeight={700} color="#78716c" textTransform="uppercase" letterSpacing={0.5} mb={0.3}>
                                  💡 Key Lesson Takeaway
                                </Typography>
                                <Typography fontSize={12.5} color="#334155" lineHeight={1.5}>
                                  {video.keyTakeaway}
                                </Typography>
                              </Paper>
                            </Box>

                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                              <Button
                                size="small"
                                variant="text"
                                endIcon={<OpenInNew fontSize="small" />}
                                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  textTransform: 'none',
                                  color: '#dc2626',
                                  '&:hover': { bgcolor: '#fef2f2' }
                                }}
                              >
                                Open on YouTube ↗
                              </Button>
                            </Stack>
                          </Box>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: '#ffffff' }}>
                      <Typography fontSize={14} color="#64748b">
                        No video recommendations found for this chapter.
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
          </Box>
        </Box>

        {/* =================================================================== */}
        {/* BOTTOM CHAPTER FLIPPER FOOTER                                       */}
        {/* =================================================================== */}
        <Box
          sx={{
            p: 1.8,
            px: { xs: 2, sm: 3 },
            bgcolor: '#faf8f2',
            borderTop: '1px solid #e6e2d9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          {adjacent.prev ? (
            <Button
              size="small"
              startIcon={<ArrowBack />}
              onClick={() => setCurrentChapterId(adjacent.prev.id)}
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: '#55544e',
                textTransform: 'none'
              }}
            >
              Prev: {adjacent.prev.title}
            </Button>
          ) : (
            <Box />
          )}

          <Typography fontSize={11} color="text.secondary" fontWeight={600}>
            {chapterData.topic} · Chapter {chapterData.chapterNum || 1}
          </Typography>

          {adjacent.next ? (
            <Button
              size="small"
              endIcon={<ArrowForward />}
              onClick={() => setCurrentChapterId(adjacent.next.id)}
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: theme.color,
                textTransform: 'none'
              }}
            >
              Next: {adjacent.next.title}
            </Button>
          ) : (
            <Box />
          )}
        </Box>
    </Dialog>
  );
}
