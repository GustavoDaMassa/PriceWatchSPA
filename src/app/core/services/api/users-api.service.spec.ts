import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UsersApiService } from './users-api.service';
import { environment } from '../../../../environments/environment';

describe('UsersApiService', () => {
  let service: UsersApiService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/users/me`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsersApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should GET /users/me', () => {
    service.getProfile().subscribe();
    http.expectOne(base).flush({ id: '1', name: 'Test', email: 'a@b.com', isEmailVerified: true, createdAt: '' });
  });

  it('should PATCH /users/me/password', () => {
    service.changePassword({ currentPassword: '123', newPassword: '456' }).subscribe();
    const req = http.expectOne(`${base}/password`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  it('should PATCH /users/me/email', () => {
    service.changeEmail({ newEmail: 'new@b.com' }).subscribe();
    const req = http.expectOne(`${base}/email`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  it('should DELETE /users/me', () => {
    service.deleteAccount({ password: '123' }).subscribe();
    const req = http.expectOne(base);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
