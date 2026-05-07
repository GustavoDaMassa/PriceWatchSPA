import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UsersApiService } from '../../../core/services/api/users-api.service';
import { AuthApiService } from '../../../core/services/api/auth-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserProfile } from '../../../shared/models/user.model';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule,
    TranslateModule,
  ],
  template: `
    <h1>{{ 'PROFILE.TITLE' | translate }}</h1>

    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (profile(); as p) {
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="avatar-icon">account_circle</mat-icon>
          <mat-card-title>{{ p.name }}</mat-card-title>
          <mat-card-subtitle>{{ p.email }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="verification-row">
            @if (p.isEmailVerified) {
              <mat-chip color="primary"><mat-icon>verified</mat-icon> {{ 'PROFILE.EMAIL_VERIFIED' | translate }}</mat-chip>
            } @else {
              <mat-chip color="warn"><mat-icon>warning</mat-icon> {{ 'PROFILE.EMAIL_NOT_VERIFIED' | translate }}</mat-chip>
              <button mat-stroked-button (click)="resendVerification()">
                {{ 'PROFILE.RESEND_VERIFICATION' | translate }}
              </button>
            }
          </div>
        </mat-card-content>
        <mat-card-actions>
          <a mat-button routerLink="/profile/change-password">
            <mat-icon>lock</mat-icon>{{ 'PROFILE.CHANGE_PASSWORD' | translate }}
          </a>
          <a mat-button routerLink="/profile/change-email">
            <mat-icon>email</mat-icon>{{ 'PROFILE.CHANGE_EMAIL' | translate }}
          </a>
          <a mat-button class="text-danger" routerLink="/profile/delete-account">
            <mat-icon>delete_forever</mat-icon>{{ 'PROFILE.DELETE_ACCOUNT' | translate }}
          </a>
        </mat-card-actions>
      </mat-card>
    }
  `,
  styles: [`
    h1 { margin-bottom: 24px; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .profile-card { background: var(--pw-surface); max-width: 480px; }
    .avatar-icon { font-size: 48px; width: 48px; height: 48px; color: var(--pw-yellow); }
    .verification-row { display: flex; align-items: center; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
    .text-danger { color: var(--pw-error); }
  `],
})
export class ProfileOverviewComponent implements OnInit {
  private readonly usersApi = inject(UsersApiService);
  private readonly authApi = inject(AuthApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  profile = signal<UserProfile | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.usersApi.getProfile().subscribe({
      next: p => { this.profile.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  resendVerification(): void {
    const email = this.profile()?.email;
    if (!email) return;
    this.authApi.resendVerification({ email }).subscribe({
      next: () => this.toast.success(this.translate.instant('PROFILE.RESEND_VERIFICATION')),
      error: () => this.toast.error(this.translate.instant('COMMON.ERROR_GENERIC')),
    });
  }
}
