import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ProductsApiService } from '../../core/services/api/products-api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { TrackedProduct } from '../../shared/models/tracked-product.model';
import { AddProductDialogComponent } from '../products/add-product/add-product-dialog.component';
import { EditProductDialogComponent } from '../products/edit-product/edit-product-dialog.component';
import { AssignToListDialogComponent } from '../products/assign-to-list/assign-to-list-dialog.component';
import { ProductLinkDialogComponent } from '../products/product-link/product-link-dialog.component';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule,
    TranslateModule, EmptyStateComponent, ProductCardComponent,
  ],
  template: `
    <div class="ml-page-header">
      @if (selectionMode()) {
        <div class="ml-bulk-bar">
          <div class="ml-bulk-left">
            <mat-checkbox
              [checked]="allSelected()"
              [indeterminate]="hasSelection() && !allSelected()"
              (change)="$event.checked ? selectAll() : clearSelection()" />
            <span class="ml-bulk-count">{{ selectionCount() }} selecionado(s)</span>
            <button class="ml-icon-btn" (click)="exitSelectionMode()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="ml-bulk-actions">
            <button class="ml-bulk-btn" [disabled]="!hasSelection()" (click)="bulkActivate()">
              <mat-icon>play_arrow</mat-icon> Ativar
            </button>
            <button class="ml-bulk-btn" [disabled]="!hasSelection()" (click)="bulkPause()">
              <mat-icon>pause</mat-icon> Pausar
            </button>
            <button class="ml-bulk-btn" [disabled]="!hasSelection()" (click)="bulkAssignToList()">
              <mat-icon>playlist_add</mat-icon> Adicionar à lista
            </button>
            <button class="ml-bulk-btn danger" [disabled]="!hasSelection()" (click)="bulkDelete()">
              <mat-icon>delete</mat-icon> Excluir
            </button>
          </div>
        </div>
      } @else {
        <div class="ml-header-left">
          @if (searchTerm()) {
            <div class="ml-search-info">
              <span>{{ filteredProducts().length }} resultado(s) para "<strong>{{ searchTerm() }}</strong>"</span>
              <button class="ml-clear-search" (click)="clearSearch()">
                <mat-icon>close</mat-icon> Limpar
              </button>
            </div>
          } @else {
            <h1>{{ 'ITEMS.TITLE' | translate }} <span class="ml-count">{{ filteredProducts().length }}</span></h1>
          }
        </div>
        <div class="ml-header-actions">
          <button class="ml-btn-primary" (click)="openAdd()">
            <mat-icon>add</mat-icon>{{ 'PRODUCTS.ADD' | translate }}
          </button>
          <button class="ml-btn-secondary" (click)="enterSelectionMode()">
            <mat-icon>checklist</mat-icon>{{ 'ITEMS.SELECT' | translate }}
          </button>
        </div>
      }
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (filteredProducts().length === 0) {
      <app-empty-state
        [message]="searchTerm() ? ('ITEMS.NO_RESULTS' | translate) : ('ITEMS.EMPTY' | translate)"
        icon="inventory_2" />
    } @else {
      <div class="ml-grid">
        @for (p of filteredProducts(); track p.id) {
          <app-product-card
            [product]="p"
            [historyRoute]="['/items', p.id, 'history']"
            [selected]="selectedIds().has(p.id)"
            [selectionMode]="selectionMode()"
            [showAssignToList]="!p.listId"
            [showInListBadge]="true"
            (cardClick)="openProductLink(p)"
            (selectionChange)="toggleSelect(p.id)"
            (editClick)="openEdit(p)"
            (assignToListClick)="openAssignToList(p)"
            (toggleActiveClick)="toggleActive(p)"
            (removeClick)="confirmRemove(p)" />
        }
      </div>
    }
  `,
  styles: [`
    .ml-page-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; min-height: 40px;
    }
    .ml-page-header h1 { margin: 0; font-size: 20px; font-weight: 300; color: #333; }
    .ml-count { font-size: 14px; font-weight: 400; color: #999; }
    .ml-header-left { display: flex; align-items: center; }
    .ml-header-actions { display: flex; align-items: center; gap: 8px; }

    .ml-search-info { display: flex; align-items: center; gap: 12px; font-size: 15px; color: #333; }
    .ml-clear-search {
      display: flex; align-items: center; gap: 4px; background: none; border: none;
      color: #3483FA; cursor: pointer; font-size: 13px; padding: 4px 8px; border-radius: 4px;
      font-family: inherit;
      &:hover { background: #EAF0FB; }
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .ml-btn-primary {
      display: flex; align-items: center; gap: 4px;
      background: #FFE600; color: #333; border: none; border-radius: 4px;
      padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
      &:hover { background: #f0d800; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .ml-btn-secondary {
      display: flex; align-items: center; gap: 4px;
      background: white; color: #333; border: 1px solid #ddd; border-radius: 4px;
      padding: 8px 16px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: inherit;
      &:hover { background: #f5f5f5; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .ml-bulk-bar {
      display: flex; align-items: center; justify-content: space-between;
      background: #EAF0FB; border-radius: 4px; padding: 8px 12px;
      width: 100%; gap: 16px; flex-wrap: wrap;
    }
    .ml-bulk-left { display: flex; align-items: center; gap: 8px; }
    .ml-bulk-count { font-size: 14px; color: #333; font-weight: 500; }
    .ml-bulk-actions { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    .ml-bulk-btn {
      display: flex; align-items: center; gap: 4px;
      background: none; border: 1px solid #3483FA; color: #3483FA;
      border-radius: 4px; padding: 5px 10px; font-size: 13px; cursor: pointer; font-family: inherit;
      transition: background 0.15s;
      &:hover:not(:disabled) { background: #3483FA; color: white; }
      &:disabled { opacity: 0.4; cursor: default; }
      &.danger { border-color: #F23D4F; color: #F23D4F; }
      &.danger:hover:not(:disabled) { background: #F23D4F; color: white; }
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .ml-icon-btn {
      background: none; border: none; cursor: pointer; color: #666;
      display: flex; align-items: center; padding: 4px; border-radius: 4px;
      &:hover { background: rgba(0,0,0,0.08); }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .center { display: flex; justify-content: center; padding: 48px; }

    .ml-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 8px;
    }
  `],
})
export class ItemsComponent implements OnInit {
  private readonly productsApi = inject(ProductsApiService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private allProducts = signal<TrackedProduct[]>([]);
  searchTerm = signal('');
  loading = signal(false);
  selectionMode = signal(false);
  selectedIds = signal<Set<string>>(new Set());

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.allProducts();
    return this.allProducts().filter(p => p.name.toLowerCase().includes(term));
  });

  hasSelection = computed(() => this.selectedIds().size > 0);
  selectionCount = computed(() => this.selectedIds().size);
  allSelected = computed(() =>
    this.filteredProducts().length > 0 &&
    this.filteredProducts().every(p => this.selectedIds().has(p.id)));

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm.set(params['q'] ?? '');
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.productsApi.getProducts().subscribe({
      next: data => { this.allProducts.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  clearSearch(): void { this.router.navigate(['/items']); }

  enterSelectionMode(): void { this.selectionMode.set(true); }

  exitSelectionMode(): void {
    this.selectionMode.set(false);
    this.selectedIds.set(new Set());
  }

  toggleSelect(id: string): void {
    const next = new Set(this.selectedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedIds.set(next);
  }

  selectAll(): void {
    this.selectedIds.set(new Set(this.filteredProducts().map(p => p.id)));
  }

  clearSelection(): void { this.selectedIds.set(new Set()); }

  // ── single-item actions ──────────────────────────────────────────────────

  openProductLink(product: TrackedProduct): void {
    this.dialog.open(ProductLinkDialogComponent, { width: '480px', data: product });
  }

  openAdd(): void {
    this.dialog.open(AddProductDialogComponent, { width: '480px', data: {} })
      .afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  openEdit(product: TrackedProduct): void {
    this.dialog.open(EditProductDialogComponent, { width: '480px', data: { product } })
      .afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  openAssignToList(product: TrackedProduct): void {
    this.dialog.open(AssignToListDialogComponent, { width: '400px', data: { productIds: [product.id] } })
      .afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  toggleActive(product: TrackedProduct): void {
    this.productsApi.updateProduct(product.id, { isActive: !product.isActive }).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) =>
        this.toast.error(err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
    });
  }

  confirmRemove(product: TrackedProduct): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('PRODUCTS.CONFIRM_REMOVE'),
        message: this.translate.instant('PRODUCTS.CONFIRM_REMOVE_MSG'),
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.productsApi.removeProduct(product.id).subscribe({
        next: () => { this.toast.success(product.name); this.load(); },
        error: (err: HttpErrorResponse) =>
          this.toast.error(err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
      });
    });
  }

  // ── bulk actions ─────────────────────────────────────────────────────────

  bulkActivate(): void {
    const ids = [...this.selectedIds()];
    forkJoin(ids.map(id => this.productsApi.updateProduct(id, { isActive: true }))).subscribe({
      next: () => { this.exitSelectionMode(); this.load(); },
      error: (err: HttpErrorResponse) =>
        this.toast.error(err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
    });
  }

  bulkPause(): void {
    const ids = [...this.selectedIds()];
    forkJoin(ids.map(id => this.productsApi.updateProduct(id, { isActive: false }))).subscribe({
      next: () => { this.exitSelectionMode(); this.load(); },
      error: (err: HttpErrorResponse) =>
        this.toast.error(err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
    });
  }

  bulkAssignToList(): void {
    const productIds = [...this.selectedIds()];
    this.dialog.open(AssignToListDialogComponent, { width: '400px', data: { productIds } })
      .afterClosed().subscribe(saved => { if (saved) { this.exitSelectionMode(); this.load(); } });
  }

  bulkDelete(): void {
    const ids = [...this.selectedIds()];
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('PRODUCTS.CONFIRM_REMOVE'),
        message: this.translate.instant('PRODUCTS.BULK_DELETE_MSG', { count: ids.length }),
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      forkJoin(ids.map(id => this.productsApi.removeProduct(id))).subscribe({
        next: () => { this.exitSelectionMode(); this.load(); },
        error: (err: HttpErrorResponse) =>
          this.toast.error(err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
      });
    });
  }

}
