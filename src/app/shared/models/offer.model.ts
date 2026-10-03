import { ProductSource } from './tracked-product.model';

export interface CreateOfferRequest {
  url: string;
  targetPrice?: number;
  listId?: string;
}

export interface OfferResponse {
  subscriptionId: string;
  productId: string;
  offerId: string;
  name: string;
  url: string;
  imageUrl?: string | null;
  source: ProductSource;
  targetPrice: number;
  currentPrice: number;
  lowestPrice: number;
  isActive: boolean;
  nextCheckAt: string;
  listId?: string | null;
}

export interface StoreOfferSummary {
  offerId: string;
  source: ProductSource;
  currentPrice: number;
  isCheapest: boolean;
  storeName: string;
  lowestPrice: number;
  /** Quando o preço foi verificado pela última vez; nulo se ainda não foi. */
  lastCheckedAt?: string | null;
}

export interface ProductComparison {
  productId: string;
  name: string;
  imageUrl?: string | null;
  offers: StoreOfferSummary[];
}

/** URL de saída (link de afiliado quando há rede), devolvida depois de registrar o clique. */
export interface ClickResponse {
  url: string;
}
