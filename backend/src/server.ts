import './config'; // validates env vars on startup
import app from './app';
import { db } from './db/client';
import { config } from './config';
import fs from 'fs';
import path from 'path';

async function start() {
  // Run DB migration
  const sql = fs.readFileSync(
    path.join(__dirname, '../src/db/migrations/001_init.sql'),
    'utf-8'
  );
  await db.query(sql);

  app.listen(config.port, () => {
    console.log(`CloudPrep API running on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
