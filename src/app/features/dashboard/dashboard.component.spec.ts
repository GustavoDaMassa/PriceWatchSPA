import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { ListsApiService } from '../../core/services/api/lists-api.service';
import { ProductsApiService } from '../../core/services/api/products-api.service';
import { NotificationPollingService } from '../../core/services/notification-polling.service';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let listsApi: jasmine.SpyObj<ListsApiService>;
  let productsApi: jasmine.SpyObj<ProductsApiService>;

  const mockLists = [{ id: '1', name: 'Lista A' }];

  beforeEach(async () => {
    listsApi = jasmine.createSpyObj('ListsApiService', ['getLists']);
    productsApi = jasmine.createSpyObj('ProductsApiService', ['getProducts']);
    listsApi.getLists.and.returnValue(of(mockLists));
    productsApi.getProducts.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideAnimationsAsync(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: ListsApiService, useValue: listsApi },
        { provide: ProductsApiService, useValue: productsApi },
        { provide: NotificationPollingService, useValue: { unreadCount: signal(2) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  it('should load lists and show stats', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(listsApi.getLists).toHaveBeenCalled();
    expect(fixture.componentInstance.lists().length).toBe(1);
  }));
});
