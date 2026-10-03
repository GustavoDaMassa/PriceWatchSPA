import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StoresApiService } from './stores-api.service';
import { environment } from '../../../../environments/environment';

describe('StoresApiService', () => {
  let service: StoresApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(StoresApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should GET /stores', () => {
    const stores = [{ source: 0, name: 'Mercado Livre', homeUrl: 'https://www.mercadolivre.com.br',
      canFetchByUrl: true, canSearch: true, canGenerateAffiliateLink: false }];
    let result: unknown;
    service.getStores().subscribe(r => (result = r));

    const req = http.expectOne(`${environment.apiUrl}/stores`);
    expect(req.request.method).toBe('GET');
    req.flush(stores);

    expect(result).toEqual(stores);
  });
});
