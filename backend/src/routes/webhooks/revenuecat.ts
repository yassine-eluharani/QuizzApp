import express, { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { config } from '../../config';
import { db } from '../../db/client';
import { logger } from '../../logger';
import { webhookLimiter } from '../../middleware/rateLimits';

const router = Router();

const eventSchema = z
  .object({
    event: z.object({
      type: z.string(),
      app_user_id: z.string().min(1),
      id: z.string().optional(),
      event_timestamp_ms: z.number().optional(),
    }),
  })
  .passthrough();

function authIsValid(req: Request): boolean {
  if (!config.revenueCatWebhookAuth) return false;
  const auth = req.header('authorization') ?? '';
  const expected = new TextEncoder().encode(`Bearer ${config.revenueCatWebhookAuth}`);
  const got = new TextEncoder().encode(auth);
  if (got.length !== expected.length) return false;
  return crypto.timingSafeEqual(got, expected);
}

router.post(
  '/',
  webhookLimiter,
  express.json({ limit: '64kb' }),
  async (req: Request, res: Response): Promise<void> => {
    if (!authIsValid(req)) {
      logger.warn({ path: req.path }, 'revenuecat_webhook_unauthorized');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
      return;
    }

    const { event } = parsed.data;
    logger.info(
      { type: event.type, appUserId: event.app_user_id, eventId: event.id },
      'revenuecat_webhook_received'
    );

    await db.query(
      `INSERT INTO webhook_events (provider, event_type, app_user_id, payload)
       VALUES ($1, $2, $3, $4)`,
      ['revenuecat', event.type, event.app_user_id, parsed.data]
    );

    res.json({ ok: true });
  }
);

export default router;
