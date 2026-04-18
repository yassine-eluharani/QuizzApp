/**
 * Access Control Module
 * Handles content access validation with multiple verification layers
 */

import { getSecurityState, detectClockManipulation } from './security';

// Obfuscated constants - split across module to make patching harder
const _a = [0x61, 0x77, 0x73]; // 'aws'
const _s = [0x73, 0x61, 0x61]; // 'saa'
const _q = [0x71, 0x75, 0x69, 0x7a]; // 'quiz'
const _n = [0x31]; // '1'

function _d(arr: number[]): string {
  return String.fromCharCode(...arr);
}

function _buildFreeId(): string {
  return `${_d(_a)}-${_d(_s)}-${_d(_q)}-${_d(_n)}`;
}

// Multiple validation functions - makes single-point patching harder
type ValidationFn = (quizId: string, isPro: boolean) => boolean;

const _v1: ValidationFn = (quizId, isPro) => {
  if (isPro) return true;
  const freeId = _buildFreeId();
  return quizId === freeId;
};

const _v2: ValidationFn = (quizId, isPro) => {
  // Secondary check - validates the quiz ID format
  if (!quizId || typeof quizId !== 'string') return false;
  if (isPro) return true;
  return quizId.startsWith(_d(_a)) && quizId.includes(_d(_q)) && quizId.endsWith(_d(_n));
};

const _v3: ValidationFn = (quizId, isPro) => {
  // Tertiary check - hash-based validation
  const freeHash = hashString(_buildFreeId());
  const inputHash = hashString(quizId);
  if (isPro) return true;
  return freeHash === inputHash;
};

// Simple string hash for comparison
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Multi-layer access validation
export function validateContentAccess(quizId: string, isPro: boolean): boolean {
  // DEV BYPASS - remove before production
  if (__DEV__) return true;

  // Check for clock manipulation (potential tampering)
  if (detectClockManipulation()) {
    return false;
  }

  // Run multiple validation functions
  const results = [
    _v1(quizId, isPro),
    _v2(quizId, isPro),
    _v3(quizId, isPro),
  ];

  // All validators must agree
  const allAgree = results.every(r => r === results[0]);
  if (!allAgree) {
    // Validators disagree - potential tampering
    return false;
  }

  return results[0];
}

// Validate exam access with additional checks
export function validateExamAccess(isPro: boolean): boolean {
  if (detectClockManipulation()) {
    return false;
  }

  // Exams require pro - no exceptions
  return isPro === true;
}

// Bookmark limit validation
const _bl = 0x0A; // 10 in hex

export function validateBookmarkLimit(currentCount: number, isPro: boolean): boolean {
  if (typeof currentCount !== 'number' || currentCount < 0) {
    return false;
  }

  if (isPro === true) return true;
  return currentCount < _bl;
}

// Get the current bookmark limit (for display purposes)
export function getBookmarkLimit(isPro: boolean): number {
  return isPro ? Infinity : _bl;
}

// Validate that a quiz ID is properly formatted
export function isValidQuizId(quizId: string): boolean {
  if (!quizId || typeof quizId !== 'string') return false;

  // Must match pattern: platform-cert-quiz-number
  const parts = quizId.split('-');
  if (parts.length < 3) return false;

  const hasQuiz = parts.some(p => p === _d(_q));
  return hasQuiz;
}

// Check if content should be accessible (combines all checks)
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
