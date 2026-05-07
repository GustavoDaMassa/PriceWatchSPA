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
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UsersApiService } from '../../../core/services/api/users-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule, TranslateModule],
  template: `
    <div class="page-header">
      <button mat-icon-button routerLink="/profile"><mat-icon>arrow_back</mat-icon></button>
      <h1>{{ 'PROFILE.DELETE_ACCOUNT' | translate }}</h1>
    </div>
    <mat-card class="form-card danger-card">
      <mat-card-content>
        <p class="warning-text">{{ 'PROFILE.CONFIRM_DELETE_MSG' | translate }}</p>
        <form [formGroup]="form" (ngSubmit)="confirm()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'PROFILE.PASSWORD_CONFIRM' | translate }}</mat-label>
            <input matInput type="password" formControlName="password">
          </mat-form-field>
          <button mat-flat-button type="submit" color="warn" [disabled]="form.invalid || loading()">
            @if (loading()) { <mat-spinner diameter="18" /> } @else { {{ 'PROFILE.DELETE_ACCOUNT' | translate }} }
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.page-header{display:flex;align-items:center;gap:12px;margin-bottom:24px;} .page-header h1{margin:0;} .form-card{background:var(--pw-surface);max-width:480px;} .danger-card{border:1px solid var(--pw-error);} .full-width{width:100%;margin-bottom:8px;} .warning-text{color:var(--pw-error);}`],
})
export class DeleteAccountComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersApi = inject(UsersApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  form = this.fb.group({ password: ['', Validators.required] });
  loading = signal(false);

  confirm(): void {
    if (this.form.invalid) return;
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: this.translate.instant('PROFILE.CONFIRM_DELETE'), message: this.translate.instant('PROFILE.CONFIRM_DELETE_MSG') },
    }).afterClosed().subscribe(ok => { if (ok) this.deleteAccount(); });
  }

  private deleteAccount(): void {
    this.loading.set(true);
    this.usersApi.deleteAccount({ password: this.form.value.password! })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => { this.auth.logout(); this.router.navigate(['/auth/login']); },
        error: (err: HttpErrorResponse) => this.toast.error(err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
      });
  }
}
