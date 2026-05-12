import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import { z } from 'zod';

import { getJob, isRunning, startScrape } from '../lib/scrapeJob.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../');

const router = express.Router();

const StartSchema = z.object({
  maxPages: z.coerce.number().int().min(1).max(50).default(15),
});

router.post('/', express.json(), (req, res) => {
  const parsed = StartSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      error: 'bad_request',
      issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }
  if (isRunning()) {
    return res.status(409).json({ error: 'already_running', job: getJob() });
  }
  try {
    const job = startScrape({ maxPages: parsed.data.maxPages, repoRoot: REPO_ROOT });
    res.status(202).json({ job });
  } catch (err) {
    res.status(500).json({ error: 'spawn_failed', message: err.message });
  }
});

router.get('/status', (req, res) => {
  res.json({ job: getJob() });
});

export default router;
