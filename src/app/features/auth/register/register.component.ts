import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthApiService } from '../../../core/services/api/auth-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { RegisterRequest } from '../../../shared/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="ml-auth-page">
      <div class="ml-auth-header">
        <span class="ml-auth-brand">PriceWatch</span>
      </div>

      <div class="ml-auth-card">
        <h1 class="ml-auth-title">{{ 'AUTH.REGISTER.TITLE' | translate }}</h1>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="ml-field">
            <label class="ml-label">{{ 'AUTH.REGISTER.NAME' | translate }}</label>
            <input class="ml-input" type="text" formControlName="name"
                   autocomplete="name">
          </div>

          <div class="ml-field">
            <label class="ml-label">{{ 'AUTH.REGISTER.EMAIL' | translate }}</label>
            <input class="ml-input" type="email" formControlName="email"
                   autocomplete="email">
          </div>

          <div class="ml-field">
            <label class="ml-label">{{ 'AUTH.REGISTER.PASSWORD' | translate }}</label>
            <input class="ml-input" type="password" formControlName="password"
                   autocomplete="new-password">
          </div>

          <button type="submit" class="ml-btn-submit" [disabled]="form.invalid || loading()">
            @if (loading()) { <mat-spinner diameter="20" /> }
            @else { {{ 'AUTH.REGISTER.SUBMIT' | translate }} }
          </button>
        </form>

        <div class="ml-divider"><span>ou</span></div>

        <a routerLink="/auth/login" class="ml-btn-secondary">
          {{ 'AUTH.REGISTER.LOGIN_LINK' | translate }}
        </a>
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
      padding: 32px 40px 40px;
      width: 100%;
      max-width: 420px;
      margin-top: 24px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.12);
    }

    .ml-auth-title {
      font-size: 22px;
      font-weight: 600;
      color: #333;
      margin: 0 0 24px;
    }

    .ml-field { margin-bottom: 16px; }

    .ml-label {
      display: block;
      font-size: 14px;
      color: #333;
      margin-bottom: 6px;
    }

    .ml-input {
      width: 100%;
      height: 48px;
      padding: 0 14px;
      border: 1px solid #999;
      border-radius: 6px;
      font-size: 16px;
      outline: none;
      box-sizing: border-box;
      font-family: inherit;
      color: #333;
      transition: border 0.15s;

      &:focus { border: 2px solid #3483FA; padding: 0 13px; }
      &.ng-invalid.ng-touched { border-color: #F23D4F; }
    }

    .ml-btn-submit {
      width: 100%;
      height: 48px;
      background: #FFE600;
      color: #333;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover:not(:disabled) { background: #f0d800; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .ml-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 28px 0 16px;
      color: #999;
      font-size: 14px;

      &::before, &::after { content: ''; flex: 1; height: 1px; background: #e0e0e0; }
    }

    .ml-btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 48px;
      border: 1px solid #3483FA;
      border-radius: 6px;
      color: #3483FA;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;

      &:hover { background: #EAF0FB; }
    }
  `],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = signal(false);

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const req: RegisterRequest = { ...this.form.value as RegisterRequest, locale: this.translate.currentLang };
    this.authApi.register(req).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('AUTH.REGISTER.SUBMIT'));
        this.router.navigate(['/auth/login']);
      },
      error: (err: HttpErrorResponse) =>
        this.toast.error(err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
    });
  }
}
