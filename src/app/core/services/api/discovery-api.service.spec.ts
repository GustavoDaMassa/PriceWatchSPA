import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DiscoveryApiService } from './discovery-api.service';
import { environment } from '../../../../environments/environment';

describe('DiscoveryApiService', () => {
  let service: DiscoveryApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DiscoveryApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should POST /products/:id/discover', () => {
    service.discover('P1').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/products/P1/discover`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('should GET /products/:id/candidates', () => {
    service.getCandidates('P1').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/products/P1/candidates`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should POST the verdict to /candidates/:id/feedback', () => {
    service.sendFeedback('C1', { isSameProduct: true, track: true, targetPrice: 1500 }).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/candidates/C1/feedback`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ isSameProduct: true, track: true, targetPrice: 1500 });
    req.flush({ outcome: 2, productId: 'P1', offerId: 'O2' });
  });
});
