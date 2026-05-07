import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AddProductRequest,
  PriceSnapshot,
  TrackedProduct,
  UpdateProductRequest,
} from '../../../shared/models/tracked-product.model';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);

  private base(listId: string): string {
    return `${environment.apiUrl}/lists/${listId}/products`;
  }

  getProducts(listId: string): Observable<TrackedProduct[]> {
    return this.http.get<TrackedProduct[]>(this.base(listId));
  }

  addProduct(listId: string, req: AddProductRequest): Observable<TrackedProduct> {
    return this.http.post<TrackedProduct>(this.base(listId), req);
  }

  updateProduct(listId: string, id: string, req: UpdateProductRequest): Observable<void> {
    return this.http.put<void>(`${this.base(listId)}/${id}`, req);
  }

  removeProduct(listId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.base(listId)}/${id}`);
  }

  getPriceHistory(listId: string, id: string): Observable<PriceSnapshot[]> {
    return this.http.get<PriceSnapshot[]>(`${this.base(listId)}/${id}/history`);
  }
}
