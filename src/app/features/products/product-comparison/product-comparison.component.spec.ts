import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { ProductComparisonComponent } from './product-comparison.component';
import { OffersApiService } from '../../../core/services/api/offers-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductComparison } from '../../../shared/models/offer.model';

const MINUTES_AGO = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

const COMPARISON: ProductComparison = {
  productId: 'P1',
  name: 'Notebook Acer Nitro 5',
  imageUrl: 'https://img/n.png',
  offers: [
    { offerId: 'O1', source: 1, currentPrice: 2599.9, isCheapest: true, storeName: 'KaBuM!', lowestPrice: 2499, lastCheckedAt: MINUTES_AGO(5) },
    { offerId: 'O2', source: 0, currentPrice: 2799, isCheapest: false, storeName: 'Mercado Livre', lowestPrice: 2700, lastCheckedAt: null },
  ],
};

describe('ProductComparisonComponent', () => {
  let fixture: ComponentFixture<ProductComparisonComponent>;
  let component: ProductComparisonComponent;
  let api: jasmine.SpyObj<OffersApiService>;
  let toast: jasmine.SpyObj<ToastService>;
  let router: Router;

  async function setup(comparison: ProductComparison = COMPARISON) {
    api = jasmine.createSpyObj('OffersApiService', ['getComparison', 'clickOffer']);
    api.getComparison.and.returnValue(of(comparison));
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [ProductComparisonComponent],
      providers: [
        provideAnimationsAsync(),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: OffersApiService, useValue: api },
        { provide: ToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ productId: 'P1' }) } } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(ProductComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const offers = () => fixture.debugElement.queryAll(By.css('.offer'));

  it('loads the comparison and renders one card per store', async () => {
    await setup();

    expect(api.getComparison).toHaveBeenCalledWith('P1');
    expect(offers().length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Notebook Acer Nitro 5');
    expect(fixture.nativeElement.textContent).toContain('KaBuM!');
  });

  it('highlights the cheapest store only when there is something to compare', async () => {
    await setup();

    expect(offers()[0].classes['cheapest']).toBeTrue();
    expect(offers()[1].classes['cheapest']).toBeFalsy();
    expect(fixture.debugElement.queryAll(By.css('.badge')).length).toBe(1);
  });

  it('does not show the "lowest price" badge for a single store', async () => {
    await setup({ ...COMPARISON, offers: [COMPARISON.offers[0]] });

    expect(fixture.debugElement.queryAll(By.css('.badge')).length).toBe(0);
  });

  it('shows how fresh each price is and when it was never checked', async () => {
    await setup();

    const text = offers().map(o => (o.nativeElement as HTMLElement).textContent ?? '');
    expect(text[0]).toContain('COMPARISON.LAST_CHECKED');
    expect(text[0]).toContain('min');
    expect(text[1]).toContain('COMPARISON.NEVER_CHECKED');
  });

  it('always shows the note that prices can lag behind the store', async () => {
    await setup();

    expect(fixture.nativeElement.textContent).toContain('COMPARISON.FRESHNESS_NOTE');
  });

  it('opens the store through the click endpoint instead of the store url', async () => {
    await setup();
    const tab = { location: { href: '' }, opener: {} as unknown, close: jasmine.createSpy('close') };
    const open = spyOn(window, 'open').and.returnValue(tab as unknown as Window);
    api.clickOffer.and.returnValue(of({ url: 'https://afiliado/?u=kabum' }));

    component.openStore(COMPARISON.offers[0]);

    expect(open).toHaveBeenCalledWith('about:blank', '_blank');
    expect(api.clickOffer).toHaveBeenCalledWith('O1');
    expect(tab.location.href).toBe('https://afiliado/?u=kabum');
    expect(tab.opener).toBeNull();
  });

  it('closes the blank tab and reports the error when the click fails', async () => {
    await setup();
    const tab = { location: { href: '' }, opener: {} as unknown, close: jasmine.createSpy('close') };
    spyOn(window, 'open').and.returnValue(tab as unknown as Window);
    api.clickOffer.and.returnValue(throwError(() => new Error('boom')));

    component.openStore(COMPARISON.offers[1]);

    expect(tab.close).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
    expect(tab.location.href).toBe('');
  });

  it('goes to the discovery page to look in other stores', async () => {
    await setup();

    component.findMore();

    expect(router.navigate).toHaveBeenCalledWith(['/products', 'P1', 'candidates']);
  });

  it('reports the error when the comparison cannot be loaded', async () => {
    api = jasmine.createSpyObj('OffersApiService', ['getComparison', 'clickOffer']);
    api.getComparison.and.returnValue(throwError(() => new Error('boom')));
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);
    await TestBed.configureTestingModule({
      imports: [ProductComparisonComponent],
      providers: [
        provideAnimationsAsync(),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: OffersApiService, useValue: api },
        { provide: ToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ productId: 'P1' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductComparisonComponent);
    fixture.detectChanges();

    expect(toast.error).toHaveBeenCalled();
    expect(fixture.componentInstance.loading()).toBeFalse();
  });
});
