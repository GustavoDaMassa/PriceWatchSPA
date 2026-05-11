import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    TranslateModule, PriceDisplayComponent,
  ],
  template: `
    <h1 class="page-title">{{ 'DASHBOARD.TITLE' | translate }}</h1>

    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else {
      <div class="stats-grid">
        <mat-card class="stat-card stat-link" routerLink="/lists">
          <mat-card-content>
            <div class="stat-icon-wrap"><mat-icon>list</mat-icon></div>
            <span class="stat-value">{{ lists().length }}</span>
            <span class="stat-label">{{ 'DASHBOARD.TOTAL_LISTS' | translate }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-link" routerLink="/lists">
          <mat-card-content>
            <div class="stat-icon-wrap"><mat-icon>inventory_2</mat-icon></div>
            <span class="stat-value">{{ totalProducts() }}</span>
            <span class="stat-label">{{ 'DASHBOARD.TOTAL_PRODUCTS' | translate }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-link" routerLink="/notifications">
          <mat-card-content>
            <div class="stat-icon-wrap"><mat-icon>notifications</mat-icon></div>
            <span class="stat-value">{{ polling.unreadCount() }}</span>
            <span class="stat-label">{{ 'DASHBOARD.UNREAD_ALERTS' | translate }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-link" routerLink="/notifications">
          <mat-card-content>
            <div class="stat-icon-wrap"><mat-icon>flag</mat-icon></div>
            <span class="stat-value">{{ belowTarget() }}</span>
            <span class="stat-label">{{ 'DASHBOARD.BELOW_TARGET' | translate }}</span>
          </mat-card-content>
        </mat-card>
      </div>

      @if (nextCheck()) {
        <mat-card class="next-check-card">
          <mat-card-content>
            <mat-icon>schedule</mat-icon>
            <span>{{ 'DASHBOARD.NEXT_CHECK' | translate }}: <strong>{{ nextCheck()?.name }}</strong></span>
          </mat-card-content>
        </mat-card>
      }
    }
  `,
  styles: [`
    .page-title {
      margin: 0 auto 32px;
      text-align: center;
      font-size: var(--pw-font-size-xl, 1.5rem);
      font-weight: var(--pw-font-weight-semibold, 600);
      letter-spacing: -0.01em;
    }
    .center { display: flex; justify-content: center; padding: 48px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      max-width: 560px;
      margin: 0 auto 24px;
    }
    .stat-card {
      background: var(--pw-card-bg);
      color: var(--pw-card-color);
      text-align: center;
    }
    .stat-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 28px 20px;
    }
    .stat-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(var(--pw-card-color, 16, 2, 108), 0.08);
    }
    .stat-card mat-icon { font-size: 24px; width: 24px; height: 24px; color: var(--pw-card-color); }
    .stat-value { font-size: 2.25rem; font-weight: var(--pw-font-weight-bold, 700); line-height: 1; color: var(--pw-card-color); }
    .stat-label { font-size: var(--pw-font-size-xs, 0.75rem); color: var(--pw-card-color); text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.75; }
    .stat-link {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .stat-link:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
    }
    .next-check-card { background: var(--pw-surface); max-width: 560px; margin: 0 auto; }
    .next-check-card mat-card-content { display: flex; align-items: center; gap: 8px; padding: 16px; }
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
  belowTarget = computed(() => this.allProducts().filter(p => p.targetPrice > 0 && p.currentPrice <= p.targetPrice).length);
  nextCheck = computed(() => {
    const active = this.allProducts().filter(p => p.isActive);
    if (!active.length) return null;
    return active.reduce((a, b) => new Date(a.nextCheckAt) < new Date(b.nextCheckAt) ? a : b);
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.listsApi.getLists().subscribe({
      next: lists => {
        this.lists.set(lists);
        if (!lists.length) { this.loading.set(false); return; }
        forkJoin(lists.map(l => this.productsApi.getProducts(l.id).pipe(catchError(() => of([]))))).subscribe({
          next: results => { this.allProducts.set(results.flat()); this.loading.set(false); },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }
}
