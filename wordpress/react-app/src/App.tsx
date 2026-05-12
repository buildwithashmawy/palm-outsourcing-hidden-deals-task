import { StatBar } from './components/StatBar';
import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hidden Deals</h1>
        <p className={styles.sub}>Repossessed and priced-for-quick-sale listings, refreshed from the public feed.</p>
      </header>
      <StatBar />
    </div>
  );
}
