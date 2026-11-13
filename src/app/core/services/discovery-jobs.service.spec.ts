import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
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

    expect(service.job('P1')).toEqual({ productId: 'P1', status: 'done', candidates: [CANDIDATE], seen: false, fromRefresh: false, newIds: [] });
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

  describe('refresh (nova busca)', () => {
    const NEW = { ...CANDIDATE, id: 'C2', url: 'u2' } as OfferCandidate;

    function finishedFirstSearch(): void {
      service.start('P1');
      pending.next([CANDIDATE]);
      pending = new Subject<OfferCandidate[]>();
      api.discover.and.returnValue(pending.asObservable());
    }

    it('asks the API for a new search and tells which candidates are new, keeping the old ones', () => {
      finishedFirstSearch();

      service.refresh('P1');
      expect(api.discover).toHaveBeenCalledWith('P1', true);
      expect(service.job('P1')?.status).toBe('running');
      expect(service.job('P1')?.candidates).toEqual([CANDIDATE]); // a lista atual continua enquanto busca

      pending.next([CANDIDATE, NEW]);

      expect(service.job('P1')).toEqual(jasmine.objectContaining({
        status: 'done', fromRefresh: true, newIds: ['C2'], candidates: [CANDIDATE, NEW], seen: false,
      }));
    });

    it('reports nothing new when the API returns only what was already there', () => {
      finishedFirstSearch();

      service.refresh('P1');
      pending.next([CANDIDATE]);

      expect(service.job('P1')?.newIds).toEqual([]);
      expect(service.job('P1')?.failure).toBeUndefined();
    });

    it('keeps the list and flags the cooldown when the API answers 429', () => {
      finishedFirstSearch();
      api.discover.and.returnValue(throwError(() => new HttpErrorResponse({ status: 429 })));

      service.refresh('P1');

      expect(service.job('P1')).toEqual(jasmine.objectContaining({ status: 'done', failure: 'cooldown', candidates: [CANDIDATE] }));
    });

    it('keeps the list and flags an error on other failures', () => {
      finishedFirstSearch();
      api.discover.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

      service.refresh('P1');

      expect(service.job('P1')?.failure).toBe('error');
    });

    it('does nothing without a finished search or while one is running', () => {
      service.refresh('P1');
      expect(api.discover).not.toHaveBeenCalled();

      service.start('P1');
      service.refresh('P1');
      expect(api.discover).toHaveBeenCalledTimes(1);
    });
  });
});
