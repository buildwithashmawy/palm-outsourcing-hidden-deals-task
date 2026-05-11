import { Router } from 'express';

import { applyFilters } from '../lib/filters.js';
import { getAll } from '../lib/store.js';

const router = Router();

function toInt(v) {
  if (v == null) return undefined;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

router.get('/', (req, res) => {
  const q = {
    minPrice: toInt(req.query.minPrice),
    maxPrice: toInt(req.query.maxPrice),
    location: req.query.location || undefined,
    status: req.query.status || undefined,
    sort: req.query.sort || undefined,
    limit: Math.min(toInt(req.query.limit) ?? 50, 200),
    offset: toInt(req.query.offset) ?? 0,
  };
  res.json(applyFilters(getAll(), q));
});

export default router;
