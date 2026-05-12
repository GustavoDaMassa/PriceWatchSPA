import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ListsApiService } from '../../../core/services/api/lists-api.service';
import { ProductsApiService } from '../../../core/services/api/products-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductList } from '../../../shared/models/product-list.model';

@Component({
  selector: 'app-assign-to-list-dialog',
  standalone: true,
  imports: [
    FormsModule, MatDialogModule, MatFormFieldModule,
    MatSelectModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'PRODUCTS.ASSIGN_TO_LIST' | translate }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'LISTS.TITLE' | translate }}</mat-label>
        <mat-select [(ngModel)]="selectedListId">
          @for (list of lists(); track list.id) {
            <mat-option [value]="list.id">{{ list.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-flat-button class="btn-primary" (click)="confirm()"
              [disabled]="!selectedListId || saving()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { {{ 'COMMON.SAVE' | translate }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; margin-top: 8px; } .btn-primary { background-color: var(--pw-yellow); color: #333; }`],
})
export class AssignToListDialogComponent implements OnInit {
  protected readonly ref = inject(MatDialogRef) as MatDialogRef<AssignToListDialogComponent, boolean>;
  readonly data = inject<{ productIds: string[] }>(MAT_DIALOG_DATA);
  private readonly listsApi = inject(ListsApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  lists = signal<ProductList[]>([]);
  selectedListId: string | null = null;
  saving = signal(false);

  ngOnInit(): void {
    this.listsApi.getLists().subscribe(lists => this.lists.set(lists));
  }

  confirm(): void {
    if (!this.selectedListId || this.saving()) return;
    this.saving.set(true);
    forkJoin(this.data.productIds.map(id => this.productsApi.assignToList(id, this.selectedListId)))
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.ref.close(true),
        error: (err: HttpErrorResponse) =>
          this.toast.error(err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
      });
  }
}
