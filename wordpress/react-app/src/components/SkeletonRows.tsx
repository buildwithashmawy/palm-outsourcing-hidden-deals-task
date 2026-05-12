import styles from './SkeletonRows.module.css';

export function SkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <div className={styles.wrap} aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.row}>
          <div className={`${styles.cell} ${styles.cellWide}`} />
          <div className={styles.cell} />
          <div className={styles.cell} />
          <div className={styles.cell} />
        </div>
      ))}
    </div>
  );
}
