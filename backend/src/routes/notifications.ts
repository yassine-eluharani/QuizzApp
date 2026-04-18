import { Router, Request, Response } from 'express';
import { Expo } from 'expo-server-sdk';
import { db } from '../db/client';
import { sendPushNotifications } from '../services/push';
import { config } from '../config';

const router = Router();

/**
 * POST /notifications/register
 * Body: { token: string, platform: 'ios' | 'android' }
 *
 * Called by the app on launch to store/refresh the device push token.
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { token, platform } = req.body as { token?: string; platform?: string };

  if (!token || !platform) {
    res.status(400).json({ error: 'token and platform are required' });
    return;
  }

  if (!Expo.isExpoPushToken(token)) {
    res.status(400).json({ error: 'Invalid Expo push token' });
    return;
  }

  if (platform !== 'ios' && platform !== 'android') {
    res.status(400).json({ error: 'platform must be ios or android' });
    return;
  }

  await db.query(
    `INSERT INTO push_tokens (token, platform)
     VALUES ($1, $2)
     ON CONFLICT (token) DO NOTHING`,
    [token, platform]
  );

  res.json({ ok: true });
});

/**
 * POST /notifications/send
 * Headers: X-Admin-Key: <ADMIN_API_KEY>
 * Body: { title: string, body: string, data?: object }
 *
 * Admin-only endpoint to broadcast a push notification to all registered devices.
 */
router.post('/send', async (req: Request, res: Response): Promise<void> => {
  if (req.headers['x-admin-key'] !== config.adminApiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { title, body, data } = req.body as {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  };

  if (!title || !body) {
    res.status(400).json({ error: 'title and body are required' });
    return;
  }

  const result = await db.query<{ token: string }>('SELECT token FROM push_tokens');
  const tokens = result.rows.map((r) => r.token);

  if (tokens.length === 0) {
    res.json({ sent: 0 });
    return;
  }

  const tickets = await sendPushNotifications(tokens, { title, body, data });
  res.json({ sent: tickets.length });
});

export default router;
