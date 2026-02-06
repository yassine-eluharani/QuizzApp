/**
 * Entitlements Module
 * Public API for checking content access - delegates to accessControl for validation
 */

import { getQuizMeta } from '@/assets/data/catalog';
import {
  validateContentAccess,
  validateExamAccess,
  validateBookmarkLimit,
  getBookmarkLimit as _getLimit,
} from './accessControl';

// Re-export for backward compatibility, but actual logic is in accessControl
export const FREE_QUIZZES = new Set(['aws-saa-quiz-1']);
export const FREE_BOOKMARK_LIMIT = 10;

/**
 * Check if a quiz is accessible to the user
 * Uses multi-layer validation to prevent tampering
 */
export function isQuizAccessible(quizId: string, isPro: boolean): boolean {
  // Primary validation through access control
  const accessValid = validateContentAccess(quizId, isPro);

  // Secondary validation through catalog metadata
  const meta = getQuizMeta(quizId);
  const metaValid = meta?.quiz.isFree === true || isPro;

  // Both checks must pass for free content
  // Pro users bypass the meta check requirement
  if (isPro) return accessValid;
  return accessValid && metaValid;
}

/**
 * Check if practice exams are accessible
 */
export function isExamAccessible(isPro: boolean): boolean {
  return validateExamAccess(isPro);
}

/**
 * Check if user can add more bookmarks
 */
export function canAddBookmark(currentCount: number, isPro: boolean): boolean {
  return validateBookmarkLimit(currentCount, isPro);
}

/**
 * Get the bookmark limit for display purposes
 */
export function getBookmarkLimitForDisplay(isPro: boolean): number | string {
  const limit = _getLimit(isPro);
  return limit === Infinity ? 'Unlimited' : limit;
}

/**
 * Check if a quiz is marked as free in the catalog
 */
export function isQuizFree(quizId: string): boolean {
  const meta = getQuizMeta(quizId);
  return meta?.quiz.isFree === true;
}

/**
 * Get access status summary for a quiz
 */
export function getQuizAccessStatus(quizId: string, isPro: boolean): {
  accessible: boolean;
  reason: 'free' | 'pro' | 'locked';
} {
  if (isPro) {
    return { accessible: true, reason: 'pro' };
  }

  if (isQuizFree(quizId) && validateContentAccess(quizId, false)) {
    return { accessible: true, reason: 'free' };
  }

  return { accessible: false, reason: 'locked' };
}
