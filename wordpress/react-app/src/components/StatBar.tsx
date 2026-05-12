import styles from './StatBar.module.css';

export function StatBar() {
  return (
    <div className={styles.bar}>
      <div className={styles.stat}>
        <div className={styles.label}>Listings</div>
        <div className={styles.value}>—</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.label}>Avg discount</div>
        <div className={styles.value}>—</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.label}>Repossessed / quick sale</div>
        <div className={styles.value}>—</div>
      </div>
    </div>
  );
}
