import { useMemo } from 'react';

import type { Aggregates, Listing } from '../lib/types';
import styles from './StatBar.module.css';

interface Props {
  total: number;
  listings: Listing[];
  aggregates?: Aggregates;
}

export function StatBar({ total, listings, aggregates }: Props) {
  const stats = useMemo(() => {
    if (aggregates) {
      return {
        avg: aggregates.avgDiscount,
        max: aggregates.maxDiscount,
        repo: aggregates.repossessedCount,
        quick: aggregates.quickSaleCount,
      };
    }
    // mock-fallback path: compute over the visible listings
    if (listings.length === 0) {
      return { avg: null as number | null, max: null as number | null, repo: 0, quick: 0 };
    }
    const discounts = listings.map((l) => l.discount_pct).filter((d): d is number => d != null);
    const avg = discounts.length
      ? discounts.reduce((a, b) => a + b, 0) / discounts.length
      : null;
    const max = discounts.length ? Math.max(...discounts) : null;
    const repo = listings.filter((l) => l.status === 'repossessed').length;
    const quick = listings.length - repo;
    return { avg, max, repo, quick };
  }, [aggregates, listings]);

  const splitTotal = stats.repo + stats.quick;
  const splitRatio = splitTotal > 0 ? stats.repo / splitTotal : 0;

  return (
    <section className={styles.bar} aria-label="Dataset summary">
      <div className={styles.hero}>
        <div className={styles.heroNumber}>{total.toLocaleString('en-GB')}</div>
        <div className={styles.heroLabel}>listings tracked</div>
      </div>
      <div className={styles.secondary}>
        <div className={styles.stat}>
          <div className={styles.label}>Avg discount</div>
          <div className={styles.value}>{stats.avg != null ? `${stats.avg.toFixed(1)}%` : '—'}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.label}>Best discount</div>
          <div className={styles.value}>{stats.max != null ? `${stats.max.toFixed(1)}%` : '—'}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.label}>Repo · quick sale</div>
          <div className={styles.splitTrack}>
            <span className={styles.splitFill} style={{ width: `${splitRatio * 100}%` }} />
          </div>
          <div className={styles.splitMeta}>
            <span><strong>{stats.repo}</strong> repossessed</span>
            <span><strong>{stats.quick}</strong> quick sale</span>
          </div>
        </div>
      </div>
    </section>
  );
}
