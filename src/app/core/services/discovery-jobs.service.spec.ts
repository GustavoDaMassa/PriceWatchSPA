import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import { DiscoveryApiService } from './api/discovery-api.service';
import { DiscoveryJobsService } from './discovery-jobs.service';
import { OfferCandidate } from '../../shared/models/candidate.model';

const CANDIDATE = { id: 'C1', productId: 'P1', source: 0, storeName: 'Mercado Livre', url: 'u', name: 'n',
  price: 1, score: 1, reason: 1, preselected: false } as OfferCandidate;

describe('DiscoveryJobsService', () => {
  let api: jasmine.SpyObj<DiscoveryApiService>;
  let service: DiscoveryJobsService;
  let pending: Subject<OfferCandidate[]>;

  beforeEach(() => {
    pending = new Subject<OfferCandidate[]>();
    api = jasmine.createSpyObj('DiscoveryApiService', ['discover']);
    api.discover.and.returnValue(pending.asObservable());
    TestBed.configureTestingModule({ providers: [{ provide: DiscoveryApiService, useValue: api }] });
    service = TestBed.inject(DiscoveryJobsService);
  });

  it('keeps the search running outside any screen and stores the result when it ends', () => {
    service.start('P1');
    expect(service.job('P1')?.status).toBe('running');

    pending.next([CANDIDATE]);

    expect(service.job('P1')).toEqual({ productId: 'P1', status: 'done', candidates: [CANDIDATE], seen: false });
  });

  it('does not start a second search while one is running for the same product', () => {
    service.start('P1');
    service.start('P1');

    expect(api.discover).toHaveBeenCalledTimes(1);
  });

  it('runs again after the previous search ended (the API answers from its cache)', () => {
    service.start('P1');
    pending.next([]);
    service.start('P1');

    expect(api.discover).toHaveBeenCalledTimes(2);
  });

  it('records a failure so the panel can offer another try', () => {
    api.discover.and.returnValue(throwError(() => new Error('boom')));

    service.start('P1');

    expect(service.job('P1')?.status).toBe('error');
  });

  it('marks a job as seen and removes a judged candidate', () => {
    service.start('P1');
    pending.next([CANDIDATE]);

    service.removeCandidate('P1', 'C1');
    service.markSeen('P1');

    expect(service.job('P1')?.candidates).toEqual([]);
    expect(service.job('P1')?.seen).toBeTrue();
  });
});
