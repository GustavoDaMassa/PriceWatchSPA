import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationsApiService } from '../../core/services/api/notifications-api.service';
import { NotificationPollingService } from '../../core/services/notification-polling.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import { AppNotification } from '../../shared/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatDividerModule,
    TranslateModule, EmptyStateComponent, RelativeDatePipe,
  ],
  template: `
    <div class="page-header">
      <h1>{{ 'NOTIFICATIONS.TITLE' | translate }}</h1>
      <div class="header-actions">
        <button mat-stroked-button (click)="filterUnread.set(!filterUnread())">
          {{ (filterUnread() ? 'NOTIFICATIONS.FILTER_ALL' : 'NOTIFICATIONS.FILTER_UNREAD') | translate }}
        </button>
        @if (hasUnread()) {
          <button mat-flat-button class="btn-primary" (click)="markAll()">
            {{ 'NOTIFICATIONS.MARK_ALL_READ' | translate }}
          </button>
        }
      </div>
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (filtered().length === 0) {
      <app-empty-state [message]="'NOTIFICATIONS.EMPTY' | translate" icon="notifications_none" />
    } @else {
      <div class="notif-list">
        @for (n of filtered(); track n.id) {
          <div class="notif-item" [class.unread]="!n.isRead">
            <div class="notif-icon">
              <mat-icon [class]="n.type === 0 ? 'icon-target' : 'icon-low'">
                {{ n.type === 0 ? 'flag' : 'trending_down' }}
              </mat-icon>
            </div>
            <div class="notif-body">
              <p class="notif-product">{{ n.productName }}</p>
              <p class="notif-message">{{ n.message }}</p>
              <span class="notif-date">{{ n.createdAt | relativeDate }}</span>
            </div>
            @if (!n.isRead) {
              <button mat-icon-button (click)="markRead(n)" [title]="'NOTIFICATIONS.MARK_READ' | translate">
                <mat-icon>check_circle_outline</mat-icon>
              </button>
            }
          </div>
          <mat-divider />
        }
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { margin: 0; }
    .header-actions { display: flex; gap: 8px; }
    .btn-primary { background-color: var(--pw-yellow); color: #333; font-weight: 600; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .notif-list { background: var(--pw-surface); border-radius: 8px; overflow: hidden; }
    .notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 16px; transition: background 0.2s; }
    .notif-item.unread { background-color: rgba(255, 230, 0, 0.06); }
    .notif-icon { padding-top: 2px; }
    .icon-target { color: var(--pw-success); }
    .icon-low { color: #3b82f6; }
    .notif-body { flex: 1; }
    .notif-product { margin: 0; font-weight: 600; font-size: 0.9rem; }
    .notif-message { margin: 4px 0; font-size: 0.85rem; color: var(--pw-text-secondary); }
    .notif-date { font-size: 0.78rem; color: var(--pw-text-secondary); }
  `],
})
export class NotificationsComponent implements OnInit {
  private readonly notifApi = inject(NotificationsApiService);
  private readonly polling = inject(NotificationPollingService);

  notifications = signal<AppNotification[]>([]);
  filterUnread = signal(false);
  loading = signal(false);

  filtered = computed(() =>
    this.filterUnread() ? this.notifications().filter(n => !n.isRead) : this.notifications()
  );
  hasUnread = computed(() => this.notifications().some(n => !n.isRead));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.notifApi.getNotifications().subscribe({
      next: data => { this.notifications.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  markRead(n: AppNotification): void {
    this.notifApi.markAsRead(n.id).subscribe(() => {
      this.notifications.update(list => list.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      this.polling.unreadCount.update(c => Math.max(0, c - 1));
    });
  }

  markAll(): void {
    this.notifApi.markAllAsRead().subscribe(() => {
      this.notifications.update(list => list.map(x => ({ ...x, isRead: true })));
      this.polling.unreadCount.set(0);
    });
  }
}
