import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { ProductsApiService } from '../../../core/services/api/products-api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'PRODUCTS.ADD' | translate }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" id="addProductForm" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'PRODUCTS.URL_LABEL' | translate }}</mat-label>
          <input matInput formControlName="url" placeholder="https://...">
          <mat-hint>{{ 'PRODUCTS.SOURCE' | translate }}: Mercado Livre, Kabum</mat-hint>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'PRODUCTS.TARGET_PRICE' | translate }} ({{ 'PRODUCTS.NO_TARGET' | translate }})</mat-label>
          <input matInput type="number" formControlName="targetPrice" min="0" step="0.01">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-flat-button class="btn-primary" form="addProductForm" type="submit"
              [disabled]="form.invalid || loading()">
        @if (loading()) { <mat-spinner diameter="18" /> } @else { {{ 'PRODUCTS.ADD' | translate }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; margin-bottom: 8px; } .btn-primary { background-color: var(--pw-yellow); color: #333; }`],
})
export class AddProductDialogComponent {
  protected readonly ref = inject(MatDialogRef) as import('@angular/material/dialog').MatDialogRef<AddProductDialogComponent, boolean>;
  private readonly data = inject<{ listId: string }>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly productsApi = inject(ProductsApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  form = this.fb.group({
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    targetPrice: [null as number | null],
  });

  loading = signal(false);

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const req = {
      url: this.form.value.url!,
      targetPrice: this.form.value.targetPrice ?? 0,
    };
    this.productsApi.addProduct(this.data.listId, req)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.ref.close(true),
        error: (err: HttpErrorResponse) => this.toast.error(err.error?.message ?? this.translate.instant('COMMON.ERROR_GENERIC')),
      });
  }
}
