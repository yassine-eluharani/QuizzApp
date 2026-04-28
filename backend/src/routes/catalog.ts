import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { logger } from '../logger';

const router = Router();

const quizSchema = z
  .object({
    id: z.string(),
    title: z.string(),
  })
  .passthrough();

const certSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    quizzes: z.array(quizSchema).default([]),
  })
  .passthrough();

const platformSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    certifications: z.array(certSchema).default([]),
  })
  .passthrough();

const catalogSchema = z
  .object({
    platforms: z.array(platformSchema),
  })
  .passthrough();

let cached: unknown | null = null;
let cachedAt = 0;
const CACHE_MS = 60 * 1000;

router.get('/', (_req, res) => {
  const catalogPath = path.join(__dirname, '../../catalog.json');

  if (!fs.existsSync(catalogPath)) {
    res.status(503).json({ error: 'Catalog not found on server' });
    return;
  }

  const now = Date.now();
  if (cached && now - cachedAt < CACHE_MS) {
    res.json(cached);
    return;
  }

  const raw = fs.readFileSync(catalogPath, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    logger.error({ err }, 'catalog_parse_failed');
    res.status(500).json({ error: 'Catalog file is malformed' });
    return;
  }

  const validated = catalogSchema.safeParse(parsed);
  if (!validated.success) {
    logger.error({ issues: validated.error.issues }, 'catalog_schema_invalid');
    res.status(500).json({ error: 'Catalog schema invalid' });
    return;
  }

  cached = validated.data;
  cachedAt = now;
  res.json(validated.data);
});

export default router;
