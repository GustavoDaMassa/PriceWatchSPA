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

  const pills = () => fixture.debugElement.queryAll(By.css('.pill'));

  it('shows nothing when there is no search', () => {
    expect(pills().length).toBe(0);
  });

  it('shows a pill while the search runs and keeps it when the result arrives', () => {
    jobs.start('P1');
    fixture.detectChanges();
    expect(pills().length).toBe(1);
    expect(fixture.debugElement.query(By.css('mat-spinner'))).not.toBeNull();

    pending.next([]);
    fixture.detectChanges();
    expect(pills().length).toBe(1);
    expect(fixture.debugElement.query(By.css('mat-spinner'))).toBeNull();
  });

  it('opens the candidates of the product when the pill is clicked', () => {
    jobs.start('P1');
    fixture.detectChanges();

    (fixture.debugElement.query(By.css('.open')).nativeElement as HTMLButtonElement).click();

    expect(router.navigate).toHaveBeenCalledWith(['/products', 'P1', 'candidates']);
  });

  it('hides a finished search once the user dismisses it', () => {
    jobs.start('P1');
    pending.next([]);
    fixture.detectChanges();

    (fixture.debugElement.query(By.css('.close')).nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(pills().length).toBe(0);
  });
});
