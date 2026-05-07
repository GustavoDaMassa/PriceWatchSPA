import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NotificationsComponent } from './notifications.component';
import { NotificationsApiService } from '../../core/services/api/notifications-api.service';
import { NotificationPollingService } from '../../core/services/notification-polling.service';

describe('NotificationsComponent', () => {
  let fixture: ComponentFixture<NotificationsComponent>;
  let notifApi: jasmine.SpyObj<NotificationsApiService>;

  const mockNotifications = [
    { id: 'N1', productId: 'P1', productName: 'Prod A', type: 0 as const,
      message: 'Preço atingiu o alvo', isRead: false, createdAt: new Date().toISOString() },
    { id: 'N2', productId: 'P2', productName: 'Prod B', type: 1 as const,
      message: 'Novo mínimo', isRead: true, createdAt: new Date().toISOString() },
  ];

  beforeEach(async () => {
    notifApi = jasmine.createSpyObj('NotificationsApiService', ['getNotifications', 'markAsRead', 'markAllAsRead']);
    notifApi.getNotifications.and.returnValue(of(mockNotifications));

    await TestBed.configureTestingModule({
      imports: [NotificationsComponent, TranslateModule.forRoot()],
      providers: [
        provideAnimationsAsync(),
        { provide: NotificationsApiService, useValue: notifApi },
        { provide: NotificationPollingService, useValue: { unreadCount: { set: () => {} } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    fixture.detectChanges();
  });

  it('should load notifications on init', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(notifApi.getNotifications).toHaveBeenCalled();
    expect(fixture.componentInstance.notifications().length).toBe(2);
  }));

  it('should filter unread notifications', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    fixture.componentInstance.filterUnread.set(true);
    const unread = fixture.componentInstance.filtered();
    expect(unread.every(n => !n.isRead)).toBeTrue();
  }));
});
