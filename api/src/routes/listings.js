import { Router } from 'express';

import { getAll } from '../lib/store.js';

const router = Router();

router.get('/', (req, res) => {
  const all = getAll();
  res.json({
    count: all.length,
    total: all.length,
    results: all,
  });
});

export default router;
