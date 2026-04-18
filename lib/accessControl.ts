/**
 * Access Control Module
 * Handles content access validation with multiple verification layers
 */

import { getSecurityState, detectClockManipulation } from './security';

// Obfuscated suffix bytes for '-sample'
const _sfx = [0x2d, 0x73, 0x61, 0x6d, 0x70, 0x6c, 0x65]; // '-sample'
// Obfuscated suffix bytes for '-quiz-1'
const _sfx2 = [0x2d, 0x71, 0x75, 0x69, 0x7a, 0x2d, 0x31]; // '-quiz-1'

function _d(arr: number[]): string {
  return String.fromCharCode(...arr);
}

function _isFreeQuiz(quizId: string): boolean {
  return quizId.endsWith(_d(_sfx)) || quizId.endsWith(_d(_sfx2));
}

// Multiple validation functions - makes single-point patching harder
type ValidationFn = (quizId: string, isPro: boolean) => boolean;

const _v1: ValidationFn = (quizId, isPro) => {
  if (isPro) return true;
  return _isFreeQuiz(quizId);
};

const _v2: ValidationFn = (quizId, isPro) => {
  if (!quizId || typeof quizId !== 'string') return false;
  if (isPro) return true;
  return _isFreeQuiz(quizId);
};

const _v3: ValidationFn = (quizId, isPro) => {
  if (isPro) return true;
  const sample = _d(_sfx);
  const first = _d(_sfx2);
  const sampleHash = hashString(sample);
  const firstHash = hashString(first);
  const sampleSuffix = quizId.slice(-sample.length);
  const firstSuffix = quizId.slice(-first.length);
  return hashString(sampleSuffix) === sampleHash || hashString(firstSuffix) === firstHash;
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
const _bl = 0x19; // 25 in hex

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
  // Matches: platform-cert-quiz-N  OR  platform-cert-sample
  return /^[a-z0-9]+-[a-z0-9]+-(?:quiz-\d+|sample)$/.test(quizId);
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
