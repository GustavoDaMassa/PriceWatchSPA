import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductsApiService } from './products-api.service';
import { environment } from '../../../../environments/environment';

describe('ProductsApiService', () => {
  let service: ProductsApiService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/lists/L1/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductsApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should GET /lists/:listId/products', () => {
    service.getProducts('L1').subscribe();
    http.expectOne(base).flush([]);
  });

  it('should POST /lists/:listId/products', () => {
    service.addProduct('L1', { url: 'http://ml.com/1', source: 0 }).subscribe();
    const req = http.expectOne(base);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should PUT /lists/:listId/products/:id', () => {
    service.updateProduct('L1', 'P1', { targetPrice: 99 }).subscribe();
    const req = http.expectOne(`${base}/P1`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('should DELETE /lists/:listId/products/:id', () => {
    service.removeProduct('L1', 'P1').subscribe();
    const req = http.expectOne(`${base}/P1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should GET /lists/:listId/products/:id/history', () => {
    service.getPriceHistory('L1', 'P1').subscribe();
    http.expectOne(`${base}/P1/history`).flush([]);
  });
});
