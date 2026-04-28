import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../logger';
import { config } from '../config';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Invalid request', details: err.issues });
    return;
  }

  const requestId = (req as Request & { id?: string }).id;
  logger.error({ err, requestId, path: req.path, method: req.method }, 'request_failed');

  res.status(500).json({
    error: 'Internal Server Error',
    ...(config.isProduction ? {} : { message: (err as Error).message }),
  });
}
