import { ProductSource } from './tracked-product.model';

/** O que a plataforma consegue fazer com uma loja (GET /api/stores). */
export interface StoreCapabilities {
  source: ProductSource;
  name: string;
  homeUrl: string;
  canFetchByUrl: boolean;
  canSearch: boolean;
  canGenerateAffiliateLink: boolean;
}
