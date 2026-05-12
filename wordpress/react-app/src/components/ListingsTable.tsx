import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { formatDate, formatPrice, formatStatus } from '../lib/priceFormat';
import { nextSort, sortToTanstack } from '../lib/sort';
import type { Listing } from '../lib/types';
import { Sentinel } from './Sentinel';
import styles from './ListingsTable.module.css';

const col = createColumnHelper<Listing>();

const baseColumns = [
  col.accessor('title', {
    id: 'title',
    header: 'Property',
    cell: (info) => <span className={styles.titleCell}>{info.getValue() || '—'}</span>,
    enableSorting: false,
  }),
  col.accessor('postcode', {
    id: 'postcode',
    header: 'Postcode',
    cell: (info) => <span className={styles.postcodeCell}>{info.getValue() || '—'}</span>,
    enableSorting: false,
  }),
  col.accessor('price', {
    id: 'price',
    header: 'Price',
    cell: (info) => <span className={styles.priceCell}>{formatPrice(info.getValue())}</span>,
  }),
  col.accessor('discount_pct', {
    id: 'discount_pct',
    header: 'Discount',
    enableSorting: false,
    cell: (info) => {
      const v = info.getValue();
      if (v == null) return <span className={styles.dim}>—</span>;
      return <span className={styles.discount}>{v.toFixed(1)}%</span>;
    },
  }),
  col.accessor('status', {
    id: 'status',
    header: 'Status',
    enableSorting: false,
    cell: (info) => {
      const v = info.getValue();
      return (
        <span className={`${styles.pill} ${styles[`pill_${v}`]}`}>
          <span className={styles.pillDot} aria-hidden />
          {formatStatus(v)}
        </span>
      );
    },
  }),
  col.accessor('added_on', {
    id: 'added_on',
    header: 'Added',
    cell: (info) => <span className={styles.dateCell}>{formatDate(info.getValue())}</span>,
  }),
];

interface Props {
  listings: Listing[];
  total: number;
  sort: string | null;
  onSortChange: (next: string | undefined) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function ListingsTable({
  listings,
  total,
  sort,
  onSortChange,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Props) {
  const table = useReactTable({
    data: listings,
    columns: baseColumns,
    state: { sorting: sortToTanstack(sort) },
    manualSorting: true,
    onSortingChange: () => {
      // intentional: header click is handled below; tanstack's default state
      // doesn't know our 3-way / 2-way custom cycles
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => {
                const sortable = h.column.getCanSort();
                const dir = h.column.getIsSorted();
                return (
                  <th
                    key={h.id}
                    className={`${styles.th} ${sortable ? styles.sortable : ''} ${styles[`col_${h.column.id}`] || ''}`}
                    aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}
                    onClick={sortable ? () => onSortChange(nextSort(sort, h.column.id)) : undefined}
                    tabIndex={sortable ? 0 : -1}
                    onKeyDown={(e) => {
                      if (sortable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onSortChange(nextSort(sort, h.column.id));
                      }
                    }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {sortable && (
                      <span className={styles.sortIcon} data-state={dir || 'none'}>
                        {dir === 'asc' ? '↑' : dir === 'desc' ? '↓' : '↕'}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={styles.row}
              onClick={() => window.open(row.original.url, '_blank', 'noopener')}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') window.open(row.original.url, '_blank', 'noopener');
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={`${styles.td} ${styles[`col_${cell.column.id}`] || ''}`}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Sentinel enabled={hasNextPage && !isFetchingNextPage} onEnter={onLoadMore} />

      <div className={styles.tail}>
        {isFetchingNextPage && (
          <div className={styles.loading}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.loadingLabel}>loading more</span>
          </div>
        )}
        {!hasNextPage && listings.length > 0 && (
          <div className={styles.end}>
            <span className={styles.endRule} />
            <span className={styles.endLabel}>
              all caught up · {total} listing{total === 1 ? '' : 's'}
            </span>
            <span className={styles.endRule} />
          </div>
        )}
      </div>
    </div>
  );
}
