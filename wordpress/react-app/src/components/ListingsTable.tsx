import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { useState } from 'react';

import { formatDate, formatPrice, formatStatus } from '../lib/priceFormat';
import type { Listing } from '../lib/types';
import styles from './ListingsTable.module.css';

const col = createColumnHelper<Listing>();

const columns = [
  col.accessor('title', {
    header: 'Property',
    cell: (info) => info.getValue() || '—',
    enableSorting: false,
  }),
  col.accessor('postcode', { header: 'Postcode' }),
  col.accessor('price', {
    header: 'Price',
    cell: (info) => <span className={styles.priceCell}>{formatPrice(info.getValue())}</span>,
  }),
  col.accessor('discount_pct', {
    header: 'Discount',
    cell: (info) => {
      const v = info.getValue();
      if (v == null) return '—';
      return <span className={styles.discount}>{v.toFixed(1)}%</span>;
    },
  }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const v = info.getValue();
      return <span className={`${styles.pill} ${styles[`pill_${v}`]}`}>{formatStatus(v)}</span>;
    },
  }),
  col.accessor('added_on', {
    header: 'Added',
    cell: (info) => formatDate(info.getValue()),
  }),
];

interface Props {
  listings: Listing[];
}

export function ListingsTable({ listings }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'added_on', desc: true }]);
  const table = useReactTable({
    data: listings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
                    onClick={sortable ? h.column.getToggleSortingHandler() : undefined}
                    className={sortable ? styles.sortable : undefined}
                    aria-sort={
                      dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'
                    }
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {sortable && <span className={styles.sortIcon}>{dir === 'asc' ? '↑' : dir === 'desc' ? '↓' : ''}</span>}
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
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
