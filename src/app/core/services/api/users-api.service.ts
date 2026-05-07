import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ChangeEmailRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  UserProfile,
} from '../../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users/me`;

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.base);
  }

  changePassword(req: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/password`, req);
  }

  changeEmail(req: ChangeEmailRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/email`, req);
  }

  deleteAccount(req: DeleteAccountRequest): Observable<void> {
    return this.http.delete<void>(this.base, { body: req });
  }
}
