import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

import { applyPatch, type FilterPatch } from '../lib/urlState';

export function useUrlFilters() {
  const [params, setParams] = useSearchParams();

  const patch = useCallback(
    (next: FilterPatch) => {
      setParams(applyPatch(params, next), { replace: true });
    },
    [params, setParams],
  );

  return { params, patch };
}
