import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display.component';
import { SourceBadgeComponent } from '../../../shared/components/source-badge/source-badge.component';
import { TrackedProduct } from '../../../shared/models/tracked-product.model';

@Component({
  selector: 'app-product-link-dialog',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatIconModule,
    TranslateModule, PriceDisplayComponent, SourceBadgeComponent,
  ],
  template: `
    <div class="pw-dialog">
      <div class="pw-img">
        @if (product.imageUrl) {
          <img [src]="product.imageUrl" [alt]="product.name" />
        } @else {
          <mat-icon class="pw-no-img">image</mat-icon>
        }
      </div>
      <div class="pw-info">
        <p class="pw-name">{{ product.name }}</p>
        <app-source-badge [source]="product.source" />
        <div class="pw-price">
          <app-price-display [value]="product.currentPrice" />
        </div>
        @if (product.targetPrice > 0) {
          <p class="pw-target">Alvo: <app-price-display [value]="product.targetPrice" /></p>
        }
      </div>
    </div>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">{{ 'COMMON.CLOSE' | translate }}</button>
      <button mat-flat-button class="btn-open" (click)="openUrl()">
        <mat-icon>open_in_new</mat-icon>{{ 'PRODUCTS.OPEN_IN_PLATFORM' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .pw-dialog { display: flex; gap: 16px; padding: 8px 0 16px; }

    .pw-img {
      width: 120px; height: 120px; flex-shrink: 0;
      border: 1px solid #f0f0f0; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      background: #fff; padding: 8px;
      img { width: 100%; height: 100%; object-fit: contain; }
    }
    .pw-no-img { font-size: 52px; color: #ddd; }

    .pw-info { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; }
    .pw-name { margin: 0; font-size: 15px; color: #333; line-height: 1.4; }
    .pw-price ::ng-deep .price { font-size: 24px; font-weight: 300; color: #333; }
    .pw-target { margin: 0; font-size: 13px; color: #666; }

    .btn-open {
      background: #3483FA !important; color: white !important;
      display: flex; align-items: center; gap: 4px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `],
})
export class ProductLinkDialogComponent {
  protected readonly ref = inject(MatDialogRef) as MatDialogRef<ProductLinkDialogComponent>;
  readonly product = inject<TrackedProduct>(MAT_DIALOG_DATA);

  openUrl(): void {
    window.open(this.product.url, '_blank', 'noopener');
    this.ref.close();
  }
}
