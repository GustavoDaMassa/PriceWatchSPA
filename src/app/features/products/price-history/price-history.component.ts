import { Component, ElementRef, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { ProductsApiService } from '../../../core/services/api/products-api.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

@Component({
  selector: 'app-price-history',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule, EmptyStateComponent],
  template: `
    <div class="page-header">
      <button mat-icon-button [routerLink]="['/lists', listId]"><mat-icon>arrow_back</mat-icon></button>
      <h1>{{ 'PRODUCTS.HISTORY' | translate }}</h1>
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (empty()) {
      <app-empty-state [message]="'COMMON.EMPTY_STATE' | translate" icon="show_chart" />
    } @else {
      <div class="chart-container">
        <canvas #chartCanvas></canvas>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .chart-container { background: var(--pw-surface); border-radius: 8px; padding: 24px; }
  `],
})
export class PriceHistoryComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly productsApi = inject(ProductsApiService);

  private chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart?: Chart;

  listId = this.route.snapshot.paramMap.get('id')!;
  productId = this.route.snapshot.paramMap.get('productId')!;
  loading = signal(true);
  empty = signal(false);

  ngOnInit(): void {
    this.productsApi.getPriceHistory(this.productId).subscribe({
      next: snapshots => {
        this.loading.set(false);
        if (snapshots.length === 0) { this.empty.set(true); return; }

        const targetPrice = this.route.snapshot.queryParamMap.get('targetPrice');
        const labels = snapshots.map(s => new Date(s.capturedAt).toLocaleDateString());
        const prices = snapshots.map(s => s.price);

        setTimeout(() => {
          const canvas = this.chartCanvas()?.nativeElement;
          if (!canvas) return;
          this.chart = new Chart(canvas, {
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label: 'Preço',
                  data: prices,
                  borderColor: '#FFE600',
                  backgroundColor: 'rgba(255, 230, 0, 0.1)',
                  tension: 0.3,
                  fill: true,
                },
                ...(targetPrice ? [{
                  label: 'Alvo',
                  data: Array(labels.length).fill(Number(targetPrice)),
                  borderColor: '#00A650',
                  borderDash: [6, 4],
                  pointRadius: 0,
                  fill: false,
                }] : []),
              ],
            },
            options: {
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: { y: { beginAtZero: false } },
            },
          });
        });
      },
      error: () => { this.loading.set(false); this.empty.set(true); },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
