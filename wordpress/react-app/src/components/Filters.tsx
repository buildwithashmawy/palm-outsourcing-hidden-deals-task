import { AnimatePresence, motion } from 'framer-motion';

import type { FilterPatch } from '../lib/urlState';
import { formatStatus } from '../lib/priceFormat';
import styles from './Filters.module.css';

const STATUSES = ['repossessed', 'priced_for_quick_sale'] as const;

interface Props {
  params: URLSearchParams;
  onChange: (patch: FilterPatch) => void;
}

export function Filters({ params, onChange }: Props) {
  const location = params.get('location') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const status = params.get('status') || '';

  const activeChips: { key: string; label: string }[] = [];
  if (location) activeChips.push({ key: 'location', label: `location: ${location}` });
  if (minPrice) activeChips.push({ key: 'minPrice', label: `min: £${Number(minPrice).toLocaleString('en-GB')}` });
  if (maxPrice) activeChips.push({ key: 'maxPrice', label: `max: £${Number(maxPrice).toLocaleString('en-GB')}` });
  if (status) activeChips.push({ key: 'status', label: formatStatus(status) });

  return (
    <div className={styles.bar}>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Location</span>
          <input
            className={styles.input}
            value={location}
            placeholder="postcode or area"
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Min price</span>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            value={minPrice}
            placeholder="£"
            onChange={(e) => onChange({ minPrice: e.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Max price</span>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            value={maxPrice}
            placeholder="£"
            onChange={(e) => onChange({ maxPrice: e.target.value })}
          />
        </label>
        <div className={styles.field}>
          <span className={styles.label}>Status</span>
          <div className={styles.pills}>
            <button
              type="button"
              className={`${styles.pill} ${!status ? styles.pillOn : ''}`}
              onClick={() => onChange({ status: undefined })}
            >
              All
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.pill} ${status === s ? styles.pillOn : ''}`}
                onClick={() => onChange({ status: s })}
              >
                {formatStatus(s)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.chipsRow}>
        <AnimatePresence initial={false}>
          {activeChips.map((c) => (
            <motion.button
              key={c.key}
              type="button"
              className={styles.chip}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              onClick={() => onChange({ [c.key]: undefined })}
              aria-label={`Clear ${c.key}`}
            >
              {c.label}
              <span className={styles.chipX}>×</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
