import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { Filters } from './components/Filters';
import { ListingDrawer } from './components/ListingDrawer';
import { ListingsTable } from './components/ListingsTable';
import { SkeletonRows } from './components/SkeletonRows';
import { StatBar } from './components/StatBar';
import { useListings } from './hooks/useListings';
import { useUrlFilters } from './hooks/useUrlFilters';
import type { Listing } from './lib/types';
import styles from './App.module.css';

const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const FILTER_KEYS = ['minPrice', 'maxPrice', 'location', 'status', 'sort'] as const;

function Dashboard() {
  const { params, patch } = useUrlFilters();
  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    for (const k of FILTER_KEYS) {
      const v = params.get(k);
      if (v) p.set(k, v);
    }
    return p;
  }, [params]);

  const { data, isLoading, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useListings(queryParams);

  const listings = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  );
  const total = data?.pages[0]?.total ?? 0;
  const aggregates = data?.pages[0]?.aggregates;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sort = params.get('sort');
  const onSortChange = useCallback((next: string | undefined) => patch({ sort: next }), [patch]);

  const [selected, setSelected] = useState<Listing | null>(null);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>Property data · UK</div>
        <h1 className={styles.title}>Hidden Deals</h1>
        <p className={styles.sub}>
          Repossessed and priced-for-quick-sale listings, scraped from the public feed and refreshed on demand.
        </p>
      </header>

      <StatBar total={total} listings={listings} aggregates={aggregates} />
      <Filters params={params} onChange={patch} />

      {isLoading && <SkeletonRows />}
      {!isLoading && error && (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      )}
      {!isLoading && !error && listings.length === 0 && <EmptyState />}
      {!isLoading && !error && listings.length > 0 && (
        <ListingsTable
          listings={listings}
          total={total}
          sort={sort}
          onSortChange={onSortChange}
          onSelect={setSelected}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={loadMore}
        />
      )}
      <ListingDrawer listing={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={client}>
      <Dashboard />
    </QueryClientProvider>
  );
}
