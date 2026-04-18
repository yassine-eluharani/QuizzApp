import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import catalogRouter from './routes/catalog';
import questionsRouter from './routes/questions';
import notificationsRouter from './routes/notifications';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting: 60 requests per minute per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/catalog', catalogRouter);
app.use('/questions', questionsRouter);
app.use('/notifications', notificationsRouter);

export default app;
