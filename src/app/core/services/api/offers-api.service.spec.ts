import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OffersApiService } from './offers-api.service';
import { environment } from '../../../../environments/environment';

describe('OffersApiService', () => {
  let service: OffersApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(OffersApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should POST /offers with the pasted link, target price and list', () => {
    service.createOffer({ url: 'https://www.kabum.com.br/produto/1', targetPrice: 2000, listId: 'L1' }).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/offers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ url: 'https://www.kabum.com.br/produto/1', targetPrice: 2000, listId: 'L1' });
    req.flush({});
  });

  it('should GET the comparison of a product', () => {
    service.getComparison('P1').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/products/P1/comparison`);
    expect(req.request.method).toBe('GET');
    req.flush({ productId: 'P1', name: 'x', offers: [] });
  });

  it('should POST /offers/:id/click and return the store url', () => {
    let url = '';
    service.clickOffer('O1').subscribe(r => (url = r.url));

    const req = http.expectOne(`${environment.apiUrl}/offers/O1/click`);
    expect(req.request.method).toBe('POST');
    req.flush({ url: 'https://afiliado/?u=1' });

    expect(url).toBe('https://afiliado/?u=1');
  });
});
