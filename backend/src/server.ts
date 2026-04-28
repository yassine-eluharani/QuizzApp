import './config';
import path from 'path';
import { runner } from 'node-pg-migrate';
import app from './app';
import { db } from './db/client';
import { config } from './config';
import { logger } from './logger';

async function start() {
  await runner({
    databaseUrl: config.databaseUrl,
    dir: path.join(__dirname, '../migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations',
    log: (msg: string) => logger.info({ migration: true }, msg),
  });

  app.listen(config.port, () => {
    logger.info({ port: config.port }, 'cloudprep_api_started');
  });
}

start().catch((err) => {
  logger.error({ err }, 'cloudprep_api_failed_to_start');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.info('sigterm_received');
  await db.end();
  process.exit(0);
});
