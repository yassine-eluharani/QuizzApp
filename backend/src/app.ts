import crypto from 'crypto';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';

import { config } from './config';
import { logger } from './logger';
import catalogRouter from './routes/catalog';
import questionsRouter from './routes/questions';
import notificationsRouter from './routes/notifications';
import healthRouter from './routes/health';
import webhooksRouter from './routes/webhooks';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { readLimiter } from './middleware/rateLimits';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"] } },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'no-referrer' },
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (config.allowedOrigins.includes(origin)) return cb(null, true);
      if (/^exp:\/\//.test(origin)) return cb(null, true);
      return cb(new Error('Origin not allowed'), false);
    },
    credentials: false,
    maxAge: 600,
  })
);

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const incoming = req.headers['x-request-id'];
      const id = (typeof incoming === 'string' && incoming) || crypto.randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

// Webhook routes need raw body for signature verification — mount BEFORE express.json
app.use('/webhooks', webhooksRouter);

app.use(express.json({ limit: '64kb' }));

app.use('/health', healthRouter);
app.use('/catalog', readLimiter, catalogRouter);
app.use('/questions', readLimiter, questionsRouter);
app.use('/notifications', notificationsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
