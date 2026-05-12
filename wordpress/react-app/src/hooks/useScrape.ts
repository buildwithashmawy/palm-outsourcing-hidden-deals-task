import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { resolveApiUrl } from '../lib/api';

export interface ScrapeJob {
  id: string;
  status: 'running' | 'done' | 'error';
  startedAt: string;
  finishedAt: string | null;
  maxPages: number;
  pagesScraped: number;
  totalListings: number | null;
  error: string | null;
}

interface StatusResponse {
  job: ScrapeJob | null;
}

function endpoint(p: string): string {
  return `${resolveApiUrl().replace(/\/$/, '')}${p}`;
}

export function useScrapeStatus() {
  return useQuery<StatusResponse>({
    queryKey: ['scrape-status'],
    queryFn: async () => {
      const res = await fetch(endpoint('/api/scrape/status'));
      if (!res.ok) throw new Error(`status ${res.status}`);
      return res.json();
    },
    refetchInterval: (query) => (query.state.data?.job?.status === 'running' ? 700 : false),
    refetchIntervalInBackground: true,
    retry: 0,
    staleTime: 0,
  });
}

export function useStartScrape() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (maxPages: number) => {
      const res = await fetch(endpoint('/api/scrape'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxPages }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = body?.issues?.[0]?.message || body?.error || `request failed (${res.status})`;
        throw new Error(msg);
      }
      return body;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scrape-status'] });
    },
  });
}

export function useInvalidateListingsOnScrapeDone(job: ScrapeJob | null | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!job || job.status !== 'done') return;
    // Slight delay to let the API's fs.watch debouncer reload the file.
    const t = setTimeout(() => {
      qc.invalidateQueries({ queryKey: ['listings'] });
    }, 400);
    return () => clearTimeout(t);
  }, [qc, job?.id, job?.status]);
}
