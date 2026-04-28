/**
 * Access Control Module
 *
 * Client-side access gating for quizzes, exams and bookmark limits.
 *
 * SECURITY NOTE: client-side gating is convenience only. The authoritative
 * access decision lives on the backend (see `backend/src/middleware/requirePro.ts`)
 * which validates the user's RevenueCat entitlement before serving paid content.
 * Anything checked here is bypassable on a modified client; never rely on it
 * for protecting revenue.
 */

import { detectClockManipulation } from './security';

const FREE_SUFFIXES = ['-sample', '-quiz-1'] as const;

// Quiz IDs are kebab-cased: `{platform-segments}-(quiz-N|sample)`. The
// platform/cert prefix may itself contain hyphens (e.g. `azure-az900-quiz-1`
// today, `gcp-professional-data-engineer-quiz-1` if expanded later).
const QUIZ_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)+-(?:quiz-\d+|sample)$/;

const FREE_BOOKMARK_LIMIT = 25;

function isFreeQuiz(quizId: string): boolean {
  return FREE_SUFFIXES.some((suffix) => quizId.endsWith(suffix));
}

export function isValidQuizId(quizId: string): boolean {
  if (!quizId || typeof quizId !== 'string') return false;
  return QUIZ_ID_PATTERN.test(quizId);
}

export function validateContentAccess(quizId: string, isPro: boolean): boolean {
  if (!isValidQuizId(quizId)) return false;
  if (detectClockManipulation()) return false;
  if (isPro) return true;
  return isFreeQuiz(quizId);
}

export function validateExamAccess(isPro: boolean): boolean {
  if (detectClockManipulation()) return false;
  return isPro === true;
}

export function validateBookmarkLimit(currentCount: number, isPro: boolean): boolean {
  // Clamp instead of denying: a bad count from corrupted state shouldn't
  // permanently lock a free user out of bookmarks.
  const safeCount =
    typeof currentCount === 'number' && currentCount >= 0 ? Math.floor(currentCount) : 0;
  if (isPro === true) return true;
  return safeCount < FREE_BOOKMARK_LIMIT;
}

export function getBookmarkLimit(isPro: boolean): number {
  return isPro ? Infinity : FREE_BOOKMARK_LIMIT;
}

export function canAccessContent(
  contentType: 'quiz' | 'exam' | 'bookmark',
  options: { quizId?: string; isPro: boolean; bookmarkCount?: number }
): boolean {
  const { quizId, isPro, bookmarkCount } = options;

  switch (contentType) {
    case 'quiz':
      if (!quizId) return false;
      return validateContentAccess(quizId, isPro);

    case 'exam':
      return validateExamAccess(isPro);

    case 'bookmark':
      if (typeof bookmarkCount !== 'number') return false;
      return validateBookmarkLimit(bookmarkCount, isPro);

    default:
      return false;
  }
}
