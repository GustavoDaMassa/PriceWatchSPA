import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { ListsApiService } from '../../../core/services/api/lists-api.service';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { AnalysisItem } from '../../../shared/models/product-list.model';

@Component({
  selector: 'app-list-analysis',
  standalone: true,
  imports: [
    RouterLink, DecimalPipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTableModule,
    TranslateModule, PriceDisplayComponent, EmptyStateComponent,
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button [routerLink]="['/lists', listId]"><mat-icon>arrow_back</mat-icon></button>
      <h1>{{ 'ANALYSIS.TITLE' | translate }}</h1>
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (items().length === 0) {
      <app-empty-state [message]="'COMMON.EMPTY_STATE' | translate" />
    } @else {
      <table mat-table [dataSource]="items()" class="analysis-table mat-elevation-z2">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>{{ 'PRODUCTS.TITLE' | translate }}</th>
          <td mat-cell *matCellDef="let item">{{ item.productName }}</td>
        </ng-container>
        <ng-container matColumnDef="current">
          <th mat-header-cell *matHeaderCellDef>{{ 'PRODUCTS.CURRENT_PRICE' | translate }}</th>
          <td mat-cell *matCellDef="let item"><app-price-display [value]="item.currentPrice" /></td>
        </ng-container>
        <ng-container matColumnDef="target">
          <th mat-header-cell *matHeaderCellDef>{{ 'PRODUCTS.TARGET_PRICE' | translate }}</th>
          <td mat-cell *matCellDef="let item"><app-price-display [value]="item.targetPrice" /></td>
        </ng-container>
        <ng-container matColumnDef="distance">
          <th mat-header-cell *matHeaderCellDef>{{ 'ANALYSIS.DISTANCE' | translate }}</th>
          <td mat-cell *matCellDef="let item">
            <span [class]="distanceClass(item.distancePercent)">
              {{ item.distancePercent | number:'1.1-1' }}%
            </span>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .analysis-table { width: 100%; background: var(--pw-surface); }
    .dist-below { color: var(--pw-success); font-weight: 700; }
    .dist-near { color: #f59e0b; font-weight: 600; }
    .dist-far { color: var(--pw-error); }
  `],
})
export class ListAnalysisComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly listsApi = inject(ListsApiService);

  listId = this.route.snapshot.paramMap.get('id')!;
  items = signal<AnalysisItem[]>([]);
  loading = signal(false);
  columns = ['name', 'current', 'target', 'distance'];

  ngOnInit(): void {
    this.loading.set(true);
    this.listsApi.getAnalysis(this.listId).subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  distanceClass(pct: number): string {
    if (pct <= 0) return 'dist-below';
    if (pct <= 20) return 'dist-near';
    return 'dist-far';
  }
}
