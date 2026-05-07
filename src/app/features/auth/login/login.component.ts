import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthApiService } from '../../../core/services/api/auth-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoginRequest } from '../../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule,
    TranslateModule,
  ],
  template: `
    <div class="auth-page">
      <div class="auth-card mat-elevation-z4">
        <img src="/logopw.png" class="auth-logo" alt="PriceWatch">
        <h1 class="auth-title">{{ 'AUTH.LOGIN.TITLE' | translate }}</h1>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'AUTH.LOGIN.EMAIL' | translate }}</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'AUTH.LOGIN.PASSWORD' | translate }}</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="current-password">
          </mat-form-field>

          <button mat-flat-button type="submit" class="submit-btn"
                  [disabled]="form.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="20" />
            } @else {
              {{ 'AUTH.LOGIN.SUBMIT' | translate }}
            }
          </button>
        </form>

        <p class="auth-link">
          {{ 'AUTH.LOGIN.NO_ACCOUNT' | translate }}
          <a routerLink="/auth/register">{{ 'AUTH.LOGIN.REGISTER_LINK' | translate }}</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--pw-bg);
      padding: 16px;
    }
    .auth-card {
      background: var(--pw-surface);
      border-radius: 8px;
      padding: 40px 32px;
      width: 100%;
      max-width: 400px;
    }
    .auth-logo { display: block; margin: 0 auto 16px; height: 72px; }
    .auth-title { text-align: center; margin: 0 0 24px; font-size: 1.5rem; font-weight: 700; }
    .full-width { width: 100%; }
    .submit-btn {
      width: 100%;
      margin-top: 8px;
      background-color: var(--pw-yellow);
      color: #333;
      height: 44px;
      font-weight: 600;
    }
    .auth-link { text-align: center; margin-top: 16px; font-size: 0.9rem; }
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
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC');
        this.toast.error(msg);
      },
    });
  }
}
