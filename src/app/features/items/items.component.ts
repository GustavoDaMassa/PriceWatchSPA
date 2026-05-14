import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ProductsApiService } from '../../core/services/api/products-api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PriceDisplayComponent } from '../../shared/components/price-display/price-display.component';
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
    MatButtonModule, MatCheckboxModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule,
    TranslateModule, EmptyStateComponent, PriceDisplayComponent,
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
          <div class="ml-card"
               [class.ml-inactive]="!p.isActive"
               [class.ml-selected]="selectedIds().has(p.id)"
               [class.ml-selectable]="selectionMode()"
               [class.ml-clickable]="!selectionMode()"
               (click)="selectionMode() ? toggleSelect(p.id) : openProductLink(p)">
            @if (selectionMode()) {
              <div class="ml-card-checkbox">
                <mat-checkbox [checked]="selectedIds().has(p.id)" (click)="$event.stopPropagation()" (change)="toggleSelect(p.id)" />
              </div>
            }
            <div class="ml-card-img">
              @if (p.imageUrl) {
                <img [src]="p.imageUrl" [alt]="p.name" loading="lazy" />
              } @else {
                <mat-icon class="ml-no-img">image</mat-icon>
              }
            </div>
            <div class="ml-card-body">
              <p class="ml-card-name">{{ p.name }}</p>
              <div class="ml-card-price">
                <app-price-display [value]="p.currentPrice" />
              </div>
              @if (p.targetPrice > 0) {
                <div class="ml-card-target">
                  Alvo: <app-price-display [value]="p.targetPrice" />
                </div>
                <p class="ml-card-dist" [class.below]="p.currentPrice <= p.targetPrice">
                  {{ distanceLabel(p) }}
                </p>
              }
              <div class="ml-card-badges">
                <span class="ml-badge" [class.active]="p.isActive">
                  {{ (p.isActive ? 'PRODUCTS.STATUS_ACTIVE' : 'PRODUCTS.STATUS_PAUSED') | translate }}
                </span>
                @if (p.listId) {
                  <span class="ml-badge-list">{{ 'ITEMS.IN_LIST' | translate }}</span>
                }
              </div>
            </div>
            @if (!selectionMode()) {
              <div class="ml-card-footer">
                <a [routerLink]="['/items', p.id, 'history']" class="ml-footer-btn" (click)="$event.stopPropagation()">
                  <mat-icon>show_chart</mat-icon>
                </a>
                <button class="ml-footer-btn" [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu>
                  <button mat-menu-item (click)="openEdit(p)">
                    <mat-icon>edit</mat-icon>{{ 'PRODUCTS.EDIT' | translate }}
                  </button>
                  @if (!p.listId) {
                    <button mat-menu-item (click)="openAssignToList(p)">
                      <mat-icon>playlist_add</mat-icon>{{ 'PRODUCTS.ASSIGN_TO_LIST' | translate }}
                    </button>
                  }
                  <button mat-menu-item (click)="toggleActive(p)">
                    <mat-icon>{{ p.isActive ? 'pause' : 'play_arrow' }}</mat-icon>
                    {{ (p.isActive ? 'PRODUCTS.PAUSE' : 'PRODUCTS.RESUME') | translate }}
                  </button>
                  <button mat-menu-item (click)="confirmRemove(p)" class="danger">
                    <mat-icon>delete</mat-icon>{{ 'PRODUCTS.REMOVE' | translate }}
                  </button>
                </mat-menu>
              </div>
            }
          </div>
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

    .ml-card {
      background: white; border-radius: 4px; overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      display: grid;
      grid-template-columns: 110px 1fr;
      grid-template-rows: 1fr auto;
      position: relative;
      transition: box-shadow 0.15s;
      outline: 2px solid transparent;
      &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.16); }
    }
    .ml-card.ml-selectable { cursor: pointer; }
    .ml-card.ml-selectable:hover { outline-color: #b3cdf8; }
    .ml-card.ml-clickable { cursor: pointer; }
    .ml-card.ml-selected { outline-color: #3483FA; }
    .ml-card.ml-inactive { opacity: 0.6; }

    .ml-card-checkbox {
      position: absolute; top: 6px; left: 6px; z-index: 1;
      background: rgba(255,255,255,0.85); border-radius: 3px; padding: 1px;
    }

    .ml-card-img {
      grid-row: 1 / 3;
      background: #fff; padding: 12px;
      display: flex; align-items: center; justify-content: center;
      border-right: 1px solid #f0f0f0;
      img { width: 100%; height: 100%; object-fit: contain; }
    }
    .ml-no-img { font-size: 52px; color: #ddd; }

    .ml-card-body { padding: 12px; flex: 1; }
    .ml-card-name {
      font-size: 14px; color: #333; margin: 0 0 8px; line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .ml-card-price ::ng-deep .price { font-size: 22px; font-weight: 300; color: #333; }
    .ml-card-target { font-size: 12px; color: #666; margin: 4px 0; }
    .ml-card-target ::ng-deep .price { font-size: 12px; font-weight: 400; color: #666; }
    .ml-card-dist { font-size: 12px; color: #666; margin: 2px 0 8px; }
    .ml-card-dist.below { color: #00A650; font-weight: 600; }

    .ml-card-badges { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px; }
    .ml-badge { font-size: 11px; padding: 2px 8px; border-radius: 2px; background: #f5f5f5; color: #999; }
    .ml-badge.active { background: #e8f5e9; color: #00A650; }
    .ml-badge-list { font-size: 11px; padding: 2px 8px; border-radius: 2px; background: #EAF0FB; color: #3483FA; }

    .ml-card-footer {
      display: flex; justify-content: flex-end; align-items: center;
      padding: 4px 8px; border-top: 1px solid #f5f5f5; gap: 2px;
      grid-column: 2; grid-row: 2;
    }
    .ml-footer-btn {
      background: none; border: none; cursor: pointer; color: #3483FA;
      display: flex; align-items: center; justify-content: center;
      padding: 4px; border-radius: 4px; text-decoration: none;
      &:hover { background: #EAF0FB; }
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .danger { color: #F23D4F; }
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

  distanceLabel(p: TrackedProduct): string {
    if (!p.targetPrice || p.currentPrice <= 0) return '';
    const d = ((p.currentPrice - p.targetPrice) / p.targetPrice) * 100;
    return d <= 0
      ? `${Math.abs(d).toFixed(0)}% abaixo do alvo`
      : `${d.toFixed(0)}% acima do alvo`;
  }
}
