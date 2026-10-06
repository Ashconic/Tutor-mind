import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Paper,
  Divider,
  CircularProgress,
  Avatar,
  Collapse
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Cancel,
  ArrowForward,
  Replay,
  Assignment,
  MenuBook,
  AutoAwesome,
  EmojiEvents,
  HelpOutline,
  Psychology,
  Warning
} from '@mui/icons-material';
import api from '../api';
import MathMessage from './MathMessage';
import { getTextbookChapterById } from '../data/textbookData';

export default function AssignmentSolverModal({
  open,
  assignment,
  user,
  onClose,
  onSubmitAssignment,
  onOpenTextbook,
  onAskTutor,
  onToast
}) {
  if (!assignment) return null;

  const questions = useMemo(() => {
    const fullId = assignment.chapter?.includes(':')
      ? assignment.chapter
      : `${assignment.topic || 'Algebra'}:${assignment.chapter}`;
    const ch = getTextbookChapterById(fullId) || getTextbookChapterById(assignment.chapter);

    if (ch?.quiz && Array.isArray(ch.quiz) && ch.quiz.length > 0) {
      return ch.quiz;
    }

    // Procedural fallback questions tailored to the chapter
    const topic = assignment.topic || 'Algebra';
    const chapter = assignment.chapter || 'Linear equations';
    return [
      {
        id: 'q1',
        question: `Solve the core problem for **${chapter}** (${topic}):\n\nFind the value of $x$ that satisfies:\n$$3x + 9 = 24$$`,
        options: ['$x = 5$', '$x = 11$', '$x = 7$', '$x = -5$'],
        answer: '$x = 5$',
        explanation: 'Subtract 9 from both sides: $3x = 15$. Divide both sides by 3: $x = 5$. Check: $3(5) + 9 = 24$.'
      },
      {
        id: 'q2',
        question: 'Simplify and solve the algebraic relationship:\n\n$$2(x - 4) + 3(2x + 1) = 19$$',
        options: ['$x = 3$', '$x = 2$', '$x = 4$', '$x = 5$'],
        answer: '$x = 3$',
        explanation: 'Expand: $2x - 8 + 6x + 3 = 8x - 5$. Set $8x - 5 = 19 \\implies 8x = 24 \\implies x = 3$.'
      },
      {
        id: 'q3',
        question: `Evaluate the function representation for **${chapter}**:\n\nIf $f(x) = 2x^2 - 3x + 1$, what is $f(-2)$?`,
        options: ['$15$', '$-1$', '$11$', '$7$'],
        answer: '$15$',
        explanation: 'Substitute $x = -2$: $2(-2)^2 - 3(-2) + 1 = 2(4) + 6 + 1 = 8 + 6 + 1 = 15$.'
      }
    ];
  }, [assignment]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [answersState, setAnswersState] = useState([]); // [{ selected, isCorrect, score }]
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset or initialize state on assignment change
  useEffect(() => {
    if (open) {
      if (assignment.isCompleted) {
        setIsFinished(true);
      } else {
        setCurrentIdx(0);
        setSelectedOption(null);
        setIsChecked(false);
        setAnswersState([]);
        setIsFinished(false);
        setIsSubmitting(false);
        setShowHint(false);
      }
    }
  }, [open, assignment?.id, assignment?.isCompleted]);

  const currentQ = questions[currentIdx] || questions[0];
  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);

  const cleanOption = (opt) => {
    if (!opt) return '';
    return opt.replace(/^[A-D][\.\)]\s*/i, '').trim();
  };

  const isMatching = (optA, optB) => {
    if (!optA || !optB) return false;
    const cleanA = cleanOption(optA).replace(/[\$\s\\]/g, '');
    const cleanB = cleanOption(optB).replace(/[\$\s\\]/g, '');
    return cleanA.toLowerCase() === cleanB.toLowerCase();
  };

  const handleSelectOption = (opt) => {
    if (isChecked || assignment.isCompleted) return;
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || isChecked) return;
    const correct = isMatching(selectedOption, currentQ.answer);
    setIsChecked(true);
    setAnswersState((prev) => {
      const copy = [...prev];
      copy[currentIdx] = {
        question: currentQ.question,
        selected: selectedOption,
        correctAnswer: currentQ.answer,
        isCorrect: correct
      };
      return copy;
    });

    if (!correct) {
      api.post('/student/struggle-signal', {
        subject: assignment.topic || 'Mathematics',
        chapterId: assignment.chapter || '',
        chapterTitle: assignment.chapter || 'Assignment Problem',
        triggerType: 'wrong_answer',
        question: currentQ.question,
        selectedAnswer: selectedOption,
        correctAnswer: currentQ.answer,
        concept: currentQ.concept || '',
        detail: `Assignment "${assignment.title}": selected "${selectedOption}" (Correct: "${currentQ.answer}")`
      }).catch(() => {});
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
      setShowHint(false);
    } else {
      setIsFinished(true);
    }
  };

  const totalCorrect = useMemo(() => {
    return answersState.filter((a) => a?.isCorrect).length;
  }, [answersState]);

  const finalScore = assignment.isCompleted && typeof assignment.score === 'number'
    ? assignment.score
    : totalCorrect;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (onSubmitAssignment) {
        await onSubmitAssignment(assignment, {
          score: finalScore,
          total: questions.length
        });
      }
      onClose();
    } catch (err) {
      onToast?.('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullChapterKey = assignment.chapter?.includes(':')
    ? assignment.chapter
    : `${assignment.topic || 'Algebra'}:${assignment.chapter}`;

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: '#fffdfa',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          border: '1px solid #e6e2d9'
        }
      }}
    >
      {/* Top Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: '#ffffff', borderBottom: '1px solid #e6e2d9' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: '#ea580c',
                  color: '#fff',
                  width: 42,
                  height: 42,
                  boxShadow: '0 4px 12px rgba(234,88,12,0.25)'
                }}
              >
                <Assignment />
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
                  <Chip
                    label={assignment.topic || 'Mathematics'}
                    size="small"
                    sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 700, fontSize: 10, height: 20 }}
                  />
                  <Chip
                    label={assignment.chapter}
                    size="small"
                    sx={{ bgcolor: '#ffedd5', color: '#9a3412', fontWeight: 700, fontSize: 10, height: 20 }}
                  />
                  <Chip
                    label={`+${assignment.xpReward || 100} XP`}
                    size="small"
                    sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: 10, height: 20, border: '1px solid #fde68a' }}
                  />
                  {assignment.isCompleted && (
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: '12px !important', color: '#16a34a !important' }} />}
                      label={`Completed (Score: ${finalScore}/${questions.length})`}
                      size="small"
                      sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: 10, height: 20 }}
                    />
                  )}
                </Stack>
                <Typography variant="h6" fontWeight={800} color="#20211f" mt={0.5}>
                  {assignment.title}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
              <Close />
            </IconButton>
          </Stack>

          {!isFinished && (
            <Box mt={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography fontSize={11} fontWeight={700} color="text.secondary">
                  Question {currentIdx + 1} of {questions.length}
                </Typography>
                <Typography fontSize={11} fontWeight={800} color="#ea580c">
                  {progressPercent}% Complete
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#fed7aa',
                  '& .MuiLinearProgress-bar': { bgcolor: '#ea580c', borderRadius: 3 }
                }}
              />
            </Box>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {isFinished ? (
          /* Final Results and Submit Screen */
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar
              sx={{
                mx: 'auto',
                bgcolor: finalScore >= 2 ? '#dcfce7' : '#ffedd5',
                color: finalScore >= 2 ? '#16a34a' : '#ea580c',
                width: 72,
                height: 72,
                mb: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
              }}
            >
              <EmojiEvents sx={{ fontSize: 40 }} />
            </Avatar>

            <Typography variant="h4" fontWeight={800} color="#20211f">
              {assignment.isCompleted ? 'Assignment Results' : 'Great Job Solving the Problems!'}
            </Typography>

            <Typography fontSize={14} color="text.secondary" mt={1} maxWidth={500} mx="auto">
              {assignment.isCompleted
                ? `You have submitted this assignment with a final score of ${finalScore} out of ${questions.length}.`
                : `You scored ${finalScore} out of ${questions.length} on your assignment problems. Ready to submit to your teacher!`}
            </Typography>

            <Paper
              sx={{
                maxWidth: 420,
                mx: 'auto',
                mt: 3,
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#fff',
                border: '1px solid #fed7aa',
                boxShadow: '0 6px 20px rgba(234,88,12,0.08)'
              }}
            >
              <Stack direction="row" justifyContent="space-around" alignItems="center">
                <Box>
                  <Typography fontSize={11} fontWeight={700} color="text.secondary">
                    FINAL ACCURACY
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#ea580c" mt={0.5}>
                    {Math.round((finalScore / questions.length) * 100)}%
                  </Typography>
                  <Typography fontSize={11} color="text.secondary">
                    {finalScore} of {questions.length} correct
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography fontSize={11} fontWeight={700} color="text.secondary">
                    BONUS XP REWARD
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#b45309" mt={0.5}>
                    +{assignment.xpReward || 100} XP
                  </Typography>
                  <Typography fontSize={11} color="text.secondary">
                    Instructor verified
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Questions Recap */}
            <Box mt={3} maxWidth={580} mx="auto" textAlign="left">
              <Typography fontSize={12} fontWeight={800} color="text.secondary" mb={1.5}>
                QUESTION BREAKDOWN
              </Typography>
              <Stack spacing={1.5}>
                {questions.map((q, idx) => {
                  const ansObj = answersState[idx];
                  const wasCorrect = ansObj ? ansObj.isCorrect : true;
                  return (
                    <Paper
                      key={q.id || idx}
                      sx={{
                        p: 1.8,
                        borderRadius: 2.5,
                        bgcolor: wasCorrect ? '#f0fdf4' : '#fef2f2',
                        border: '1px solid',
                        borderColor: wasCorrect ? '#bbf7d0' : '#fecaca'
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        {wasCorrect ? (
                          <CheckCircle sx={{ color: '#16a34a', fontSize: 20, mt: 0.2 }} />
                        ) : (
                          <Cancel sx={{ color: '#dc2626', fontSize: 20, mt: 0.2 }} />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography fontSize={12} fontWeight={700} color="#1e293b">
                            Problem {idx + 1}:
                          </Typography>
                          <Box sx={{ fontSize: 13, my: 0.5 }}>
                            <MathMessage content={q.question} />
                          </Box>
                          <Typography fontSize={12} color={wasCorrect ? '#15803d' : '#991b1b'} fontWeight={600}>
                            Answer: <b>{q.answer}</b>
                          </Typography>
                          <Box sx={{ mt: 0.5, fontSize: 11, color: '#475569' }}>
                            <MathMessage content={q.explanation} />
                          </Box>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        ) : (
          /* Active Question Solver Screen */
          <Box>
            {/* Question Card */}
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                mb: 3
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Chip
                  label={`Problem ${currentIdx + 1} of ${questions.length}`}
                  size="small"
                  sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 800, fontSize: 11 }}
                />
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setShowHint(!showHint)}
                  startIcon={<HelpOutline fontSize="small" />}
                  sx={{ textTransform: 'none', fontWeight: 700, color: '#ea580c' }}
                >
                  {showHint ? 'Hide Hint' : 'View Hint & Formula'}
                </Button>
              </Stack>

              <Collapse in={showHint}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 2 }}>
                  <Typography fontSize={11} fontWeight={800} color="#9a3412" mb={0.5}>
                    💡 CHAPTER FORMULA & NOTES:
                  </Typography>
                  <Typography fontSize={12} color="#7c2d12">
                    Remember to isolate variables using opposite operations on both sides. For <b>{assignment.chapter}</b>, check each step carefully.
                  </Typography>
                  {onOpenTextbook && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onOpenTextbook(fullChapterKey)}
                      startIcon={<MenuBook fontSize="small" />}
                      sx={{ mt: 1, textTransform: 'none', fontWeight: 700, borderColor: '#ea580c', color: '#ea580c' }}
                    >
                      Open Full Chapter Notes in Textbook
                    </Button>
                  )}
                </Paper>
              </Collapse>

              <Box sx={{ fontSize: 16, color: '#1e293b', fontWeight: 600, lineHeight: 1.7 }}>
                <MathMessage content={currentQ.question} />
              </Box>
            </Paper>

            {/* Multiple Choice Options */}
            <Typography fontSize={12} fontWeight={800} color="text.secondary" mb={1.5} letterSpacing={0.5}>
              CHOOSE THE CORRECT ANSWER:
            </Typography>

            <Stack spacing={1.5} mb={3}>
              {currentQ.options?.map((opt, optIdx) => {
                const optLetter = String.fromCharCode(65 + optIdx);
                const isSelected = selectedOption === opt;
                const isCorrectOption = isMatching(opt, currentQ.answer);

                let borderColor = '#e2e8f0';
                let bgColor = '#ffffff';
                let textColor = '#1e293b';

                if (isChecked) {
                  if (isCorrectOption) {
                    borderColor = '#16a34a';
                    bgColor = '#f0fdf4';
                    textColor = '#166534';
                  } else if (isSelected && !isCorrectOption) {
                    borderColor = '#dc2626';
                    bgColor = '#fef2f2';
                    textColor = '#991b1b';
                  }
                } else if (isSelected) {
                  borderColor = '#ea580c';
                  bgColor = '#fff7ed';
                  textColor = '#9a3412';
                }

                return (
                  <Paper
                    key={optIdx}
                    onClick={() => handleSelectOption(opt)}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: '2px solid',
                      borderColor,
                      bgcolor: bgColor,
                      cursor: isChecked ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: isChecked ? borderColor : '#ea580c',
                        boxShadow: isChecked ? 'none' : '0 4px 12px rgba(234,88,12,0.1)'
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: 13,
                          fontWeight: 800,
                          bgcolor: isChecked
                            ? isCorrectOption
                              ? '#16a34a'
                              : isSelected
                              ? '#dc2626'
                              : '#e2e8f0'
                            : isSelected
                            ? '#ea580c'
                            : '#f1f5f9',
                          color: isChecked && (isCorrectOption || isSelected) ? '#fff' : isSelected ? '#fff' : '#475569'
                        }}
                      >
                        {optLetter}
                      </Avatar>

                      <Box sx={{ flex: 1, fontSize: 14, fontWeight: isSelected ? 700 : 500, color: textColor }}>
                        <MathMessage content={opt} />
                      </Box>

                      {isChecked && isCorrectOption && (
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
                          label="Correct Answer"
                          size="small"
                          sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: 10 }}
                        />
                      )}
                      {isChecked && isSelected && !isCorrectOption && (
                        <Chip
                          icon={<Cancel sx={{ fontSize: '14px !important', color: '#dc2626 !important' }} />}
                          label="Your Answer"
                          size="small"
                          sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 800, fontSize: 10 }}
                        />
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>

            {/* Explanation box after checking */}
            {isChecked && (
              <Paper
                sx={{
                  p: 2.5,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: isMatching(selectedOption, currentQ.answer) ? '#f0fdf4' : '#fff7ed',
                  border: '1px solid',
                  borderColor: isMatching(selectedOption, currentQ.answer) ? '#bbf7d0' : '#fed7aa'
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                  {isMatching(selectedOption, currentQ.answer) ? (
                    <CheckCircle sx={{ color: '#16a34a', fontSize: 22 }} />
                  ) : (
                    <HelpOutline sx={{ color: '#ea580c', fontSize: 22 }} />
                  )}
                  <Typography variant="subtitle2" fontWeight={800} color={isMatching(selectedOption, currentQ.answer) ? '#15803d' : '#9a3412'}>
                    {isMatching(selectedOption, currentQ.answer) ? 'Spot on! Correct answer.' : 'Step-by-step Solution:'}
                  </Typography>
                </Stack>
                <Box sx={{ fontSize: 13, color: '#334155', pl: 0.5 }}>
                  <MathMessage content={currentQ.explanation} />
                </Box>
                {!isMatching(selectedOption, currentQ.answer) && (
                  <Stack direction="row" spacing={1} alignItems="center" mt={2} flexWrap="wrap" gap={1}>
                    <Chip
                      size="small"
                      icon={<Warning sx={{ fontSize: '13px !important', color: '#b91c1c !important' }} />}
                      label="Struggle Alert Dispatched to Educator Dashboard"
                      sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: 11, border: '1px solid #fca5a5' }}
                    />
                    {onAskTutor && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Psychology sx={{ fontSize: 15 }} />}
                        onClick={() => {
                          const prompt = `I am solving assignment "${assignment.title}" (${assignment.topic}: ${assignment.chapter}) and answered incorrectly on this question:\n"${currentQ.question}"\nI picked: "${selectedOption}"\nCorrect answer: "${currentQ.answer}"\nCan you explain my mistake and guide me through the concept?`;
                          onAskTutor(prompt);
                        }}
                        sx={{
                          borderColor: '#ea580c',
                          color: '#ea580c',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: 11,
                          py: 0.3,
                          '&:hover': { bgcolor: '#fff7ed', borderColor: '#c2410c' }
                        }}
                      >
                        🤖 Ask AI Tutor About This Mistake
                      </Button>
                    )}
                  </Stack>
                )}
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      {/* Bottom Footer Actions */}
      <DialogActions
        sx={{
          p: { xs: 2, sm: 2.5 },
          bgcolor: '#ffffff',
          borderTop: '1px solid #e6e2d9',
          justifyContent: 'space-between'
        }}
      >
        {isFinished ? (
          <>
            {!assignment.isCompleted && (
              <Button
                variant="text"
                onClick={() => {
                  setIsFinished(false);
                  setCurrentIdx(0);
                  setSelectedOption(null);
                  setIsChecked(false);
                }}
                startIcon={<Replay />}
                sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b' }}
              >
                Retry Problems
              </Button>
            )}
            <Box sx={{ ml: 'auto' }}>
              {!assignment.isCompleted ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                  sx={{
                    bgcolor: '#ea580c',
                    color: '#fff',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    px: 3,
                    py: 1.1,
                    fontSize: 13,
                    boxShadow: '0 6px 18px rgba(234,88,12,0.3)',
                    '&:hover': { bgcolor: '#c2410c' }
                  }}
                >
                  {isSubmitting ? 'Submitting to Teacher...' : `Complete & Submit (+${assignment.xpReward || 100} XP)`}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={onClose}
                  sx={{
                    bgcolor: '#20211f',
                    color: '#fff',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    px: 3
                  }}
                >
                  Close Review
                </Button>
              )}
            </Box>
          </>
        ) : (
          <>
            <Button
              variant="text"
              onClick={() => onOpenTextbook && onOpenTextbook(fullChapterKey)}
              startIcon={<MenuBook />}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b' }}
            >
              Study Notes
            </Button>

            <Box>
              {!isChecked ? (
                <Button
                  variant="contained"
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                  sx={{
                    bgcolor: '#ea580c',
                    color: '#fff',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    px: 3,
                    py: 1,
                    '&:hover': { bgcolor: '#c2410c' }
                  }}
                >
                  Check Answer
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: '#20211f',
                    color: '#fff',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    px: 3,
                    py: 1,
                    '&:hover': { bgcolor: '#334155' }
                  }}
                >
                  {currentIdx < questions.length - 1 ? 'Next Question' : 'View Results & Submit'}
                </Button>
              )}
            </Box>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
