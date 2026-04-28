import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const provided = req.header('x-admin-key') ?? '';
  const expected = config.adminApiKey;

  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(expected);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
