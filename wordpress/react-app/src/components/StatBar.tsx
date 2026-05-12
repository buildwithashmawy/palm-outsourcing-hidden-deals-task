import { useMemo } from 'react';

import type { Listing } from '../lib/types';
import styles from './StatBar.module.css';

interface Props {
  total: number;
  listings: Listing[];
}

export function StatBar({ total, listings }: Props) {
  const stats = useMemo(() => {
    if (listings.length === 0) {
      return { avg: null as number | null, repo: 0, quick: 0 };
    }
    const discounts = listings.map((l) => l.discount_pct).filter((d): d is number => d != null);
    const avg = discounts.length
      ? discounts.reduce((a, b) => a + b, 0) / discounts.length
      : null;
    const repo = listings.filter((l) => l.status === 'repossessed').length;
    const quick = listings.length - repo;
    return { avg, repo, quick };
  }, [listings]);

  return (
    <div className={styles.bar}>
      <div className={styles.stat}>
        <div className={styles.label}>Listings</div>
        <div className={styles.value}>{total}</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.label}>Avg discount</div>
        <div className={styles.value}>{stats.avg != null ? `${stats.avg.toFixed(1)}%` : '—'}</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.label}>Repossessed / quick sale</div>
        <div className={styles.value}>
          {stats.repo} <span className={styles.divider}>/</span> {stats.quick}
        </div>
      </div>
    </div>
  );
}
