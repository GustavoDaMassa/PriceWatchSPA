import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ClickResponse,
  CreateOfferRequest,
  OfferResponse,
  ProductComparison,
} from '../../../shared/models/offer.model';

@Injectable({ providedIn: 'root' })
export class OffersApiService {
  private readonly http = inject(HttpClient);

  /** Importa o produto de um link colado (a API normaliza a URL e segue links curtos). */
  createOffer(req: CreateOfferRequest): Observable<OfferResponse> {
    return this.http.post<OfferResponse>(`${environment.apiUrl}/offers`, req);
  }

  getComparison(productId: string): Observable<ProductComparison> {
    return this.http.get<ProductComparison>(`${environment.apiUrl}/products/${productId}/comparison`);
  }

  /** Registra o clique e devolve a URL da loja (link de afiliado, se houver). */
  clickOffer(offerId: string): Observable<ClickResponse> {
    return this.http.post<ClickResponse>(`${environment.apiUrl}/offers/${offerId}/click`, null);
  }
}
