import { useCallback, useEffect, useState } from 'react';

import { applyPatch, type FilterPatch } from '../lib/urlState';

function read(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function useUrlFilters() {
  const [params, setParams] = useState<URLSearchParams>(read);

  useEffect(() => {
    const onPop = () => setParams(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const patch = useCallback((next: FilterPatch) => {
    setParams((curr) => {
      const merged = applyPatch(curr, next);
      const qs = merged.toString();
      const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, '', url);
      return merged;
    });
  }, []);

  return { params, patch };
}
