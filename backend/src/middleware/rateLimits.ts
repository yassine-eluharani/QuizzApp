import rateLimit from 'express-rate-limit';

const baseOpts = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const readLimiter = rateLimit({
  ...baseOpts,
  windowMs: 60 * 1000,
  max: 600,
});

export const writeLimiter = rateLimit({
  ...baseOpts,
  windowMs: 60 * 1000,
  max: 30,
});

export const adminLimiter = rateLimit({
  ...baseOpts,
  windowMs: 60 * 1000,
  max: 5,
});

export const webhookLimiter = rateLimit({
  ...baseOpts,
  windowMs: 60 * 1000,
  max: 120,
});
