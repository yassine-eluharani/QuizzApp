jest.mock('../lib/security', () => ({ detectClockManipulation: () => false }));

const { getCertification, getQuizMeta } = require('../assets/data/catalog');
const { loadQuizQuestions, loadCertQuestions } = require('../lib/questionLoader');
const { isQuizAccessible } = require('../lib/entitlements');
const { validateContentAccess } = require('../lib/accessControl');

describe('Claude Certified Developer practice content', () => {
  test('catalog resolves the CCDV-F certification and quiz', () => {
    const result = getCertification('claude-ccdvf');
    expect(result.platform.id).toBe('claude');
    expect(result.certification.code).toBe('CCDV-F');
    expect(result.certification.examInfo.questionCount).toBe(53);
    expect(result.certification.examInfo.practicePassingScore).toBe(true);
    expect(getQuizMeta('claude-ccdvf-quiz-1').certification.id).toBe('claude-ccdvf');
  });

  test('offers two exam-prep quizzes and three focused learning sets', () => {
    const { certification } = getCertification('claude-ccdvf');
    expect(certification.quizzes.map((quiz) => quiz.id)).toEqual([
      'claude-ccdvf-quiz-1',
      'claude-ccdvf-quiz-2',
      'claude-ccdvf-quiz-3',
      'claude-ccdvf-quiz-4',
      'claude-ccdvf-quiz-5',
    ]);
  });

  test('the new Claude learning and mock quizzes are accessible without Pro', () => {
    for (const id of [
      'claude-ccdvf-quiz-2',
      'claude-ccdvf-quiz-3',
      'claude-ccdvf-quiz-4',
      'claude-ccdvf-quiz-5',
    ]) {
      expect(isQuizAccessible(id, false)).toBe(true);
      expect(validateContentAccess(id, false)).toBe(true);
    }
    expect(validateContentAccess('aws-saa-quiz-2', false)).toBe(false);
  });

  test('all five quizzes load free with valid, unique question data', () => {
    const allQuestions = [];
    for (const [number, expected] of [
      [1, 53],
      [2, 53],
      [3, 20],
      [4, 20],
      [5, 20],
    ]) {
      const questions = loadQuizQuestions(`claude-ccdvf-quiz-${number}`, false);
      expect(questions).toHaveLength(expected);
      for (const q of questions) {
        expect(q.question).toBeTruthy();
        expect(q.choices.length).toBeGreaterThanOrEqual(4);
        expect(q.correct_answer_indices.length).toBeGreaterThan(0);
        for (const index of q.correct_answer_indices) {
          expect(index).toBeGreaterThanOrEqual(0);
          expect(index).toBeLessThan(q.choices.length);
        }
        expect(q.explanation_html).toContain('https://');
      }
      allQuestions.push(...questions);
    }
    expect(new Set(allQuestions.map((q) => q.id)).size).toBe(166);
  });

  test('free and pro users can load a valid 53-question practice bank', () => {
    const questions = loadQuizQuestions('claude-ccdvf-quiz-1', false);
    expect(questions).toHaveLength(53);
    const examQuestions = loadCertQuestions('claude-ccdvf', true);
    expect(examQuestions).toHaveLength(106);
    expect(examQuestions.some((q) => q.id.includes('-learn'))).toBe(false);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    expect(questions.some((q) => /\bMCP\b/i.test(q.question))).toBe(true);
    expect(questions.some((q) => /Claude Code/i.test(q.question))).toBe(true);
    expect(questions.some((q) => q.correct_answer_indices.length > 1)).toBe(true);
    for (const q of questions) {
      expect(q.question).toBeTruthy();
      expect(q.choices.length).toBeGreaterThanOrEqual(4);
      expect(q.correct_answer_indices.length).toBeGreaterThan(0);
      for (const index of q.correct_answer_indices) {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(q.choices.length);
      }
      expect(q.explanation_html).toContain('https://');
    }
  });
});
