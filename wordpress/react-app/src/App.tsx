import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

import { ListingsTable } from './components/ListingsTable';
import { StatBar } from './components/StatBar';
import { useListings } from './hooks/useListings';
import styles from './App.module.css';

const client = new QueryClient();

function Dashboard() {
  const params = useMemo(() => new URLSearchParams({ limit: '200' }), []);
  const { data, isLoading, error } = useListings(params);

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
      {error && <div>Something went wrong loading listings.</div>}
      {isLoading && <div>Loading…</div>}
      {!isLoading && !error && <ListingsTable listings={listings} />}
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
