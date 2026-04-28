import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db/client';
import { requirePro } from '../middleware/requirePro';
import { validateParams } from '../middleware/validate';

const router = Router();

const SAMPLE_SUFFIX = '-sample';

function isSampleQuiz(quizId: string): boolean {
  return quizId.endsWith(SAMPLE_SUFFIX);
}

const paramsSchema = z.object({
  quizId: z.string().regex(/^[a-z0-9-]+-(?:quiz-\d+|sample)$/, 'Invalid quiz ID format'),
});

router.get(
  '/:quizId',
  validateParams(paramsSchema),
  (req: Request, res: Response, next: NextFunction) => {
    if (isSampleQuiz(req.params.quizId)) {
      return next('route');
    }
    return requirePro(req, res, next);
  },
  serveQuestions
);

router.get('/:quizId', validateParams(paramsSchema), serveQuestions);

async function serveQuestions(req: Request, res: Response): Promise<void> {
  const { quizId } = req.params;

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
