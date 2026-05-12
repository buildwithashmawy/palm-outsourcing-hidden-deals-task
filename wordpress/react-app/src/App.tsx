import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { Filters } from './components/Filters';
import { ListingsTable } from './components/ListingsTable';
import { StatBar } from './components/StatBar';
import { useListings } from './hooks/useListings';
import { useUrlFilters } from './hooks/useUrlFilters';
import styles from './App.module.css';

const client = new QueryClient();

function Dashboard() {
  const { params, patch } = useUrlFilters();
  const queryParams = useMemo(() => {
    const p = new URLSearchParams(params);
    p.set('limit', '200');
    return p;
  }, [params]);
  const { data, isLoading, error } = useListings(queryParams);

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
      {error && <div className={styles.message}>Something went wrong loading listings.</div>}
      {isLoading && <div className={styles.message}>Loading…</div>}
      {!isLoading && !error && <ListingsTable listings={listings} />}
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
