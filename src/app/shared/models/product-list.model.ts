export interface ProductList {
  id: string;
  name: string;
  description?: string;
}

export interface CreateProductListRequest {
  name: string;
  description?: string;
}

export interface UpdateProductListRequest {
  name: string;
  description?: string;
}

export interface AnalysisItem {
  productId: string;
  productName: string;
  currentPrice: number;
  targetPrice: number;
  distancePercent: number;
}
