import cors from 'cors';
import express from 'express';

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
  res.json({ ok: true, listings: 0, loadedAt: null });
});

app.listen(PORT, () => {
  console.log(`api listening on :${PORT}`);
});
