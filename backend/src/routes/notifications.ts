import { Router, Request, Response } from 'express';
import { Expo } from 'expo-server-sdk';
import { z } from 'zod';
import { db } from '../db/client';
import { sendPushNotifications } from '../services/push';
import { requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { writeLimiter, adminLimiter } from '../middleware/rateLimits';
import { logger } from '../logger';

const router = Router();

const registerSchema = z.object({
  token: z.string().refine((t) => Expo.isExpoPushToken(t), {
    message: 'Invalid Expo push token',
  }),
  platform: z.enum(['ios', 'android']),
});

const sendSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  data: z.record(z.string(), z.unknown()).optional(),
});

router.post(
  '/register',
  writeLimiter,
  validateBody(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { token, platform } = req.body as z.infer<typeof registerSchema>;
    await db.query(
      `INSERT INTO push_tokens (token, platform)
       VALUES ($1, $2)
       ON CONFLICT (token) DO NOTHING`,
      [token, platform]
    );
    res.json({ ok: true });
  }
);

router.post(
  '/send',
  adminLimiter,
  requireAdmin,
  validateBody(sendSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { title, body, data } = req.body as z.infer<typeof sendSchema>;
    const requestId = (req as Request & { id?: string }).id;

    const tokensResult = await db.query<{ token: string }>('SELECT token FROM push_tokens');
    const tokens = tokensResult.rows.map((r) => r.token);

    if (tokens.length === 0) {
      await db.query(
        `INSERT INTO admin_audit_log (action, actor_ip, request_id, payload)
         VALUES ($1, $2, $3, $4)`,
        ['notifications.send', req.ip ?? null, requestId ?? null, { title, body, recipients: 0 }]
      );
      res.json({ sent: 0 });
      return;
    }

    const tickets = await sendPushNotifications(tokens, { title, body, data });

    await db.query(
      `INSERT INTO admin_audit_log (action, actor_ip, request_id, payload)
       VALUES ($1, $2, $3, $4)`,
      [
        'notifications.send',
        req.ip ?? null,
        requestId ?? null,
        { title, body, recipients: tokens.length, tickets: tickets.length },
      ]
    );

    logger.info(
      { recipients: tokens.length, tickets: tickets.length, requestId },
      'admin_notification_sent'
    );

    res.json({ sent: tickets.length });
  }
);

export default router;
