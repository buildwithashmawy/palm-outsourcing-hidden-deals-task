export type Status = 'repossessed' | 'priced_for_quick_sale';

export interface Listing {
  id: string;
  title: string;
  price: number | null;
  price_display: string;
  location: string;
  postcode: string;
  status: Status;
  discount_pct: number | null;
  added_on: string | null;
  url: string;
  scraped_at: string;
  images?: string[];
}

export interface Aggregates {
  avgDiscount: number | null;
  maxDiscount: number | null;
  repossessedCount: number;
  quickSaleCount: number;
}

export interface ListingsResponse {
  count: number;
  total: number;
  aggregates?: Aggregates;
  results: Listing[];
}
