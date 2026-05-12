import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { formatDate, formatPrice, formatStatus } from '../lib/priceFormat';
import type { Listing } from '../lib/types';
import { ListingGallery } from './ListingGallery';
import styles from './ListingDrawer.module.css';

interface Props {
  listing: Listing | null;
  onClose: () => void;
}

function formatScrapedAt(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function pricePerBedroom(listing: Listing): string | null {
  if (!listing.price || !listing.title) return null;
  const m = listing.title.match(/^(\d+)\s+bedroom/i);
  if (!m) return null;
  const beds = parseInt(m[1], 10);
  if (!beds) return null;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(Math.round(listing.price / beds));
}

function propertyType(title: string): string {
  if (!title) return '—';
  const m = title.match(/bedroom\s+([\w\- ]+?)\s+for sale/i);
  return m ? m[1] : '—';
}

export function ListingDrawer({ listing, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!listing) return;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [listing, onClose]);

  return (
    <AnimatePresence>
      {listing && (
        <>
          <motion.div
            key="backdrop"
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            className={styles.drawer}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <header className={styles.head}>
              <span className={`${styles.pill} ${styles[`pill_${listing.status}`]}`}>
                <span className={styles.pillDot} aria-hidden />
                {formatStatus(listing.status)}
              </span>
              <button
                ref={closeBtnRef}
                type="button"
                className={styles.close}
                onClick={onClose}
                aria-label="Close panel"
              >
                ×
              </button>
            </header>

            <ListingGallery images={listing.images || []} alt={listing.title || 'Property photo'} />

            <div className={styles.eyebrow}>{listing.postcode || 'No postcode'}</div>
            <h2 id="drawer-title" className={styles.title}>
              {listing.title || 'Untitled listing'}
            </h2>

            <div className={styles.priceBlock}>
              <div className={styles.price}>{formatPrice(listing.price)}</div>
              <div className={styles.priceMeta}>
                {listing.discount_pct != null && (
                  <span className={styles.discount}>
                    {listing.discount_pct.toFixed(1)}% below market
                  </span>
                )}
                {pricePerBedroom(listing) && (
                  <span className={styles.perBed}>
                    {pricePerBedroom(listing)} / bedroom
                  </span>
                )}
              </div>
            </div>

            <dl className={styles.details}>
              <div className={styles.row}>
                <dt>Property type</dt>
                <dd className={styles.cap}>{propertyType(listing.title)}</dd>
              </div>
              <div className={styles.row}>
                <dt>Location</dt>
                <dd>{listing.location || '—'}</dd>
              </div>
              <div className={styles.row}>
                <dt>Postcode area</dt>
                <dd>{listing.postcode || '—'}</dd>
              </div>
              <div className={styles.row}>
                <dt>Listed on</dt>
                <dd>{formatDate(listing.added_on)}</dd>
              </div>
              <div className={styles.row}>
                <dt>Snapshot taken</dt>
                <dd>{formatScrapedAt(listing.scraped_at)}</dd>
              </div>
              <div className={styles.row}>
                <dt>Listing ID</dt>
                <dd className={styles.mono}>{listing.id}</dd>
              </div>
            </dl>

            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
            >
              <span>View on source site</span>
              <span aria-hidden className={styles.arrow}>→</span>
            </a>
            <p className={styles.note}>
              Opens repossessedhousesforsale.com in a new tab. Full details may sit behind their
              free trial.
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
