import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UsersApiService } from '../../../core/services/api/users-api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-change-email',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule, TranslateModule],
  template: `
    <div class="page-header">
      <button mat-icon-button routerLink="/profile"><mat-icon>arrow_back</mat-icon></button>
      <h1>{{ 'PROFILE.CHANGE_EMAIL' | translate }}</h1>
    </div>
    <mat-card class="form-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'PROFILE.NEW_EMAIL' | translate }}</mat-label>
            <input matInput type="email" formControlName="newEmail">
          </mat-form-field>
          <button mat-flat-button type="submit" class="btn-primary" [disabled]="form.invalid || loading()">
            @if (loading()) { <mat-spinner diameter="18" /> } @else { {{ 'COMMON.SAVE' | translate }} }
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.page-header{display:flex;align-items:center;gap:12px;margin-bottom:24px;} .page-header h1{margin:0;} .form-card{background:var(--pw-surface);max-width:480px;} .full-width{width:100%;margin-bottom:8px;} .btn-primary{background-color:var(--pw-yellow);color:#333;}`],
})
export class ChangeEmailComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersApi = inject(UsersApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  form = this.fb.group({ newEmail: ['', [Validators.required, Validators.email]] });
  loading = signal(false);

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.usersApi.changeEmail({ newEmail: this.form.value.newEmail! })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => { this.toast.success(this.translate.instant('PROFILE.CHANGE_EMAIL')); this.router.navigate(['/profile']); },
        error: (err: HttpErrorResponse) => this.toast.error(err.error?.message ?? this.translate.instant('COMMON.ERROR_GENERIC')),
      });
  }
}
