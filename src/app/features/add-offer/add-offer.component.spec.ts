import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { AddOfferComponent } from './add-offer.component';
import { OffersApiService } from '../../core/services/api/offers-api.service';
import { StoresApiService } from '../../core/services/api/stores-api.service';
import { ExtensionBridgeService } from '../../core/services/extension-bridge.service';
import { ToastService } from '../../core/services/toast.service';
import { OfferResponse } from '../../shared/models/offer.model';
import { StoreCapabilities } from '../../shared/models/store.model';

const STORES: StoreCapabilities[] = [
  { source: 0, name: 'Mercado Livre', homeUrl: 'https://www.mercadolivre.com.br', canFetchByUrl: true, canSearch: true, canGenerateAffiliateLink: false },
  { source: 1, name: 'KaBuM!', homeUrl: 'https://www.kabum.com.br', canFetchByUrl: false, canSearch: false, canGenerateAffiliateLink: false },
];

function offerFor(productId: string): OfferResponse {
  return {
    subscriptionId: 'S1', productId, offerId: 'O1', name: 'Produto', url: 'https://loja/p/1', source: 1,
    targetPrice: 0, currentPrice: 100, lowestPrice: 100, isActive: true, nextCheckAt: new Date().toISOString(),
  };
}

describe('AddOfferComponent', () => {
  let fixture: ComponentFixture<AddOfferComponent>;
  let component: AddOfferComponent;
  let storesApi: jasmine.SpyObj<StoresApiService>;
  let offersApi: jasmine.SpyObj<OffersApiService>;
  let bridge: jasmine.SpyObj<ExtensionBridgeService>;
  let toast: jasmine.SpyObj<ToastService>;
  let router: Router;
  let tracked$: Subject<{ productId: string }>;

  async function setup(extensionInstalled = true, listId: string | null = 'L1') {
    storesApi = jasmine.createSpyObj('StoresApiService', ['getStores']);
    storesApi.getStores.and.returnValue(of(STORES));
    offersApi = jasmine.createSpyObj('OffersApiService', ['createOffer']);
    tracked$ = new Subject();
    bridge = jasmine.createSpyObj('ExtensionBridgeService', ['isInstalled', 'openStore', 'tracked$']);
    bridge.isInstalled.and.resolveTo(extensionInstalled);
    bridge.tracked$.and.returnValue(tracked$.asObservable());
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [AddOfferComponent],
      providers: [
        provideAnimationsAsync(),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: StoresApiService, useValue: storesApi },
        { provide: OffersApiService, useValue: offersApi },
        { provide: ExtensionBridgeService, useValue: bridge },
        { provide: ToastService, useValue: toast },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(listId ? { listId } : {}) } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(AddOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('lists only the stores the platform can fetch by url', async () => {
    await setup();

    expect(component.stores().map(s => s.name)).toEqual(['Mercado Livre']);
    expect(fixture.debugElement.queryAll(By.css('.store-btn')).length).toBe(1);
  });

  it('keeps the submit button disabled until the link looks valid', async () => {
    await setup();
    const submit = fixture.debugElement.query(By.css('button.submit')).nativeElement as HTMLButtonElement;

    expect(submit.disabled).toBeTrue();

    component.form.patchValue({ url: 'https://www.kabum.com.br/produto/1' });
    fixture.detectChanges();

    expect(submit.disabled).toBeFalse();
  });

  it('accepts a pasted link with surrounding whitespace or a trailing newline', async () => {
    await setup();

    component.form.patchValue({ url: '  https://www.kabum.com.br/produto/1\n' });

    expect(component.form.controls.url.valid).toBeTrue();
  });

  it('rejects text that is not a link', async () => {
    await setup();

    component.form.patchValue({ url: 'isto nao e um link' });

    expect(component.form.controls.url.valid).toBeFalse();
  });

  it('imports the link with the target price and the list, then goes to the candidates', async () => {
    await setup(true, 'L1');
    offersApi.createOffer.and.returnValue(of(offerFor('P9')));
    component.form.patchValue({ url: ' https://www.kabum.com.br/produto/1 ', targetPrice: 2500 });

    component.submit();

    expect(offersApi.createOffer).toHaveBeenCalledWith({
      url: 'https://www.kabum.com.br/produto/1',
      targetPrice: 2500,
      listId: 'L1',
    });
    expect(toast.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/products', 'P9', 'candidates']);
  });

  it('does not send a list or target when none was given', async () => {
    await setup(true, null);
    offersApi.createOffer.and.returnValue(of(offerFor('P9')));
    component.form.patchValue({ url: 'www.kabum.com.br/produto/1' });

    component.submit();

    expect(offersApi.createOffer).toHaveBeenCalledWith({
      url: 'www.kabum.com.br/produto/1',
      targetPrice: undefined,
      listId: undefined,
    });
  });

  it('shows the API message and stays on the page when the import fails', async () => {
    await setup();
    offersApi.createOffer.and.returnValue(
      throwError(() => ({ error: { message: 'This store is not supported yet.' } })));
    component.form.patchValue({ url: 'https://loja-desconhecida.com/p/1' });

    component.submit();

    expect(toast.error).toHaveBeenCalledWith('This store is not supported yet.');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });

  it('does not submit twice while a request is in flight', async () => {
    await setup();
    const pending = new Subject<never>();
    offersApi.createOffer.and.returnValue(pending.asObservable());
    component.form.patchValue({ url: 'https://www.kabum.com.br/produto/1' });

    component.submit();
    component.submit();

    expect(offersApi.createOffer).toHaveBeenCalledTimes(1);
  });

  it('enables the store buttons and opens the store when the extension is installed', async () => {
    await setup(true);
    const button = fixture.debugElement.query(By.css('.store-btn')).nativeElement as HTMLButtonElement;

    expect(button.disabled).toBeFalse();
    button.click();

    expect(bridge.openStore).toHaveBeenCalledWith('https://www.mercadolivre.com.br');
  });

  it('disables the store buttons and offers the install when the extension is missing', async () => {
    await setup(false);
    const button = fixture.debugElement.query(By.css('.store-btn')).nativeElement as HTMLButtonElement;

    expect(button.disabled).toBeTrue();
    expect(fixture.debugElement.query(By.css('.install'))).not.toBeNull();
  });

  it('goes to the candidates when the extension reports a tracked product', async () => {
    await setup(true);

    tracked$.next({ productId: 'P7' });

    expect(router.navigate).toHaveBeenCalledWith(['/products', 'P7', 'candidates']);
  });
});
