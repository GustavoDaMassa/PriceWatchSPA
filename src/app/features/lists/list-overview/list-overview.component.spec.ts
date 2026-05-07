import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { ListOverviewComponent } from './list-overview.component';
import { ListsApiService } from '../../../core/services/api/lists-api.service';
import { ToastService } from '../../../core/services/toast.service';

describe('ListOverviewComponent', () => {
  let fixture: ComponentFixture<ListOverviewComponent>;
  let listsApi: jasmine.SpyObj<ListsApiService>;

  const mockLists = [
    { id: '1', name: 'Lista A', createdAt: new Date().toISOString() },
    { id: '2', name: 'Lista B', createdAt: new Date().toISOString() },
  ];

  beforeEach(async () => {
    listsApi = jasmine.createSpyObj('ListsApiService', ['getLists', 'deleteList']);
    listsApi.getLists.and.returnValue(of(mockLists));

    await TestBed.configureTestingModule({
      imports: [ListOverviewComponent, TranslateModule.forRoot()],
      providers: [
        provideAnimationsAsync(),
        { provide: ListsApiService, useValue: listsApi },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['success', 'error']) },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
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

  it('should show empty state when no lists', fakeAsync(async () => {
    listsApi.getLists.and.returnValue(of([]));
    fixture = (await TestBed.configureTestingModule({
      imports: [ListOverviewComponent, TranslateModule.forRoot()],
      providers: [
        provideAnimationsAsync(),
        { provide: ListsApiService, useValue: listsApi },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['success', 'error']) },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
      ],
    }).compileComponents()).createComponent(ListOverviewComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(fixture.componentInstance.lists().length).toBe(0);
  }));
});
