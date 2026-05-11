const SORTERS = {
  price_asc: (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
  price_desc: (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
  recent: (a, b) => (b.added_on || '').localeCompare(a.added_on || ''),
};

export function applyFilters(listings, q) {
  let out = listings;

  if (q.minPrice != null) {
    out = out.filter((l) => l.price != null && l.price >= q.minPrice);
  }
  if (q.maxPrice != null) {
    out = out.filter((l) => l.price != null && l.price <= q.maxPrice);
  }
  if (q.location) {
    const needle = q.location.toLowerCase();
    out = out.filter(
      (l) =>
        (l.location || '').toLowerCase().includes(needle) ||
        (l.postcode || '').toLowerCase().includes(needle),
    );
  }
  if (q.status) {
    out = out.filter((l) => l.status === q.status);
  }

  if (q.sort && SORTERS[q.sort]) {
    out = [...out].sort(SORTERS[q.sort]);
  }

  const total = out.length;
  const offset = q.offset ?? 0;
  const limit = q.limit ?? 50;
  const results = out.slice(offset, offset + limit);

  return { count: results.length, total, results };
}
