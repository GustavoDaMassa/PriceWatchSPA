import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { ListsApiService } from '../../../core/services/api/lists-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductList } from '../../../shared/models/product-list.model';

@Component({
  selector: 'app-list-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ (list ? 'LISTS.EDIT' : 'LISTS.NEW') | translate }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" id="listForm" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'LISTS.NAME_LABEL' | translate }}</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'LISTS.DESC_LABEL' | translate }}</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-flat-button class="btn-primary" form="listForm" type="submit"
              [disabled]="form.invalid || loading()">
        @if (loading()) { <mat-spinner diameter="18" /> } @else { {{ 'COMMON.SAVE' | translate }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; } .btn-primary { background-color: var(--pw-yellow); color: #333; }`],
})
export class ListFormDialogComponent implements OnInit {
  protected readonly ref = inject(MatDialogRef) as MatDialogRef<ListFormDialogComponent, boolean>;
  protected readonly list = inject<ProductList | null>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly listsApi = inject(ListsApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  loading = signal(false);

  ngOnInit(): void {
    if (this.list) {
      this.form.patchValue({ name: this.list.name, description: this.list.description ?? '' });
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    const req = { name: this.form.value.name!, description: this.form.value.description || undefined };
    this.loading.set(true);
    const call$: import('rxjs').Observable<unknown> = this.list
      ? this.listsApi.updateList(this.list.id, req)
      : this.listsApi.createList(req);
    call$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => this.ref.close(true),
      error: (err: HttpErrorResponse) => this.toast.error(err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
    });
  }
}
