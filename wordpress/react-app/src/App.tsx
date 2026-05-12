import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { Filters } from './components/Filters';
import { ListingsTable } from './components/ListingsTable';
import { SkeletonRows } from './components/SkeletonRows';
import { StatBar } from './components/StatBar';
import { useListings } from './hooks/useListings';
import { useUrlFilters } from './hooks/useUrlFilters';
import styles from './App.module.css';

const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function Dashboard() {
  const { params, patch } = useUrlFilters();
  const queryParams = useMemo(() => {
    const p = new URLSearchParams(params);
    p.set('limit', '200');
    return p;
  }, [params]);
  const { data, isLoading, error, refetch } = useListings(queryParams);

  const listings = data?.results ?? [];

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hidden Deals</h1>
        <p className={styles.sub}>
          Repossessed and priced-for-quick-sale listings, refreshed from the public feed.
        </p>
      </header>
      <StatBar total={data?.total ?? 0} listings={listings} />
      <Filters params={params} onChange={patch} />
      {isLoading && <SkeletonRows />}
      {!isLoading && error && (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      )}
      {!isLoading && !error && listings.length === 0 && <EmptyState />}
      {!isLoading && !error && listings.length > 0 && <ListingsTable listings={listings} />}
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
