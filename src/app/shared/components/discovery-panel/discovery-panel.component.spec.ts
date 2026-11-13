import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { DiscoveryPanelComponent } from './discovery-panel.component';
import { DiscoveryApiService } from '../../../core/services/api/discovery-api.service';
import { DiscoveryJobsService } from '../../../core/services/discovery-jobs.service';
import { OfferCandidate } from '../../models/candidate.model';

describe('DiscoveryPanelComponent', () => {
  let fixture: ComponentFixture<DiscoveryPanelComponent>;
  let jobs: DiscoveryJobsService;
  let router: Router;
  let pending: Subject<OfferCandidate[]>;

  beforeEach(async () => {
    pending = new Subject<OfferCandidate[]>();
    const api = jasmine.createSpyObj('DiscoveryApiService', ['discover']);
    api.discover.and.returnValue(pending.asObservable());
    await TestBed.configureTestingModule({
      imports: [DiscoveryPanelComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: DiscoveryApiService, useValue: api },
      ],
    }).compileComponents();
    jobs = TestBed.inject(DiscoveryJobsService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(DiscoveryPanelComponent);
    fixture.detectChanges();
  });

  const windows = () => fixture.debugElement.queryAll(By.css('.win'));
  const body = () => fixture.debugElement.query(By.css('.body'));
  const click = (selector: string, index = 0) =>
    (fixture.debugElement.queryAll(By.css(selector))[index].nativeElement as HTMLButtonElement).click();
  const candidate = { id: 'C1', productId: 'P1', source: 0, storeName: 'Mercado Livre', url: 'u', name: 'n',
    price: 1, score: 1, reason: 1, preselected: false } as OfferCandidate;

  it('shows nothing when there is no search', () => {
    expect(windows().length).toBe(0);
  });

  it('stays minimized while the search runs and opens on demand', () => {
    jobs.start('P1');
    fixture.detectChanges();

    expect(windows().length).toBe(1);
    expect(fixture.debugElement.query(By.css('mat-spinner'))).not.toBeNull();
    expect(body()).toBeNull();

    click('header .icon', 0);
    fixture.detectChanges();

    expect(body()).not.toBeNull();
  });

  it('opens by itself, turns green and points to the similar products when the result arrives', () => {
    jobs.start('P1');
    fixture.detectChanges();
    expect(body()).toBeNull();

    pending.next([candidate]);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.win.ready'))).not.toBeNull();
    expect(body()).not.toBeNull();

    click('.cta');
    expect(router.navigate).toHaveBeenCalledWith(['/products', 'P1', 'candidates']);
  });

  it('explains that finding nothing is normal and only offers to close', () => {
    jobs.start('P1');
    pending.next([]);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.win.ready'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.cta'))).toBeNull();
    expect(body()).not.toBeNull();
  });

  it('stays on screen until the user opens the result or closes it', () => {
    jobs.start('P1');
    pending.next([candidate]);
    fixture.detectChanges();
    expect(windows().length).toBe(1);

    click('header .icon', 0);
    fixture.detectChanges();

    expect(windows().length).toBe(0);
  });

  describe('nova busca', () => {
    const fresh = { ...candidate, id: 'C2' } as OfferCandidate;

    function finishFirstSearch(): void {
      jobs.start('P1');
      pending.next([candidate]);
      jobs.markSeen('P1');
      pending = new Subject<OfferCandidate[]>();
      (TestBed.inject(DiscoveryApiService).discover as jasmine.Spy).and.returnValue(pending.asObservable());
    }

    it('warns, opened and green, only when the new search brings new products', () => {
      finishFirstSearch();
      jobs.refresh('P1');
      fixture.detectChanges();
      expect(windows().length).toBe(1);                   // buscando de novo: volta a aparecer minimizada
      expect(body()).toBeNull();

      pending.next([candidate, fresh]);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.win.ready'))).not.toBeNull();
      expect(body()).not.toBeNull();
    });

    it('says that nothing new is normal, without the green call to action', () => {
      finishFirstSearch();
      jobs.refresh('P1');

      pending.next([candidate]);
      fixture.detectChanges();

      expect(windows().length).toBe(1);
      expect(fixture.debugElement.query(By.css('.win.ready'))).toBeNull();
      expect(fixture.debugElement.query(By.css('.cta'))).toBeNull();
    });
  });
});
