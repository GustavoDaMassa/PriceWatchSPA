import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  VerifyEmailRequest,
} from '../../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  register(req: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/register`, req);
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, req);
  }

  verifyEmail(req: VerifyEmailRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/verify-email`, req);
  }

  resendVerification(req: ResendVerificationRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/resend-verification`, req);
  }
}
