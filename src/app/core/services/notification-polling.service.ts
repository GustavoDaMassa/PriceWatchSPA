import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, of, startWith, Subscription, switchMap } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AppNotification } from '../../shared/models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationPollingService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  unreadCount = signal<number>(0);

  private subscription?: Subscription;

  start(): void {
    if (this.subscription) return;
    this.subscription = interval(environment.pollIntervalMs).pipe(
      startWith(0),
      filter(() => this.auth.isAuthenticated()),
      switchMap(() =>
        this.http
          .get<AppNotification[]>(`${environment.apiUrl}/notifications?isRead=false`)
          .pipe(catchError(() => of([])))
      )
    ).subscribe(notifications => this.unreadCount.set(notifications.length));
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.unreadCount.set(0);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
