import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchListings } from '../lib/api';

export const PAGE_SIZE = 30;

export function useListings(params: URLSearchParams) {
  return useInfiniteQuery({
    queryKey: ['listings', params.toString()],
    queryFn: ({ pageParam }) => {
      const p = new URLSearchParams(params);
      p.set('limit', String(PAGE_SIZE));
      p.set('offset', String(pageParam));
      return fetchListings(p);
    },
    initialPageParam: 0,
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((sum, page) => sum + page.results.length, 0);
      if (last.results.length === 0) return undefined;
      if (loaded >= last.total) return undefined;
      return loaded;
    },
    staleTime: 30_000,
  });
}
