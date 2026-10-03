import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ProductLinkDialogComponent } from './product-link-dialog.component';
import { ProductsApiService } from '../../../core/services/api/products-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { TrackedProduct } from '../../../shared/models/tracked-product.model';

const PRODUCT: TrackedProduct = {
  id: 'ITEM-1', name: 'Notebook', url: 'https://www.kabum.com.br/produto/1', source: 1,
  targetPrice: 0, currentPrice: 2599.9, lowestPrice: 2400, isActive: true, nextCheckAt: new Date().toISOString(),
};

describe('ProductLinkDialogComponent', () => {
  let fixture: ComponentFixture<ProductLinkDialogComponent>;
  let component: ProductLinkDialogComponent;
  let api: jasmine.SpyObj<ProductsApiService>;
  let toast: jasmine.SpyObj<ToastService>;
  let ref: jasmine.SpyObj<MatDialogRef<ProductLinkDialogComponent>>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('ProductsApiService', ['click']);
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);
    ref = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ProductLinkDialogComponent],
      providers: [
        provideAnimationsAsync(),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: ProductsApiService, useValue: api },
        { provide: ToastService, useValue: toast },
        { provide: MatDialogRef, useValue: ref },
        { provide: MAT_DIALOG_DATA, useValue: PRODUCT },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductLinkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('opens the store through the click endpoint, never with the stored store url', () => {
    const tab = { location: { href: '' }, opener: {} as unknown, close: jasmine.createSpy('close') };
    const open = spyOn(window, 'open').and.returnValue(tab as unknown as Window);
    api.click.and.returnValue(of({ url: 'https://afiliado/?u=kabum' }));

    component.openUrl();

    expect(open).toHaveBeenCalledWith('about:blank', '_blank');
    expect(api.click).toHaveBeenCalledWith('ITEM-1');
    expect(tab.location.href).toBe('https://afiliado/?u=kabum');
    expect(tab.opener).toBeNull();
    expect(ref.close).toHaveBeenCalled();
  });

  it('closes the blank tab and reports the error when the click fails', () => {
    const tab = { location: { href: '' }, opener: {} as unknown, close: jasmine.createSpy('close') };
    spyOn(window, 'open').and.returnValue(tab as unknown as Window);
    api.click.and.returnValue(throwError(() => new Error('boom')));

    component.openUrl();

    expect(tab.close).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
    expect(tab.location.href).toBe('');
  });
});
