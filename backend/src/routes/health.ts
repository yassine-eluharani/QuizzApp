import { Router } from 'express';
import { db } from '../db/client';
import { logger } from '../logger';

const router = Router();

router.get('/live', (_req, res) => {
  res.json({ ok: true });
});

router.get('/ready', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    logger.warn({ err }, 'health_ready_db_failed');
    res.status(503).json({ ok: false, reason: 'db_unavailable' });
  }
});

export default router;
