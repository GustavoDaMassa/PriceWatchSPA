import { ProductSource } from './tracked-product.model';

/** Como a candidata foi encontrada: 0 = GTIN idêntico (alta confiança), 1 = palavra-chave. */
export type CandidateReason = 0 | 1;

export interface OfferCandidate {
  id: string;
  productId: string;
  source: ProductSource;
  storeName: string;
  url: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  gtin?: string | null;
  brand?: string | null;
  model?: string | null;
  score: number;
  reason: CandidateReason;
  preselected: boolean;
  /** Veredito do juiz de IA (só quando o GTIN não resolveu e a IA respondeu). */
  aiSaysSame?: boolean | null;
  aiReason?: string | null;
}

export interface ConfirmMatchRequest {
  isSameProduct: boolean;
  track: boolean;
  targetPrice?: number;
}

/** Resultado do voto (a API serializa o enum como número). Em Attached, productId é o produto NOVO criado na mesma lista. */
export const ConfirmOutcome = {
  Rejected: 0,
  Recorded: 1,
  Attached: 2,
} as const;
export type ConfirmOutcome = (typeof ConfirmOutcome)[keyof typeof ConfirmOutcome];

export interface ConfirmMatchResponse {
  outcome: ConfirmOutcome;
  productId: string;
  offerId?: string | null;
}
