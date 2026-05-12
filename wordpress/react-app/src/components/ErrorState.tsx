import styles from './ErrorState.module.css';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className={styles.error}>
      <p className={styles.line}>Couldn't load listings.</p>
      <p className={styles.detail}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
