import cors from 'cors';
import express from 'express';

import { getAll, getLoadedAt } from './lib/store.js';
import listingsRouter from './routes/listings.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: 'http://localhost:5173' }));

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

  return app;
}
