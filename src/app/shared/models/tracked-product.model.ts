export type ProductSource = 0 | 1 | 2;
export const PRODUCT_SOURCE_LABELS: Record<ProductSource, string> = {
  0: 'Mercado Livre',
  1: 'Kabum',
  2: 'Manual',
};

export interface TrackedProduct {
  id: string;
  listId: string;
  name: string;
  url: string;
  source: ProductSource;
  imageUrl?: string;
  targetPrice: number;
  currentPrice: number;
  lowestPrice: number;
  isActive: boolean;
  nextCheckAt: string;
  lastCheckedAt?: string;
}

export interface PriceSnapshot {
  id: string;
  price: number;
  capturedAt: string;
}

export interface AddProductRequest {
  url: string;
  source: ProductSource;
}

export interface UpdateProductRequest {
  targetPrice?: number;
  isActive?: boolean;
}
