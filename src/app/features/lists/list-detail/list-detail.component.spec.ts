import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ListDetailComponent } from './list-detail.component';
import { ListsApiService } from '../../../core/services/api/lists-api.service';
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
      imports: [ListDetailComponent, TranslateModule.forRoot()],
      providers: [
        provideAnimationsAsync(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'L1' } } } },
        { provide: ProductsApiService, useValue: productsApi },
        { provide: ListsApiService, useValue: jasmine.createSpyObj('ListsApiService', ['getLists']) },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['success', 'error']) },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
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
