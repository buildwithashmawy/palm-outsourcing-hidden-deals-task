import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express from 'express';

import { getAll, getLoadedAt, load } from './lib/store.js';
import listingsRouter from './routes/listings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = process.env.DATA_PATH
  ? path.resolve(process.env.DATA_PATH)
  : path.resolve(__dirname, '../../data/listings.json');

const app = express();
const PORT = process.env.PORT || 3000;

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

const n = await load(DATA_PATH);
console.log(`loaded ${n} listings from ${DATA_PATH}`);

app.listen(PORT, () => {
  console.log(`api listening on :${PORT}`);
});
