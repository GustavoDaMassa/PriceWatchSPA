import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AppNotification } from '../../../shared/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/notifications`;

  getNotifications(isRead?: boolean): Observable<AppNotification[]> {
    const params = isRead !== undefined
      ? new HttpParams().set('isRead', String(isRead))
      : undefined;
    return this.http.get<AppNotification[]>(this.base, { params });
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.base}/read-all`, {});
  }
}
