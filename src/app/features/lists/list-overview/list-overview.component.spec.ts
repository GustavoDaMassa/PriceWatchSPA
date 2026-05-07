import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ListOverviewComponent } from './list-overview.component';
import { ListsApiService } from '../../../core/services/api/lists-api.service';
import { ToastService } from '../../../core/services/toast.service';

describe('ListOverviewComponent', () => {
  let fixture: ComponentFixture<ListOverviewComponent>;
  let listsApi: jasmine.SpyObj<ListsApiService>;

  const mockLists = [
    { id: '1', name: 'Lista A' },
    { id: '2', name: 'Lista B' },
  ];

  beforeEach(async () => {
    listsApi = jasmine.createSpyObj('ListsApiService', ['getLists', 'deleteList']);
    listsApi.getLists.and.returnValue(of(mockLists));

    await TestBed.configureTestingModule({
      imports: [ListOverviewComponent],
      providers: [
        provideAnimationsAsync(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: ListsApiService, useValue: listsApi },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['success', 'error']) },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListOverviewComponent);
    fixture.detectChanges();
  });

  it('should load and display lists on init', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(listsApi.getLists).toHaveBeenCalled();
    expect(fixture.componentInstance.lists().length).toBe(2);
  }));

  it('should show empty state when no lists', fakeAsync(() => {
    listsApi.getLists.and.returnValue(of([]));
    fixture.componentInstance.loadLists();
    tick();
    fixture.detectChanges();
    expect(fixture.componentInstance.lists().length).toBe(0);
  }));
});
