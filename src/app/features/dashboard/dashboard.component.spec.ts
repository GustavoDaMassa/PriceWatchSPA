import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ListsApiService } from '../../core/services/api/lists-api.service';
import { NotificationPollingService } from '../../core/services/notification-polling.service';
import { signal } from '@angular/core';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let listsApi: jasmine.SpyObj<ListsApiService>;

  const mockLists = [
    { id: '1', name: 'Lista A', createdAt: new Date().toISOString() },
  ];

  beforeEach(async () => {
    listsApi = jasmine.createSpyObj('ListsApiService', ['getLists']);
    listsApi.getLists.and.returnValue(of(mockLists));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, TranslateModule.forRoot()],
      providers: [
        provideAnimationsAsync(),
        { provide: ListsApiService, useValue: listsApi },
        { provide: NotificationPollingService, useValue: { unreadCount: signal(2) } },
        RouterLink,
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
