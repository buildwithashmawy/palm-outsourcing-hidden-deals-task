import { Router } from 'express';
import { z } from 'zod';

import { applyFilters } from '../lib/filters.js';
import { getAll } from '../lib/store.js';

const router = Router();

const intish = z.coerce.number().int().nonnegative();

const QuerySchema = z.object({
  minPrice: intish.optional(),
  maxPrice: intish.optional(),
  location: z.string().min(1).max(120).optional(),
  status: z.enum(['repossessed', 'priced_for_quick_sale']).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'recent']).optional(),
  limit: intish.max(200).default(50),
  offset: intish.default(0),
}).refine(
  (q) => q.minPrice == null || q.maxPrice == null || q.minPrice <= q.maxPrice,
  { message: 'minPrice must be <= maxPrice', path: ['minPrice'] },
);

router.get('/', (req, res) => {
  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'bad_request',
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
  }
  res.json(applyFilters(getAll(), parsed.data));
});

export default router;
