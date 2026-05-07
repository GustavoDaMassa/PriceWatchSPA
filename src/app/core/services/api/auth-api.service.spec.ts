import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthApiService } from './auth-api.service';
import { environment } from '../../../../environments/environment';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should POST /auth/login and return AuthResponse', () => {
    const body = { email: 'a@b.com', password: '123' };
    const res = { token: 'jwt', email: 'a@b.com', name: 'Test' };
    service.login(body).subscribe(r => expect(r).toEqual(res));
    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(res);
  });

  it('should POST /auth/register', () => {
    const body = { name: 'Test', email: 'a@b.com', password: '123' };
    service.register(body).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'ok' });
  });

  it('should POST /auth/verify-email', () => {
    service.verifyEmail({ email: 'a@b.com', token: 'abc' }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/verify-email`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'ok' });
  });

  it('should POST /auth/resend-verification', () => {
    service.resendVerification({ email: 'a@b.com' }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/resend-verification`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'ok' });
  });
});
