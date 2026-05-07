import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductsApiService } from '../../../core/services/api/products-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SourceBadgeComponent } from '../../../shared/components/source-badge/source-badge.component';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display.component';
import { TrackedProduct } from '../../../shared/models/tracked-product.model';
import { AddProductDialogComponent } from '../../products/add-product/add-product-dialog.component';
import { EditProductDialogComponent } from '../../products/edit-product/edit-product-dialog.component';

@Component({
  selector: 'app-list-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatMenuModule, MatProgressSpinnerModule, MatSlideToggleModule,
    TranslateModule, EmptyStateComponent, SourceBadgeComponent, PriceDisplayComponent,
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button routerLink="/lists"><mat-icon>arrow_back</mat-icon></button>
      <h1>{{ 'PRODUCTS.TITLE' | translate }}</h1>
      <button mat-flat-button class="btn-primary" (click)="openAdd()">
        <mat-icon>add</mat-icon>{{ 'PRODUCTS.ADD' | translate }}
      </button>
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (products().length === 0) {
      <app-empty-state [message]="'PRODUCTS.EMPTY' | translate" icon="inventory_2" />
    } @else {
      <div class="products-grid">
        @for (p of products(); track p.id) {
          <mat-card class="product-card" [class.inactive]="!p.isActive">
            @if (p.imageUrl) {
              <img mat-card-image [src]="p.imageUrl" [alt]="p.name">
            }
            <mat-card-header>
              <mat-card-title class="product-name">{{ p.name }}</mat-card-title>
              <mat-card-subtitle>
                <app-source-badge [source]="p.source" />
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="price-row">
                <span class="price-label">{{ 'PRODUCTS.CURRENT_PRICE' | translate }}</span>
                <app-price-display [value]="p.currentPrice"
                  [class.below-target]="p.targetPrice > 0 && p.currentPrice <= p.targetPrice" />
              </div>
              @if (p.targetPrice > 0) {
                <div class="price-row">
                  <span class="price-label">{{ 'PRODUCTS.TARGET_PRICE' | translate }}</span>
                  <app-price-display [value]="p.targetPrice" />
                </div>
              }
              <div class="price-row">
                <span class="price-label">{{ 'PRODUCTS.LOWEST_PRICE' | translate }}</span>
                <app-price-display [value]="p.lowestPrice" />
              </div>
            </mat-card-content>
            <mat-card-actions align="end">
              <a mat-button [routerLink]="['/lists', listId, 'products', p.id, 'history']">
                <mat-icon>show_chart</mat-icon>
              </a>
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu>
                <button mat-menu-item (click)="openEdit(p)">
                  <mat-icon>edit</mat-icon>{{ 'PRODUCTS.EDIT' | translate }}
                </button>
                <button mat-menu-item (click)="toggleActive(p)">
                  <mat-icon>{{ p.isActive ? 'pause' : 'play_arrow' }}</mat-icon>
                  {{ (p.isActive ? 'PRODUCTS.PAUSE' : 'PRODUCTS.RESUME') | translate }}
                </button>
                <button mat-menu-item (click)="confirmRemove(p)" class="text-danger">
                  <mat-icon>delete</mat-icon>{{ 'PRODUCTS.REMOVE' | translate }}
                </button>
              </mat-menu>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; flex: 1; }
    .btn-primary { background-color: var(--pw-yellow); color: #333; font-weight: 600; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .product-card { background: var(--pw-surface); }
    .product-card.inactive { opacity: 0.6; }
    .product-name { font-size: 0.95rem; line-height: 1.3; }
    .price-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 0.9rem; }
    .price-label { color: var(--pw-text-secondary); }
    .text-danger { color: var(--pw-error); }
    :host ::ng-deep .below-target .price { color: var(--pw-success); font-weight: 700; }
  `],
})
export class ListDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsApi = inject(ProductsApiService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  listId = this.route.snapshot.paramMap.get('id')!;
  products = signal<TrackedProduct[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsApi.getProducts(this.listId).subscribe({
      next: data => { this.products.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAdd(): void {
    this.dialog.open(AddProductDialogComponent, { width: '480px', data: { listId: this.listId } })
      .afterClosed().subscribe(saved => { if (saved) this.loadProducts(); });
  }

  openEdit(product: TrackedProduct): void {
    this.dialog.open(EditProductDialogComponent, { width: '480px', data: { listId: this.listId, product } })
      .afterClosed().subscribe(saved => { if (saved) this.loadProducts(); });
  }

  toggleActive(product: TrackedProduct): void {
    this.productsApi.updateProduct(this.listId, product.id, { isActive: !product.isActive }).subscribe({
      next: () => this.loadProducts(),
      error: (err: HttpErrorResponse) => this.toast.error(err.error?.message ?? this.translate.instant('COMMON.ERROR_GENERIC')),
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
      this.productsApi.removeProduct(this.listId, product.id).subscribe({
        next: () => { this.toast.success(product.name); this.loadProducts(); },
        error: (err: HttpErrorResponse) => this.toast.error(err.error?.message ?? this.translate.instant('COMMON.ERROR_GENERIC')),
      });
    });
  }
}
