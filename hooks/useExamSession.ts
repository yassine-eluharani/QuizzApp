import { useState, useCallback, useRef, useEffect } from 'react';
import { Question, QuizAttempt, AnswerRecord } from '@/types/quiz';
import { loadCertQuestions } from '@/lib/questionLoader';
import { getCertification } from '@/assets/data/catalog';
import { shuffleArray, generateId } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';
import { useTimer } from './useTimer';

interface ExamSessionState {
  questions: Question[];
  currentIndex: number;
  selectedAnswers: number[];
  isRevealed: boolean;
  isCorrect: boolean | null;
  score: number;
  isComplete: boolean;
  answers: AnswerRecord[];
}

export function useExamSession(certId: string, isPro: boolean = false) {
  const { addAttempt, recordStudySession } = useAppContext();
  const result = getCertification(certId);
  const cert = result?.certification;
  const platform = result?.platform;

  const duration = (cert?.examDuration || 60) * 60;
  const questionCount = cert?.totalExamQuestions || 20;

  const timer = useTimer(duration);
  const startTime = useRef(Date.now());

  const [state, setState] = useState<ExamSessionState>(() => {
    const allQuestions = loadCertQuestions(certId, isPro);
    const shuffled = shuffleArray(allQuestions);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    startTime.current = Date.now();
    return {
      questions: selected,
      currentIndex: 0,
      selectedAnswers: [],
      isRevealed: false,
      isCorrect: null,
      score: 0,
      isComplete: false,
      answers: [],
    };
  });

  useEffect(() => {
    timer.start();
  }, []);

  const currentQuestion = state.questions[state.currentIndex];

  const selectAnswer = useCallback((index: number) => {
    setState(prev => {
      if (prev.isRevealed) return prev;
      const q = prev.questions[prev.currentIndex];
      const maxSelections = q.correct_answer_indices.length;
      let newSelected: number[];
      if (prev.selectedAnswers.includes(index)) {
        newSelected = prev.selectedAnswers.filter(a => a !== index);
      } else if (prev.selectedAnswers.length < maxSelections) {
        newSelected = [...prev.selectedAnswers, index];
      } else {
        return prev;
      }
      return { ...prev, selectedAnswers: newSelected };
    });
  }, []);

  const confirm = useCallback(() => {
    setState(prev => {
      if (prev.isRevealed) return prev;
      const q = prev.questions[prev.currentIndex];
      const correct = q.correct_answer_indices.length === prev.selectedAnswers.length &&
        q.correct_answer_indices.every(i => prev.selectedAnswers.includes(i));

      const record: AnswerRecord = {
        questionId: q.id || `q-${prev.currentIndex}`,
        selectedIndices: prev.selectedAnswers,
        correct,
      };

      return {
        ...prev,
        isRevealed: true,
        isCorrect: correct,
        score: correct ? prev.score + 1 : prev.score,
        answers: [...prev.answers, record],
      };
    });
  }, []);

  const next = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex >= prev.questions.length - 1) {
        return { ...prev, isComplete: true };
      }
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        selectedAnswers: [],
        isRevealed: false,
        isCorrect: null,
      };
    });
  }, []);

  const finish = useCallback(async () => {
    timer.pause();
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    const attempt: QuizAttempt = {
      id: generateId(),
      quizId: `${certId}-exam`,
      certificationId: certId,
      platformId: platform?.id || '',
      mode: 'exam',
      date: new Date().toISOString(),
      score: state.score,
      totalQuestions: state.questions.length,
      percentage: (state.score / state.questions.length) * 100,
      timeTaken,
      answers: state.answers,
    };

    await addAttempt(attempt);
    await recordStudySession();
    return attempt;
  }, [state.score, state.questions.length, state.answers, certId, platform, timer, addAttempt, recordStudySession]);

  return {
    ...state,
    currentQuestion,
    totalQuestions: state.questions.length,
    selectAnswer,
    confirm,
    next,
    finish,
    timer,
    platformColor: platform?.color || '#6C63FF',
    certName: cert?.name || '',
  };
}
