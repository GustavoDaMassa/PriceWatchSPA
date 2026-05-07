import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
    MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'PRODUCTS.ADD' | translate }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" id="addProductForm" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'PRODUCTS.URL_LABEL' | translate }}</mat-label>
          <input matInput formControlName="url" placeholder="https://...">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'PRODUCTS.SOURCE_LABEL' | translate }}</mat-label>
          <mat-select formControlName="source">
            <mat-option [value]="0">Mercado Livre</mat-option>
            <mat-option [value]="1">Kabum</mat-option>
            <mat-option [value]="2">Manual</mat-option>
          </mat-select>
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
  styles: [`.full-width { width: 100%; } .btn-primary { background-color: var(--pw-yellow); color: #333; }`],
})
export class AddProductDialogComponent {
  protected readonly ref = inject(MatDialogRef) as MatDialogRef<AddProductDialogComponent, boolean>;
  private readonly data = inject<{ listId: string }>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly productsApi = inject(ProductsApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  form = this.fb.group({
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    source: [0, Validators.required],
  });

  loading = signal(false);

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.productsApi.addProduct(this.data.listId, {
      url: this.form.value.url!,
      source: this.form.value.source as 0 | 1 | 2,
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => this.ref.close(true),
      error: (err: HttpErrorResponse) => this.toast.error(err.error?.message ?? this.translate.instant('COMMON.ERROR_GENERIC')),
    });
  }
}
