import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthApiService } from '../../../core/services/api/auth-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoginRequest } from '../../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="pw-auth-page">
      <div class="pw-auth-card">
        <div class="pw-auth-header">
          <span class="pw-auth-brand">PriceWatch</span>
        </div>

        <div class="pw-auth-body">
          <h1 class="pw-auth-title">{{ 'AUTH.LOGIN.TITLE' | translate }}</h1>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="pw-field">
              <label class="pw-label">{{ 'AUTH.LOGIN.EMAIL' | translate }}</label>
              <input class="pw-input" type="email" formControlName="email"
                     placeholder="seu@email.com" autocomplete="email">
            </div>

            <div class="pw-field">
              <label class="pw-label">{{ 'AUTH.LOGIN.PASSWORD' | translate }}</label>
              <input class="pw-input" type="password" formControlName="password"
                     placeholder="••••••••" autocomplete="current-password">
            </div>

            <button type="submit" class="pw-btn-submit" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="18" style="--mdc-circular-progress-active-indicator-color: #111100" />
              } @else {
                {{ 'AUTH.LOGIN.SUBMIT' | translate }}
              }
            </button>
          </form>

          <div class="pw-divider"><span>ou</span></div>

          <a routerLink="/auth/register" class="pw-btn-secondary">
            {{ 'AUTH.LOGIN.REGISTER_LINK' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pw-auth-page {
      min-height: 100vh;
      background: #111100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }

    .pw-auth-card {
      width: 100%;
      max-width: 360px;
      background: #1a1800;
      border-radius: 8px;
      border: 1px solid #252000;
      overflow: hidden;
    }

    .pw-auth-header {
      padding: 14px 20px;
      border-bottom: 1px solid #252000;
    }

    .pw-auth-brand {
      font-size: 16px;
      font-weight: 700;
      color: #ffd700;
      letter-spacing: 0.5px;
    }

    .pw-auth-body { padding: 20px; }

    .pw-auth-title {
      font-size: 15px;
      font-weight: 600;
      color: #e0e0e0;
      margin: 0 0 18px;
    }

    .pw-field { margin-bottom: 14px; }

    .pw-label {
      display: block;
      font-size: 12px;
      color: #aaa;
      margin-bottom: 4px;
    }

    .pw-input {
      width: 100%;
      padding: 8px 10px;
      background: #252000;
      border: 1px solid #3d3500;
      border-radius: 6px;
      color: #e0e0e0;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      font-family: inherit;
      transition: border-color 0.15s;

      &::placeholder { color: #555; }
      &:focus { border-color: #ffd700; }
      &.ng-invalid.ng-touched { border-color: #ef5350; }
    }

    .pw-btn-submit {
      width: 100%;
      padding: 9px;
      background: #ffd700;
      color: #000;
      font-weight: 600;
      font-size: 14px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 6px;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;

      &:hover:not(:disabled) { background: #ffee58; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .pw-divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 18px 0 14px;
      color: #555;
      font-size: 12px;

      &::before, &::after { content: ''; flex: 1; height: 1px; background: #2d2800; }
    }

    .pw-btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 9px;
      background: transparent;
      border: 1px solid #ffd700;
      border-radius: 6px;
      color: #ffd700;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.15s;

      &:hover { background: #252000; }
    }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = signal(false);

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.authApi.login(this.form.value as LoginRequest).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: res => {
        this.auth.login(res);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) =>
        this.toast.error(err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
    });
  }
}
