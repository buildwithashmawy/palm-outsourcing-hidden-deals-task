import cors from 'cors';
import express from 'express';

import { getAll, getLoadedAt } from './lib/store.js';
import listingsRouter from './routes/listings.js';
import scrapeRouter from './routes/scrape.js';

export function createApp() {
  const app = express();

  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:8080')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(cors({ origin: corsOrigins }));

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      process.stdout.write(`${req.method} ${req.path} ${res.statusCode} ${ms}ms\n`);
    });
    next();
  });

  app.get('/health', (req, res) => {
    res.json({ ok: true, listings: getAll().length, loadedAt: getLoadedAt() });
  });

  app.use('/api/listings', listingsRouter);
  app.use('/api/scrape', scrapeRouter);

  return app;
}
