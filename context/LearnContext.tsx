import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import {
  applyResult,
  EMPTY_PROGRESS,
  loadProgress,
  saveProgress,
  type LearnProgress,
} from '@/lib/learn/progress';
import type { Lesson, LessonResult, Unit } from '@/lib/learn/types';

interface LearnContextType {
  progress: LearnProgress;
  isLoaded: boolean;
  completeLesson: (
    unit: Unit,
    lesson: Lesson,
    result: LessonResult
  ) => Promise<{ xp: number; newBadge: string | null; stars: number }>;
}

const LearnContext = createContext<LearnContextType | undefined>(undefined);

export function LearnProvider({ children }: { children: React.ReactNode }) {
  const { recordStudySession } = useAppContext();
  const [progress, setProgress] = useState<LearnProgress>(EMPTY_PROGRESS);
  const [isLoaded, setLoaded] = useState(false);
  const ref = useRef(progress);
  ref.current = progress;

  useEffect(() => {
    let cancelled = false;
    loadProgress().then((p) => {
      if (cancelled) return;
      setProgress(p);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const completeLesson = useCallback(
    async (unit: Unit, lesson: Lesson, result: LessonResult) => {
      const { progress: next, xp, newBadge } = applyResult(ref.current, unit, lesson, result);
      ref.current = next;
      setProgress(next);
      await saveProgress(next);
      // A finished lesson counts toward the same daily streak as quizzes.
      await recordStudySession();
      return { xp, newBadge, stars: next.lessons[lesson.id].stars };
    },
    [recordStudySession]
  );

  return (
    <LearnContext.Provider value={{ progress, isLoaded, completeLesson }}>
      {children}
    </LearnContext.Provider>
  );
}

export function useLearn(): LearnContextType {
  const ctx = useContext(LearnContext);
  if (!ctx) throw new Error('useLearn must be used inside LearnProvider');
  return ctx;
}
