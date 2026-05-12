export type FilterKey = 'location' | 'minPrice' | 'maxPrice' | 'status' | 'sort';

export interface FilterPatch {
  [k: string]: string | undefined;
}

export function applyPatch(current: URLSearchParams, patch: FilterPatch): URLSearchParams {
  const next = new URLSearchParams(current);
  for (const [k, v] of Object.entries(patch)) {
    if (v == null || v === '') next.delete(k);
    else next.set(k, v);
  }
  return next;
}
