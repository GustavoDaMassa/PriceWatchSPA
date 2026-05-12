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

  getProducts(listId?: string): Observable<TrackedProduct[]> {
    const url = `${environment.apiUrl}/products`;
    return listId
      ? this.http.get<TrackedProduct[]>(url, { params: { listId } })
      : this.http.get<TrackedProduct[]>(url);
  }

  addProduct(req: AddProductRequest): Observable<TrackedProduct> {
    return this.http.post<TrackedProduct>(`${environment.apiUrl}/products`, req);
  }

  updateProduct(id: string, req: UpdateProductRequest): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/products/${id}`, req);
  }

  assignToList(id: string, listId: string | null): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/products/${id}/list`, { listId });
  }

  removeProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${id}`);
  }

  getPriceHistory(id: string): Observable<PriceSnapshot[]> {
    return this.http.get<PriceSnapshot[]>(`${environment.apiUrl}/products/${id}/history`);
  }
}
