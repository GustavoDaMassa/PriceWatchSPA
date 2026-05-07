import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ListsApiService } from './lists-api.service';
import { environment } from '../../../../environments/environment';

describe('ListsApiService', () => {
  let service: ListsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ListsApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ListsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should GET /lists', () => {
    service.getLists().subscribe();
    http.expectOne(`${environment.apiUrl}/lists`).flush([]);
  });

  it('should POST /lists', () => {
    service.createList({ name: 'Test' }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/lists`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: '1', name: 'Test', createdAt: '' });
  });

  it('should PUT /lists/:id', () => {
    service.updateList('1', { name: 'Updated' }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/lists/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('should DELETE /lists/:id', () => {
    service.deleteList('1').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/lists/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should GET /lists/:id/analysis', () => {
    service.getAnalysis('1').subscribe();
    http.expectOne(`${environment.apiUrl}/lists/1/analysis`).flush([]);
  });
});
