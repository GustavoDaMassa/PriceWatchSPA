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
    <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>

    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else {
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>list</mat-icon>
            <span class="stat-value">{{ lists().length }}</span>
            <span class="stat-label">{{ 'DASHBOARD.TOTAL_LISTS' | translate }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>inventory_2</mat-icon>
            <span class="stat-value">{{ totalProducts() }}</span>
            <span class="stat-label">{{ 'DASHBOARD.TOTAL_PRODUCTS' | translate }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card" routerLink="/notifications">
          <mat-card-content>
            <mat-icon>notifications</mat-icon>
            <span class="stat-value">{{ polling.unreadCount() }}</span>
            <span class="stat-label">{{ 'DASHBOARD.UNREAD_ALERTS' | translate }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card highlight">
          <mat-card-content>
            <mat-icon>flag</mat-icon>
            <span class="stat-value">{{ belowTarget() }}</span>
            <span class="stat-label">{{ 'DASHBOARD.BELOW_TARGET' | translate }}</span>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="quick-actions">
        <button mat-flat-button class="btn-primary" routerLink="/lists">
          <mat-icon>add</mat-icon>{{ 'DASHBOARD.NEW_LIST' | translate }}
        </button>
        <button mat-stroked-button routerLink="/notifications">
          <mat-icon>notifications</mat-icon>{{ 'DASHBOARD.VIEW_NOTIFICATIONS' | translate }}
        </button>
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
    h1 { margin-bottom: 24px; text-align: center; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .stats-grid {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(8px);
      cursor: default;
      text-align: center;
      width: 150px;
      min-height: 190px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .stat-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 24px 16px;
      height: 100%;
    }
    .stat-card mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--pw-yellow); }
    .stat-value { font-size: 2.4rem; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 0.78rem; color: var(--pw-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .highlight mat-icon { color: var(--pw-success); }
    .quick-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
    .btn-primary { background-color: var(--pw-yellow); color: #333; font-weight: 600; }
    .next-check-card { background: var(--pw-surface); max-width: 480px; margin: 0 auto; }
    .next-check-card mat-card-content { display: flex; align-items: center; gap: 8px; }
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
