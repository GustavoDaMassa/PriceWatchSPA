import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NotificationsApiService } from './notifications-api.service';
import { environment } from '../../../../environments/environment';

describe('NotificationsApiService', () => {
  let service: NotificationsApiService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/notifications`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationsApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotificationsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should GET /notifications without filter', () => {
    service.getNotifications().subscribe();
    http.expectOne(base).flush([]);
  });

  it('should GET /notifications?isRead=false', () => {
    service.getNotifications(false).subscribe();
    http.expectOne(`${base}?isRead=false`).flush([]);
  });

  it('should PATCH /notifications/:id/read', () => {
    service.markAsRead('N1').subscribe();
    const req = http.expectOne(`${base}/N1/read`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  it('should PATCH /notifications/read-all', () => {
    service.markAllAsRead().subscribe();
    const req = http.expectOne(`${base}/read-all`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });
});
