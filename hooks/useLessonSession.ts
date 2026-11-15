import { useCallback, useState } from 'react';
import { HEARTS } from '@/lib/learn/progress';
import type { Lesson } from '@/lib/learn/types';

/** Lesson flow state machine: current step, mistakes, hearts (boss lessons only). */
export function useLessonSession(lesson: Lesson) {
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const challenge = !!lesson.boss;

  const onMistake = useCallback(() => {
    setMistakes((m) => m + 1);
    if (challenge) setHearts((h) => Math.max(0, h - 1));
  }, [challenge]);

  const next = useCallback(() => setIndex((i) => i + 1), []);

  const restart = useCallback(() => {
    setIndex(0);
    setMistakes(0);
    setHearts(HEARTS);
  }, []);

  return {
    index,
    step: lesson.steps[index],
    total: lesson.steps.length,
    mistakes,
    hearts,
    challenge,
    finished: index >= lesson.steps.length,
    failed: challenge && hearts === 0,
    onMistake,
    next,
    restart,
  };
}
