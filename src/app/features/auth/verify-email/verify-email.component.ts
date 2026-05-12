import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthApiService } from '../../../core/services/api/auth-api.service';
import { AuthService } from '../../../core/services/auth.service';

type VerifyStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="ml-auth-page">
      <div class="ml-auth-header">
        <span class="ml-auth-brand">PriceWatch</span>
      </div>

      <div class="ml-auth-card">
        @switch (status()) {
          @case ('loading') {
            <mat-spinner diameter="48" />
            <p class="ml-status-text">{{ 'APP.LOADING' | translate }}</p>
          }
          @case ('success') {
            <div class="ml-status-icon success">✓</div>
            <h2 class="ml-auth-title">{{ 'AUTH.VERIFY_EMAIL.TITLE' | translate }}</h2>
            <p class="ml-status-text">{{ 'AUTH.VERIFY_EMAIL.SUCCESS' | translate }}</p>
            <a routerLink="/auth/login" class="ml-btn-primary">
              {{ 'AUTH.LOGIN.SUBMIT' | translate }}
            </a>
          }
          @case ('error') {
            <div class="ml-status-icon error">✕</div>
            <h2 class="ml-auth-title">{{ 'AUTH.VERIFY_EMAIL.TITLE' | translate }}</h2>
            <p class="ml-status-text">{{ 'AUTH.VERIFY_EMAIL.ERROR' | translate }}</p>
            <a routerLink="/auth/login" class="ml-btn-secondary">
              {{ 'COMMON.BACK' | translate }}
            </a>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .ml-auth-page {
      min-height: 100vh;
      background: #EBEBEB;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .ml-auth-header {
      width: 100%;
      background: #FFE600;
      padding: 16px 24px;
      display: flex;
      justify-content: center;
    }

    .ml-auth-brand { font-size: 28px; font-weight: 700; color: #333; letter-spacing: -0.5px; }

    .ml-auth-card {
      background: white;
      border-radius: 6px;
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
      margin-top: 24px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
    }

    .ml-auth-title { margin: 0; font-size: 22px; font-weight: 600; color: #333; }

    .ml-status-icon {
      width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; font-weight: 700;
      &.success { background: #e8f5e9; color: #00A650; }
      &.error   { background: #fdecea; color: #F23D4F; }
    }

    .ml-status-text { margin: 0; font-size: 15px; color: #555; line-height: 1.5; }

    .ml-btn-primary {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 48px;
      background: #FFE600; color: #333; border: none; border-radius: 6px;
      font-size: 16px; font-weight: 600; text-decoration: none; cursor: pointer;
      &:hover { background: #f0d800; }
    }

    .ml-btn-secondary {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 48px;
      border: 1px solid #3483FA; border-radius: 6px;
      color: #3483FA; font-size: 16px; font-weight: 600; text-decoration: none;
      &:hover { background: #EAF0FB; }
    }
  `],
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);
  private readonly auth = inject(AuthService);

  status = signal<VerifyStatus>('loading');

  ngOnInit(): void {
    this.route.queryParams.pipe(
      take(1),
      switchMap(params => {
        if (!params['email'] || !params['token'])
          throw new Error('missing params');
        return this.authApi.verifyEmail({ email: params['email'], token: params['token'] });
      })
    ).subscribe({
      next: () => { this.auth.markEmailVerified(); this.status.set('success'); },
      error: () => this.status.set('error'),
    });
  }
}
