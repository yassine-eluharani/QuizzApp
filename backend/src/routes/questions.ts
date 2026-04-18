import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/client';
import { requirePro } from '../middleware/requirePro';

const router = Router();

// Sample quizzes follow the pattern: {cert-id}-sample
// They are free for all users — no auth required.
function isSampleQuiz(quizId: string): boolean {
  return quizId.endsWith('-sample');
}

/**
 * GET /questions/:quizId
 *
 * Sample quizzes (ending in -sample): open to all, no auth.
 * Pro quizzes: requirePro middleware validates RevenueCat entitlement first.
 */
router.get(
  '/:quizId',
  (req: Request, res: Response, next: NextFunction) => {
    if (isSampleQuiz(req.params.quizId)) {
      return next('route'); // skip auth
    }
    return requirePro(req, res, next);
  },
  serveQuestions
);

// Open handler for sample quizzes
router.get('/:quizId', serveQuestions);

async function serveQuestions(req: Request, res: Response): Promise<void> {
  const { quizId } = req.params;

  // Valid patterns: {platform}-{cert}-quiz-{N} or {platform}-{cert}-sample
  if (!/^[a-z0-9]+-[a-z0-9]+-(?:quiz-\d+|sample)$/.test(quizId)) {
    res.status(400).json({ error: 'Invalid quiz ID format' });
    return;
  }

  const result = await db.query(
    `SELECT id, question_number, question, choices, correct_answer_indices, explanation_html
     FROM questions
     WHERE quiz_id = $1
     ORDER BY question_number::int ASC`,
    [quizId]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Quiz not found' });
    return;
  }

  res.json(result.rows);
}

export default router;
