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

  /**
   * Procura produtos parecidos (no máximo uma vez a cada 6 h por produto) e devolve as candidatas. Com `refresh`
   * faz uma nova busca, que só traz o que ainda não apareceu (a API responde 429 se for repetida em seguida).
   */
  discover(productId: string, refresh = false): Observable<OfferCandidate[]> {
    return this.http.post<OfferCandidate[]>(
      `${environment.apiUrl}/products/${productId}/discover`, null, refresh ? { params: { refresh: true } } : {});
  }

  getCandidates(productId: string): Observable<OfferCandidate[]> {
    return this.http.get<OfferCandidate[]>(`${environment.apiUrl}/products/${productId}/candidates`);
  }

  sendFeedback(candidateId: string, req: ConfirmMatchRequest): Observable<ConfirmMatchResponse> {
    return this.http.post<ConfirmMatchResponse>(`${environment.apiUrl}/candidates/${candidateId}/feedback`, req);
  }
}
