import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LearnPath, Lesson, LessonResult, Unit } from './types';

export interface LessonProgress {
  stars: number; // 1-3
  mistakes: number;
}
export interface LearnProgress {
  lessons: Record<string, LessonProgress>;
  xp: number;
  badges: string[];
}

export const EMPTY_PROGRESS: LearnProgress = { lessons: {}, xp: 0, badges: [] };
export const HEARTS = 3;
const KEY = '@learn_progress';

export function starsFor(mistakes: number): number {
  return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
}

export function xpFor(lesson: Lesson, result: LessonResult): number {
  const base = Math.max(5, result.stepCount * 3 - result.mistakes * 2);
  return lesson.boss ? base * 2 : base;
}

export function isLessonDone(p: LearnProgress, lessonId: string): boolean {
  return !!p.lessons[lessonId];
}

export function isUnitDone(p: LearnProgress, unit: Unit): boolean {
  return unit.lessons.every((l) => isLessonDone(p, l.id));
}

export function unitStars(p: LearnProgress, unit: Unit): number {
  if (!isUnitDone(p, unit)) return 0;
  const min = Math.min(...unit.lessons.map((l) => p.lessons[l.id].stars));
  return min;
}

export type UnitState = 'done' | 'current' | 'locked';

/** Units unlock in order. The first unit that is not finished is "current". */
export function unitStates(p: LearnProgress, path: LearnPath): UnitState[] {
  let seenCurrent = false;
  return path.units.map((u) => {
    if (isUnitDone(p, u)) return 'done';
    if (!seenCurrent) {
      seenCurrent = true;
      return 'current';
    }
    return 'locked';
  });
}

/** Lessons inside a unit unlock in order too (a finished lesson can be replayed). */
export function lessonUnlocked(p: LearnProgress, unit: Unit, index: number): boolean {
  return index === 0 || isLessonDone(p, unit.lessons[index - 1].id);
}

export function nextLesson(
  p: LearnProgress,
  path: LearnPath
): { unit: Unit; lesson: Lesson; index: number } | null {
  for (const unit of path.units) {
    const i = unit.lessons.findIndex((l) => !isLessonDone(p, l.id));
    if (i >= 0) return { unit, lesson: unit.lessons[i], index: i };
  }
  return null;
}

/**
 * Record a finished lesson. Keeps the best stars. Passing a boss lesson with 2+ stars tests the
 * whole unit out (every lesson counts as done). Returns the new progress and the XP gained.
 */
export function applyResult(
  p: LearnProgress,
  unit: Unit,
  lesson: Lesson,
  result: LessonResult
): { progress: LearnProgress; xp: number; newBadge: string | null } {
  const stars = starsFor(result.mistakes);
  const prev = p.lessons[lesson.id];
  const lessons = { ...p.lessons };
  lessons[lesson.id] = {
    stars: Math.max(stars, prev?.stars ?? 0),
    mistakes: prev ? Math.min(prev.mistakes, result.mistakes) : result.mistakes,
  };
  if (lesson.boss && stars >= 2) {
    for (const l of unit.lessons) {
      if (!lessons[l.id]) lessons[l.id] = { stars: 2, mistakes: 0 };
    }
  }
  // Only first completion earns full XP; replays earn a quarter so grinding is not the point.
  const gained = prev ? Math.round(xpFor(lesson, result) / 4) : xpFor(lesson, result);
  const next: LearnProgress = { ...p, lessons, xp: p.xp + gained };
  let newBadge: string | null = null;
  if (isUnitDone(next, unit) && !next.badges.includes(unit.badge.id)) {
    next.badges = [...next.badges, unit.badge.id];
    newBadge = unit.badge.title;
  }
  return { progress: next, xp: gained, newBadge };
}

export async function loadProgress(): Promise<LearnProgress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      lessons: parsed.lessons ?? {},
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export async function saveProgress(p: LearnProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Progress is a convenience; never crash a lesson because storage failed.
  }
}
