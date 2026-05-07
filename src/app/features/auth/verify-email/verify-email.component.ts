import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { AuthApiService } from '../../../core/services/api/auth-api.service';

type VerifyStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule, MatIconModule, TranslateModule],
  template: `
    <div class="verify-page">
      <div class="verify-card mat-elevation-z4">
        <img src="/logopw.png" class="auth-logo" alt="PriceWatch">

        @switch (status()) {
          @case ('loading') {
            <mat-spinner diameter="48" />
            <p>{{ 'APP.LOADING' | translate }}</p>
          }
          @case ('success') {
            <mat-icon class="icon-success">check_circle</mat-icon>
            <h2>{{ 'AUTH.VERIFY_EMAIL.TITLE' | translate }}</h2>
            <p>{{ 'AUTH.VERIFY_EMAIL.SUCCESS' | translate }}</p>
            <a mat-flat-button routerLink="/auth/login" class="action-btn">
              {{ 'AUTH.LOGIN.SUBMIT' | translate }}
            </a>
          }
          @case ('error') {
            <mat-icon class="icon-error">error</mat-icon>
            <h2>{{ 'AUTH.VERIFY_EMAIL.TITLE' | translate }}</h2>
            <p>{{ 'AUTH.VERIFY_EMAIL.ERROR' | translate }}</p>
            <a mat-stroked-button routerLink="/auth/login">
              {{ 'COMMON.BACK' | translate }}
            </a>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .verify-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--pw-bg);
      padding: 16px;
    }
    .verify-card {
      background: var(--pw-surface);
      border-radius: 8px;
      padding: 48px 32px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .auth-logo { height: 72px; }
    .icon-success { font-size: 56px; width: 56px; height: 56px; color: var(--pw-success); }
    .icon-error { font-size: 56px; width: 56px; height: 56px; color: var(--pw-error); }
    .action-btn { background-color: var(--pw-yellow); color: #333; font-weight: 600; }
  `],
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);

  status = signal<VerifyStatus>('loading');

  ngOnInit(): void {
    this.route.queryParams.pipe(
      switchMap(params => this.authApi.verifyEmail({ email: params['email'], token: params['token'] }))
    ).subscribe({
      next: () => this.status.set('success'),
      error: () => this.status.set('error'),
    });
  }
}
