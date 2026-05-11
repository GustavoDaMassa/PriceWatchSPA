import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductsApiService } from './products-api.service';
import { environment } from '../../../../environments/environment';

describe('ProductsApiService', () => {
  let service: ProductsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductsApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should GET /products without filter', () => {
    service.getProducts().subscribe();
    http.expectOne(`${environment.apiUrl}/products`).flush([]);
  });

  it('should GET /products?listId=L1 when listId provided', () => {
    service.getProducts('L1').subscribe();
    http.expectOne(`${environment.apiUrl}/products?listId=L1`).flush([]);
  });

  it('should POST /products', () => {
    service.addProduct({ url: 'http://ml.com/1' }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should PUT /products/:id', () => {
    service.updateProduct('P1', { targetPrice: 99 }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/products/P1`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('should DELETE /products/:id', () => {
    service.removeProduct('P1').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/products/P1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should GET /products/:id/history', () => {
    service.getPriceHistory('P1').subscribe();
    http.expectOne(`${environment.apiUrl}/products/P1/history`).flush([]);
  });
});
