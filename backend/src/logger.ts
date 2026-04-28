import pino from 'pino';
import { config } from './config';

export const logger = pino({
  level: config.logLevel,
  base: { service: 'cloudprep-api', env: config.nodeEnv },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers["x-admin-key"]', 'req.headers.authorization', 'req.headers.cookie'],
    remove: true,
  },
});
