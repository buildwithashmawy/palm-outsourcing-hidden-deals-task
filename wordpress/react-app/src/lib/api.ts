import type { ListingsResponse } from './types';

declare global {
  interface Window {
    HiddenDeals?: { apiUrl?: string; nonce?: string };
  }
}

export function resolveApiUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.HiddenDeals?.apiUrl) return window.HiddenDeals.apiUrl;
    const el = document.getElementById('hidden-deals-root');
    const fromAttr = el?.dataset?.apiUrl;
    if (fromAttr) return fromAttr;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
}

async function fromMock(): Promise<ListingsResponse> {
  const res = await fetch('mock.json');
  if (!res.ok) throw new Error(`mock unavailable (${res.status})`);
  return res.json();
}

export async function fetchListings(params: URLSearchParams): Promise<ListingsResponse> {
  const base = resolveApiUrl();
  const url = `${base.replace(/\/$/, '')}/api/listings?${params.toString()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400) {
        const body = await res.json().catch(() => null);
        const issue = body?.issues?.[0];
        throw new Error(issue ? `${issue.path}: ${issue.message}` : `api ${res.status}`);
      }
      throw new Error(`api ${res.status}`);
    }
    return res.json();
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('api ')) throw err;
    // network failure or CORS: fall back to bundled mock
    return fromMock();
  }
}
