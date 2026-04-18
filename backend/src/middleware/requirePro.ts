import { Request, Response, NextFunction } from 'express';
import { hasPro } from '../services/revenuecat';

/**
 * Middleware that validates a RevenueCat app user ID against the RC API.
 * The app must send the RC app user ID in the X-RC-App-User-ID header.
 */
export async function requirePro(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const appUserId = req.headers['x-rc-app-user-id'];

  if (!appUserId || typeof appUserId !== 'string') {
    res.status(401).json({ error: 'Missing X-RC-App-User-ID header' });
    return;
  }

  const isPro = await hasPro(appUserId);
  if (!isPro) {
    res.status(403).json({ error: 'Pro subscription required' });
    return;
  }

  next();
}
