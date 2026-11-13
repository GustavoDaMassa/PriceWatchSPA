import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { CandidateReviewComponent } from './candidate-review.component';
import { DiscoveryApiService } from '../../../core/services/api/discovery-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmOutcome, OfferCandidate } from '../../../shared/models/candidate.model';

const CANDIDATES: OfferCandidate[] = [
  { id: 'C1', productId: 'P1', source: 1, storeName: 'KaBuM!', url: 'https://kabum/p/1', name: 'Notebook Acer',
    price: 2599.9, score: 1, reason: 0, preselected: true },
  { id: 'C2', productId: 'P1', source: 0, storeName: 'Mercado Livre', url: 'https://ml/p/2', name: 'Notebook Acer 16GB',
    price: 2700, score: 0.7, reason: 1, preselected: false, aiSaysSame: true, aiReason: 'Mesmo modelo e memória' },
];

describe('CandidateReviewComponent', () => {
  let fixture: ComponentFixture<CandidateReviewComponent>;
  let component: CandidateReviewComponent;
  let api: jasmine.SpyObj<DiscoveryApiService>;
  let toast: jasmine.SpyObj<ToastService>;
  let router: Router;

  async function setup(candidates = CANDIDATES) {
    api = jasmine.createSpyObj('DiscoveryApiService', ['discover', 'sendFeedback']);
    api.discover.and.returnValue(of(candidates));
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [CandidateReviewComponent],
      providers: [
        provideAnimationsAsync(),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: DiscoveryApiService, useValue: api },
        { provide: ToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ productId: 'P1' }), queryParamMap: convertToParamMap({ listId: 'L1' }) } } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(CandidateReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const cards = () => fixture.debugElement.queryAll(By.css('.candidate'));

  it('runs the discovery for the product and lists the candidates', async () => {
    await setup();

    expect(api.discover).toHaveBeenCalledWith('P1');
    expect(cards().length).toBe(2);
    expect(component.loading()).toBeFalse();
  });

  it('shows the empty state when nothing was found', async () => {
    await setup([]);

    expect(cards().length).toBe(0);
    expect(fixture.debugElement.query(By.css('app-empty-state'))).not.toBeNull();
  });

  it('tells the user when the discovery fails', async () => {
    api = jasmine.createSpyObj('DiscoveryApiService', ['discover', 'sendFeedback']);
    api.discover.and.returnValue(throwError(() => new Error('boom')));
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);
    await TestBed.configureTestingModule({
      imports: [CandidateReviewComponent],
      providers: [
        provideAnimationsAsync(),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: DiscoveryApiService, useValue: api },
        { provide: ToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ productId: 'P1' }), queryParamMap: convertToParamMap({ listId: 'L1' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CandidateReviewComponent);
    fixture.detectChanges();

    expect(toast.error).toHaveBeenCalled();
    expect(fixture.componentInstance.loading()).toBeFalse();
  });

  it('accepting a similar product tracks it as a new product, removes the card and offers the list', async () => {
    await setup();
    api.sendFeedback.and.returnValue(of({ outcome: ConfirmOutcome.Attached, productId: 'P2', offerId: 'O9' }));

    component.answer(CANDIDATES[0], true);
    fixture.detectChanges();

    expect(api.sendFeedback).toHaveBeenCalledWith('C1', { isSameProduct: true, track: true });
    expect(cards().length).toBe(1);
    expect(toast.success).toHaveBeenCalledWith('CANDIDATES.OUTCOME_ATTACHED');
    expect(component.attached()).toBeTrue();
    expect(fixture.debugElement.query(By.css('.btn-primary'))).not.toBeNull();
  });

  it('shows the AI reason only on the candidates the AI judged', async () => {
    await setup();

    const ai = fixture.debugElement.queryAll(By.css('.ai'));
    expect(ai.length).toBe(1);
    expect((ai[0].nativeElement as HTMLElement).textContent).toContain('Mesmo modelo e memória');
  });

  it('rejecting sends "not the same" without tracking', async () => {
    await setup();
    api.sendFeedback.and.returnValue(of({ outcome: ConfirmOutcome.Rejected, productId: 'P1' }));

    component.answer(CANDIDATES[1], false);

    expect(api.sendFeedback).toHaveBeenCalledWith('C2', { isSameProduct: false, track: false });
    expect(toast.success).toHaveBeenCalledWith('CANDIDATES.OUTCOME_REJECTED');
    expect(component.attached()).toBeFalse();
  });

  it('keeps the candidate and reports the error when the answer cannot be saved', async () => {
    await setup();
    api.sendFeedback.and.returnValue(throwError(() => new Error('boom')));

    component.answer(CANDIDATES[0], true);

    expect(component.candidates().length).toBe(2);
    expect(toast.error).toHaveBeenCalled();
    expect(component.busy().has('C1')).toBeFalse();
  });

  it('disables the buttons of a candidate while its answer is in flight', async () => {
    await setup();
    const pending = new Subject<never>();
    api.sendFeedback.and.returnValue(pending.asObservable());

    component.answer(CANDIDATES[0], true);
    fixture.detectChanges();

    const buttons = cards()[0].queryAll(By.css('button'));
    expect(buttons.every(b => (b.nativeElement as HTMLButtonElement).disabled)).toBeTrue();
  });

  it('goes to the analysis of the list and back to the items', async () => {
    await setup();

    component.goToList();
    component.finish();

    expect(router.navigate).toHaveBeenCalledWith(['/lists', 'L1', 'analysis']);
    expect(router.navigate).toHaveBeenCalledWith(['/items']);
  });
});
