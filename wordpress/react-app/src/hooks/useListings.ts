import { useQuery } from '@tanstack/react-query';

import { fetchListings } from '../lib/api';

export function useListings(params: URLSearchParams) {
  return useQuery({
    queryKey: ['listings', params.toString()],
    queryFn: () => fetchListings(params),
    staleTime: 30_000,
  });
}
