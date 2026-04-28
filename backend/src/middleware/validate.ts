import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export function validateBody<S extends ZodTypeAny>(schema: S) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid request body', details: result.error.issues });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateParams<S extends ZodTypeAny>(schema: S) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid path params', details: result.error.issues });
      return;
    }
    Object.assign(req.params, result.data);
    next();
  };
}
