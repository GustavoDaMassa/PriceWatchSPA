import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StoreCapabilities } from '../../../shared/models/store.model';

@Injectable({ providedIn: 'root' })
export class StoresApiService {
  private readonly http = inject(HttpClient);

  getStores(): Observable<StoreCapabilities[]> {
    return this.http.get<StoreCapabilities[]>(`${environment.apiUrl}/stores`);
  }
}
