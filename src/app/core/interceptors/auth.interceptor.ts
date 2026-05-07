import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Deixar passar: assets locais (i18n, imagens, etc.)
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Deixar passar: endpoints públicos de autenticação
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  // Endpoints protegidos: exigir token válido
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isTokenExpired()) {
    auth.logout();
    router.navigate(['/auth/login']);
    return EMPTY;
  }

  const token = auth.getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
