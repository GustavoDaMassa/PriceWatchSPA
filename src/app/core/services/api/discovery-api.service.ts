import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ConfirmMatchRequest,
  ConfirmMatchResponse,
  OfferCandidate,
} from '../../../shared/models/candidate.model';

@Injectable({ providedIn: 'root' })
export class DiscoveryApiService {
  private readonly http = inject(HttpClient);

  /** Procura o produto nas outras lojas (no máximo uma vez a cada 6 h por produto) e devolve as candidatas. */
  discover(productId: string): Observable<OfferCandidate[]> {
    return this.http.post<OfferCandidate[]>(`${environment.apiUrl}/products/${productId}/discover`, null);
  }

  getCandidates(productId: string): Observable<OfferCandidate[]> {
    return this.http.get<OfferCandidate[]>(`${environment.apiUrl}/products/${productId}/candidates`);
  }

  sendFeedback(candidateId: string, req: ConfirmMatchRequest): Observable<ConfirmMatchResponse> {
    return this.http.post<ConfirmMatchResponse>(`${environment.apiUrl}/candidates/${candidateId}/feedback`, req);
  }
}
