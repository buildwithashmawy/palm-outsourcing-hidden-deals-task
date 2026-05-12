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

export async function fetchListings(params: URLSearchParams): Promise<ListingsResponse> {
  const base = resolveApiUrl();
  const url = `${base.replace(/\/$/, '')}/api/listings?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`api error ${res.status}`);
  return res.json();
}
