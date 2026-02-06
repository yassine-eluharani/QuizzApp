import { getQuizMeta } from '@/assets/data/catalog';

export const FREE_QUIZZES = new Set(['aws-saa-quiz-1']);
export const FREE_BOOKMARK_LIMIT = 10;

export function isQuizAccessible(quizId: string, isPro: boolean): boolean {
  if (isPro) return true;
  return FREE_QUIZZES.has(quizId);
}

export function isExamAccessible(isPro: boolean): boolean {
  return isPro;
}

export function canAddBookmark(currentCount: number, isPro: boolean): boolean {
  if (isPro) return true;
  return currentCount < FREE_BOOKMARK_LIMIT;
}

export function isQuizFree(quizId: string): boolean {
  const meta = getQuizMeta(quizId);
  return meta?.quiz.isFree === true;
}
