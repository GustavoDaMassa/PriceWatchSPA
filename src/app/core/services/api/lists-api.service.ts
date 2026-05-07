import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AnalysisItem,
  CreateProductListRequest,
  ProductList,
  UpdateProductListRequest,
} from '../../../shared/models/product-list.model';

@Injectable({ providedIn: 'root' })
export class ListsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/lists`;

  getLists(): Observable<ProductList[]> {
    return this.http.get<ProductList[]>(this.base);
  }

  createList(req: CreateProductListRequest): Observable<ProductList> {
    return this.http.post<ProductList>(this.base, req);
  }

  updateList(id: string, req: UpdateProductListRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, req);
  }

  deleteList(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getAnalysis(id: string): Observable<AnalysisItem[]> {
    return this.http.get<AnalysisItem[]>(`${this.base}/${id}/analysis`);
  }
}
