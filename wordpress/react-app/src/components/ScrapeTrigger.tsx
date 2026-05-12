import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import {
  useInvalidateListingsOnScrapeDone,
  useScrapeStatus,
  useStartScrape,
} from '../hooks/useScrape';
import styles from './ScrapeTrigger.module.css';

const PAGE_OPTIONS = [5, 15, 30, 50] as const;

function relativeTime(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${Math.floor(seconds)}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  return `${Math.floor(seconds / 3600)} h ago`;
}

export function ScrapeTrigger() {
  const [maxPages, setMaxPages] = useState<number>(15);
  const [, tick] = useState(0);

  const { data: statusData } = useScrapeStatus();
  const start = useStartScrape();
  const job = statusData?.job;

  useInvalidateListingsOnScrapeDone(job);

  // re-render every second when a finished job is showing, so "X s ago" ticks
  useEffect(() => {
    if (!job || job.status === 'running') return;
    const i = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, [job?.status, job?.finishedAt]);

  const running = job?.status === 'running';
  const errored = job?.status === 'error' || start.isError;
  const errorMessage = errored
    ? (start.error as Error | undefined)?.message || job?.error || 'something went wrong'
    : null;
  const progress = running && job ? job.pagesScraped / job.maxPages : 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <label className={styles.pages}>
          <span className={styles.label}>Pages</span>
          <select
            className={styles.select}
            value={maxPages}
            disabled={running}
            onChange={(e) => setMaxPages(Number(e.target.value))}
          >
            {PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={`${styles.button} ${running ? styles.running : ''}`}
          onClick={() => start.mutate(maxPages)}
          disabled={running || start.isPending}
        >
          <span className={styles.icon} aria-hidden>↻</span>
          <span className={styles.buttonText}>
            {running
              ? `scraping ${job!.pagesScraped} / ${job!.maxPages}`
              : start.isPending
                ? 'starting…'
                : 'refresh data'}
          </span>
        </button>
      </div>
      <div className={styles.statusRow}>
        <AnimatePresence mode="wait" initial={false}>
          {running && (
            <motion.div
              key="bar"
              className={styles.progress}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span
                className={styles.progressFill}
                style={{ transform: `scaleX(${progress})` }}
              />
            </motion.div>
          )}
          {!running && job?.status === 'done' && (
            <motion.span
              key="done"
              className={styles.note}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <span className={styles.dot} />
              updated {relativeTime(job.finishedAt || job.startedAt)}
              {job.totalListings != null ? ` · ${job.totalListings} listings` : ''}
            </motion.span>
          )}
          {!running && errored && (
            <motion.span
              key="err"
              className={`${styles.note} ${styles.noteError}`}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <span className={`${styles.dot} ${styles.dotError}`} />
              {errorMessage}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
