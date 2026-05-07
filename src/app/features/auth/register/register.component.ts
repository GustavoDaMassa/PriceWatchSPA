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
import { ToastService } from '../../../core/services/toast.service';
import { RegisterRequest } from '../../../shared/models/auth.model';

@Component({
  selector: 'app-register',
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
        <h1 class="auth-title">{{ 'AUTH.REGISTER.TITLE' | translate }}</h1>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'AUTH.REGISTER.NAME' | translate }}</mat-label>
            <input matInput formControlName="name" autocomplete="name">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'AUTH.REGISTER.EMAIL' | translate }}</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'AUTH.REGISTER.PASSWORD' | translate }}</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="new-password">
          </mat-form-field>

          <button mat-flat-button type="submit" class="submit-btn"
                  [disabled]="form.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="20" />
            } @else {
              {{ 'AUTH.REGISTER.SUBMIT' | translate }}
            }
          </button>
        </form>

        <p class="auth-link">
          {{ 'AUTH.REGISTER.HAS_ACCOUNT' | translate }}
          <a routerLink="/auth/login">{{ 'AUTH.REGISTER.LOGIN_LINK' | translate }}</a>
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
    this.authApi.register(this.form.value as RegisterRequest).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('AUTH.REGISTER.SUBMIT'));
        this.router.navigate(['/auth/login']);
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.message ?? this.translate.instant('COMMON.ERROR_GENERIC');
        this.toast.error(msg);
      },
    });
  }
}
