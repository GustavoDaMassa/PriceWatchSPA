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
    <div class="pw-auth-page">
      <div class="pw-auth-card">
        <div class="pw-auth-header">
          <span class="pw-auth-brand">PriceWatch</span>
        </div>

        <div class="pw-auth-body">
          <h1 class="pw-auth-title">{{ 'AUTH.REGISTER.TITLE' | translate }}</h1>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="pw-field">
              <label class="pw-label">{{ 'AUTH.REGISTER.NAME' | translate }}</label>
              <input class="pw-input" type="text" formControlName="name"
                     autocomplete="name">
            </div>

            <div class="pw-field">
              <label class="pw-label">{{ 'AUTH.REGISTER.EMAIL' | translate }}</label>
              <input class="pw-input" type="email" formControlName="email"
                     placeholder="seu@email.com" autocomplete="email">
            </div>

            <div class="pw-field">
              <label class="pw-label">{{ 'AUTH.REGISTER.PASSWORD' | translate }}</label>
              <input class="pw-input" type="password" formControlName="password"
                     placeholder="••••••••" autocomplete="new-password">
            </div>

            <button type="submit" class="pw-btn-submit" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="18" style="--mdc-circular-progress-active-indicator-color: #1a1a2e" />
              } @else {
                {{ 'AUTH.REGISTER.SUBMIT' | translate }}
              }
            </button>
          </form>

          <div class="pw-divider"><span>ou</span></div>

          <a routerLink="/auth/login" class="pw-btn-secondary">
            {{ 'AUTH.REGISTER.LOGIN_LINK' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pw-auth-page {
      min-height: 100vh;
      background: #1a1a2e;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }

    .pw-auth-card {
      width: 100%;
      max-width: 360px;
      background: #16213e;
      border-radius: 8px;
      border: 1px solid #0f3460;
      overflow: hidden;
    }

    .pw-auth-header {
      padding: 14px 20px;
      border-bottom: 1px solid #0f3460;
    }

    .pw-auth-brand {
      font-size: 16px;
      font-weight: 700;
      color: #4fc3f7;
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
      background: #0f3460;
      border: 1px solid #1a4a80;
      border-radius: 6px;
      color: #e0e0e0;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      font-family: inherit;
      transition: border-color 0.15s;

      &::placeholder { color: #555; }
      &:focus { border-color: #4fc3f7; }
      &.ng-invalid.ng-touched { border-color: #ef5350; }
    }

    .pw-btn-submit {
      width: 100%;
      padding: 9px;
      background: #4fc3f7;
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

      &:hover:not(:disabled) { background: #81d4fa; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .pw-divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 18px 0 14px;
      color: #555;
      font-size: 12px;

      &::before, &::after { content: ''; flex: 1; height: 1px; background: #1e3a5f; }
    }

    .pw-btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 9px;
      background: transparent;
      border: 1px solid #4fc3f7;
      border-radius: 6px;
      color: #4fc3f7;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.15s;

      &:hover { background: #0f3460; }
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
