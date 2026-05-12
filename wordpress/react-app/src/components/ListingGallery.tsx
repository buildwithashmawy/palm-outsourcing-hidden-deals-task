import { useEffect, useState } from 'react';

import styles from './ListingGallery.module.css';

interface Props {
  images: string[];
  alt: string;
}

export function ListingGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setActive(0);
    setFailed({});
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className={styles.placeholder} aria-label="No photo available">
        <span className={styles.placeholderText}>No photo</span>
      </div>
    );
  }

  const current = images[active];
  const heroBroken = failed[active];

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        {heroBroken ? (
          <div className={styles.placeholder}>
            <span className={styles.placeholderText}>Image unavailable</span>
          </div>
        ) : (
          <img
            key={current}
            src={current}
            alt={alt}
            loading="lazy"
            className={styles.heroImg}
            onError={() => setFailed((m) => ({ ...m, [active]: true }))}
          />
        )}
        {images.length > 1 && (
          <div className={styles.counter} aria-live="polite">
            {active + 1} / {images.length}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className={styles.strip}>
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
            >
              {failed[i] ? (
                <span className={styles.thumbBroken} />
              ) : (
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  onError={() => setFailed((m) => ({ ...m, [i]: true }))}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
