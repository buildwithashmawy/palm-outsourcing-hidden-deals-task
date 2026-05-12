import type { SortingState } from '@tanstack/react-table';

export type ApiSort = 'price_asc' | 'price_desc' | 'recent';

export function sortToTanstack(sort: string | null): SortingState {
  if (sort === 'price_asc') return [{ id: 'price', desc: false }];
  if (sort === 'price_desc') return [{ id: 'price', desc: true }];
  if (sort === 'recent') return [{ id: 'added_on', desc: true }];
  return [];
}

export function nextSort(current: string | null, columnId: string): ApiSort | undefined {
  if (columnId === 'price') {
    if (current === 'price_asc') return 'price_desc';
    if (current === 'price_desc') return undefined;
    return 'price_asc';
  }
  if (columnId === 'added_on') {
    if (current === 'recent') return undefined;
    return 'recent';
  }
  return undefined;
}
