import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ListDetailComponent } from './list-detail.component';
import { ProductsApiService } from '../../../core/services/api/products-api.service';
import { ToastService } from '../../../core/services/toast.service';

describe('ListDetailComponent', () => {
  let fixture: ComponentFixture<ListDetailComponent>;
  let productsApi: jasmine.SpyObj<ProductsApiService>;

  const mockProducts = [
    { id: 'P1', listId: 'L1', name: 'Produto A', url: 'http://ml.com/1', source: 0 as const,
      targetPrice: 100, currentPrice: 90, lowestPrice: 85, isActive: true, nextCheckAt: new Date().toISOString() },
  ];

  beforeEach(async () => {
    productsApi = jasmine.createSpyObj('ProductsApiService', ['getProducts', 'removeProduct', 'updateProduct']);
    productsApi.getProducts.and.returnValue(of(mockProducts));

    await TestBed.configureTestingModule({
      imports: [ListDetailComponent],
      providers: [
        provideAnimationsAsync(),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'L1' } } } },
        { provide: ProductsApiService, useValue: productsApi },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['success', 'error']) },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListDetailComponent);
    fixture.detectChanges();
  });

  it('should load products for the list on init', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(productsApi.getProducts).toHaveBeenCalledWith('L1');
    expect(fixture.componentInstance.products().length).toBe(1);
  }));
});
