import { useState, useCallback, useRef } from 'react';
import { Question, QuizAttempt, AnswerRecord } from '@/types/quiz';
import { loadQuizQuestions } from '@/lib/questionLoader';
import { getQuizMeta } from '@/assets/data/catalog';
import { shuffleArray, generateId } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';

interface QuizSessionState {
  questions: Question[];
  currentIndex: number;
  selectedAnswers: number[];
  isRevealed: boolean;
  isCorrect: boolean | null;
  score: number;
  isComplete: boolean;
  answers: AnswerRecord[];
}

export function useQuizSession(quizId: string, isPro: boolean = false) {
  const { addAttempt, recordStudySession } = useAppContext();
  const meta = getQuizMeta(quizId);
  const startTime = useRef(Date.now());

  const [state, setState] = useState<QuizSessionState>(() => {
    const raw = loadQuizQuestions(quizId, isPro);
    const questions = shuffleArray(raw);
    startTime.current = Date.now();
    return {
      questions,
      currentIndex: 0,
      selectedAnswers: [],
      isRevealed: false,
      isCorrect: null,
      score: 0,
      isComplete: false,
      answers: [],
    };
  });

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
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    const attempt: QuizAttempt = {
      id: generateId(),
      quizId,
      certificationId: meta?.certification.id || '',
      platformId: meta?.platform.id || '',
      mode: 'quiz',
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
  }, [state.score, state.questions.length, state.answers, quizId, meta, addAttempt, recordStudySession]);

  return {
    ...state,
    currentQuestion,
    totalQuestions: state.questions.length,
    selectAnswer,
    confirm,
    next,
    finish,
    platformColor: meta?.platform.color || '#6C63FF',
    certName: meta?.certification.name || '',
    quizName: meta?.quiz.name || '',
  };
}
