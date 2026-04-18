import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * GET /catalog
 * Returns the full platform/certification/quiz catalog.
 * No auth required — this is just metadata (no questions).
 *
 * To update the catalog without an app release, edit catalog.json on the server.
 */
router.get('/', (_req, res) => {
  const catalogPath = path.join(__dirname, '../../catalog.json');

  if (!fs.existsSync(catalogPath)) {
    res.status(503).json({ error: 'Catalog not found on server' });
    return;
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  res.json(catalog);
});

export default router;
