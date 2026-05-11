import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { ListsApiService } from '../../core/services/api/lists-api.service';
import { ProductsApiService } from '../../core/services/api/products-api.service';
import { NotificationPollingService } from '../../core/services/notification-polling.service';
import { PriceDisplayComponent } from '../../shared/components/price-display/price-display.component';
import { ProductList } from '../../shared/models/product-list.model';
import { TrackedProduct } from '../../shared/models/tracked-product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule, MatProgressSpinnerModule,
    TranslateModule, PriceDisplayComponent,
  ],
  template: `
    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else {
      <div class="ml-stats">
        <a routerLink="/lists" class="ml-stat-card">
          <div class="ml-stat-icon blue"><mat-icon>list</mat-icon></div>
          <div class="ml-stat-info">
            <span class="ml-stat-value">{{ lists().length }}</span>
            <span class="ml-stat-label">{{ 'DASHBOARD.TOTAL_LISTS' | translate }}</span>
          </div>
        </a>

        <a routerLink="/items" class="ml-stat-card">
          <div class="ml-stat-icon yellow"><mat-icon>inventory_2</mat-icon></div>
          <div class="ml-stat-info">
            <span class="ml-stat-value">{{ totalProducts() }}</span>
            <span class="ml-stat-label">{{ 'DASHBOARD.TOTAL_PRODUCTS' | translate }}</span>
          </div>
        </a>

        <a routerLink="/notifications" class="ml-stat-card">
          <div class="ml-stat-icon red"><mat-icon>notifications</mat-icon></div>
          <div class="ml-stat-info">
            <span class="ml-stat-value">{{ polling.unreadCount() }}</span>
            <span class="ml-stat-label">{{ 'DASHBOARD.UNREAD_ALERTS' | translate }}</span>
          </div>
        </a>

        <a routerLink="/items" class="ml-stat-card">
          <div class="ml-stat-icon green"><mat-icon>flag</mat-icon></div>
          <div class="ml-stat-info">
            <span class="ml-stat-value">{{ belowTarget() }}</span>
            <span class="ml-stat-label">{{ 'DASHBOARD.BELOW_TARGET' | translate }}</span>
          </div>
        </a>
      </div>

      @if (nearTarget().length) {
        <div class="ml-section">
          <h2 class="ml-section-title">{{ 'DASHBOARD.NEAR_TARGET' | translate }}</h2>
          <div class="ml-near-grid">
            @for (p of nearTarget(); track p.id) {
              <a routerLink="/items" class="ml-near-card">
                <div class="ml-near-img">
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" [alt]="p.name" loading="lazy" />
                  } @else {
                    <mat-icon class="ml-near-placeholder">image</mat-icon>
                  }
                </div>
                <div class="ml-near-body">
                  <p class="ml-near-name">{{ p.name }}</p>
                  <div class="ml-near-price">
                    <app-price-display [value]="p.currentPrice" />
                  </div>
                  @if (p.targetPrice > 0) {
                    <span class="ml-near-dist" [class.below]="p.currentPrice <= p.targetPrice">
                      {{ distanceLabel(p) }}
                    </span>
                  }
                </div>
              </a>
            }
          </div>
        </div>
      }

      @if (nextCheck()) {
        <div class="ml-next-check">
          <mat-icon>schedule</mat-icon>
          <span>{{ 'DASHBOARD.NEXT_CHECK' | translate }}: <strong>{{ nextCheck()?.name }}</strong></span>
        </div>
      }
    }
  `,
  styles: [`
    .center { display: flex; justify-content: center; padding: 48px; }

    .ml-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 24px;
    }
    @media (max-width: 768px) { .ml-stats { grid-template-columns: repeat(2, 1fr); } }

    .ml-stat-card {
      background: white; border-radius: 4px; padding: 20px 16px;
      display: flex; align-items: center; gap: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      text-decoration: none;
      transition: box-shadow 0.15s, transform 0.15s;
      &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.14); transform: translateY(-2px); }
    }

    .ml-stat-icon {
      width: 48px; height: 48px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }
    .ml-stat-icon.blue   { background: #EAF0FB; mat-icon { color: #3483FA; } }
    .ml-stat-icon.yellow { background: #FFFDE7; mat-icon { color: #F9A825; } }
    .ml-stat-icon.red    { background: #FFEBEE; mat-icon { color: #F23D4F; } }
    .ml-stat-icon.green  { background: #E8F5E9; mat-icon { color: #00A650; } }

    .ml-stat-info { display: flex; flex-direction: column; gap: 2px; }
    .ml-stat-value { font-size: 28px; font-weight: 700; color: #333; line-height: 1; }
    .ml-stat-label { font-size: 12px; color: #666; }

    .ml-section { margin-bottom: 24px; }
    .ml-section-title { font-size: 18px; font-weight: 400; color: #333; margin: 0 0 12px; }

    .ml-near-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 8px;
    }

    .ml-near-card {
      background: white; border-radius: 4px; overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1); text-decoration: none;
      display: flex; flex-direction: column;
      transition: box-shadow 0.15s;
      &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.16); }
    }

    .ml-near-img {
      aspect-ratio: 1; background: white; padding: 10px;
      display: flex; align-items: center; justify-content: center;
      border-bottom: 1px solid #f0f0f0;
      img { width: 100%; height: 100%; object-fit: contain; }
    }
    .ml-near-placeholder { font-size: 40px; color: #ddd; }

    .ml-near-body { padding: 10px; }
    .ml-near-name {
      font-size: 13px; color: #333; margin: 0 0 6px; line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .ml-near-price ::ng-deep .price { font-size: 18px; font-weight: 300; color: #333; }
    .ml-near-dist { font-size: 11px; color: #666; }
    .ml-near-dist.below { color: #00A650; font-weight: 600; }

    .ml-next-check {
      background: white; border-radius: 4px; padding: 14px 16px;
      display: flex; align-items: center; gap: 8px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.08);
      font-size: 14px; color: #333;
      mat-icon { color: #3483FA; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  protected readonly polling = inject(NotificationPollingService);
  private readonly listsApi = inject(ListsApiService);
  private readonly productsApi = inject(ProductsApiService);

  lists = signal<ProductList[]>([]);
  private allProducts = signal<TrackedProduct[]>([]);
  loading = signal(false);

  totalProducts = computed(() => this.allProducts().length);
  belowTarget = computed(() =>
    this.allProducts().filter(p => p.targetPrice > 0 && p.currentPrice <= p.targetPrice).length);
  nearTarget = computed(() =>
    this.allProducts()
      .filter(p => p.isActive && p.targetPrice > 0 && p.currentPrice > 0)
      .sort((a, b) => this.distance(a) - this.distance(b))
      .slice(0, 6));
  nextCheck = computed(() => {
    const active = this.allProducts().filter(p => p.isActive);
    if (!active.length) return null;
    return active.reduce((a, b) => new Date(a.nextCheckAt) < new Date(b.nextCheckAt) ? a : b);
  });

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      lists: this.listsApi.getLists(),
      products: this.productsApi.getProducts(),
    }).subscribe({
      next: ({ lists, products }) => {
        this.lists.set(lists);
        this.allProducts.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private distance(p: TrackedProduct): number {
    return (p.currentPrice - p.targetPrice) / p.targetPrice;
  }

  distanceLabel(p: TrackedProduct): string {
    const d = this.distance(p) * 100;
    return d <= 0
      ? `${Math.abs(d).toFixed(0)}% abaixo do alvo`
      : `${d.toFixed(0)}% acima do alvo`;
  }
}
