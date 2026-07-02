export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  basePriceUsd: number;
  isFeatured: boolean;
  isActive: boolean;
  category: { name: string; slug: string } | null;
  images: { url: string; isPrimary: boolean }[];
  originCountry: { name: string } | null;
  _count: { requests: number };
}

export interface AdminProductListData {
  products: AdminProductListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminProductListParams {
  page: number;
  limit: number;
  search?: string;
  categorySlug?: string;
}
