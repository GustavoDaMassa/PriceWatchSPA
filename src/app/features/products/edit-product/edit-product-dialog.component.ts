import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { ProductsApiService } from '../../../core/services/api/products-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { TrackedProduct } from '../../../shared/models/tracked-product.model';

@Component({
  selector: 'app-edit-product-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSlideToggleModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.product.name }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" id="editProductForm" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'PRODUCTS.TARGET_PRICE' | translate }}</mat-label>
          <input matInput type="number" formControlName="targetPrice" min="0" step="0.01">
        </mat-form-field>
        <mat-slide-toggle formControlName="isActive" color="primary">
          {{ (form.value.isActive ? 'PRODUCTS.STATUS_ACTIVE' : 'PRODUCTS.STATUS_PAUSED') | translate }}
        </mat-slide-toggle>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-flat-button class="btn-primary" form="editProductForm" type="submit"
              [disabled]="form.invalid || loading()">
        @if (loading()) { <mat-spinner diameter="18" /> } @else { {{ 'COMMON.SAVE' | translate }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; } .btn-primary { background-color: var(--pw-yellow); color: #333; }`],
})
export class EditProductDialogComponent implements OnInit {
  protected readonly ref = inject(MatDialogRef) as MatDialogRef<EditProductDialogComponent, boolean>;
  protected readonly data = inject<{ product: TrackedProduct }>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly productsApi = inject(ProductsApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  form = this.fb.group({
    targetPrice: [<number | null>null, [Validators.min(0)]],
    isActive: [true],
  });

  loading = signal(false);

  ngOnInit(): void {
    this.form.patchValue({ targetPrice: this.data.product.targetPrice, isActive: this.data.product.isActive });
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.productsApi.updateProduct(this.data.product.id, {
      targetPrice: this.form.value.targetPrice ?? undefined,
      isActive: this.form.value.isActive ?? undefined,
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => this.ref.close(true),
      error: (err: HttpErrorResponse) => this.toast.error(err.error?.message ?? this.translate.instant('COMMON.ERROR_GENERIC')),
    });
  }
}
