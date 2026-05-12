import styles from './EmptyState.module.css';

export function EmptyState() {
  return (
    <div className={styles.empty}>
      <p className={styles.line}>Nothing here yet. Widen the price range or try a different postcode.</p>
    </div>
  );
}
