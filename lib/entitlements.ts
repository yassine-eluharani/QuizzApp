/**
 * Entitlements Module
 * Public API for checking content access - delegates to accessControl for validation
 */

import {
  validateContentAccess,
  validateExamAccess,
  validateBookmarkLimit,
  getBookmarkLimit as _getLimit,
} from './accessControl';

export const FREE_BOOKMARK_LIMIT = 10;

/**
 * Sample quizzes (ending in -sample) are free for all users.
 */
export function isSampleQuiz(quizId: string): boolean {
  return quizId.endsWith('-sample');
}

/**
 * Check if a quiz is accessible to the user.
 */
export function isQuizAccessible(quizId: string, isPro: boolean): boolean {
  // DEV BYPASS - remove before production
  if (__DEV__) return true;

  if (isSampleQuiz(quizId)) return true;

  return validateContentAccess(quizId, isPro);
}

/**
 * Check if practice exams are accessible.
 */
export function isExamAccessible(isPro: boolean): boolean {
  return validateExamAccess(isPro);
}

/**
 * Check if user can add more bookmarks.
 */
export function canAddBookmark(currentCount: number, isPro: boolean): boolean {
  return validateBookmarkLimit(currentCount, isPro);
}

/**
 * Get the bookmark limit for display purposes.
 */
export function getBookmarkLimitForDisplay(isPro: boolean): number | string {
  const limit = _getLimit(isPro);
  return limit === Infinity ? 'Unlimited' : limit;
}

/**
 * Get access status summary for a quiz.
 */
export function getQuizAccessStatus(quizId: string, isPro: boolean): {
  accessible: boolean;
  reason: 'sample' | 'pro' | 'locked';
} {
  if (isSampleQuiz(quizId)) return { accessible: true, reason: 'sample' };
  if (isPro) return { accessible: true, reason: 'pro' };
  return { accessible: false, reason: 'locked' };
}
