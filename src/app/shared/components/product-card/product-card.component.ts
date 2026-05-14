import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { PriceDisplayComponent } from '../price-display/price-display.component';
import { TrackedProduct } from '../../models/tracked-product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, MatCheckboxModule, MatIconModule, MatMenuModule, TranslateModule, PriceDisplayComponent],
  template: `
    <div class="ml-card"
         [class.ml-inactive]="!product().isActive"
         [class.ml-selected]="selected()"
         [class.ml-selectable]="selectionMode()"
         [class.ml-clickable]="!selectionMode()"
         (click)="onCardClick()">

      @if (selectionMode()) {
        <div class="ml-card-checkbox">
          <mat-checkbox [checked]="selected()"
                        (click)="$event.stopPropagation()"
                        (change)="selectionChange.emit()" />
        </div>
      }

      <div class="ml-card-img">
        @if (product().imageUrl) {
          <img [src]="product().imageUrl" [alt]="product().name" loading="lazy" />
        } @else {
          <mat-icon class="ml-no-img">image</mat-icon>
        }
      </div>

      <div class="ml-card-body">
        <p class="ml-card-name">{{ product().name }}</p>
        <div class="ml-card-price">
          <app-price-display [value]="product().currentPrice" />
        </div>
        @if (product().targetPrice > 0) {
          <div class="ml-card-target">
            Alvo: <app-price-display [value]="product().targetPrice" />
          </div>
          <p class="ml-card-dist" [class.below]="product().currentPrice <= product().targetPrice">
            {{ distanceLabel() }}
          </p>
        }
        <div class="ml-card-badges">
          <span class="ml-badge" [class.active]="product().isActive">
            {{ (product().isActive ? 'PRODUCTS.STATUS_ACTIVE' : 'PRODUCTS.STATUS_PAUSED') | translate }}
          </span>
          @if (showInListBadge() && product().listId) {
            <span class="ml-badge-list">{{ 'ITEMS.IN_LIST' | translate }}</span>
          }
        </div>
      </div>

      @if (!selectionMode()) {
        <div class="ml-card-footer">
          <a [routerLink]="historyRoute()" class="ml-footer-btn" (click)="$event.stopPropagation()">
            <mat-icon>show_chart</mat-icon>
          </a>
          <button class="ml-footer-btn" [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu>
            <button mat-menu-item (click)="editClick.emit()">
              <mat-icon>edit</mat-icon>{{ 'PRODUCTS.EDIT' | translate }}
            </button>
            @if (showAssignToList()) {
              <button mat-menu-item (click)="assignToListClick.emit()">
                <mat-icon>playlist_add</mat-icon>{{ 'PRODUCTS.ASSIGN_TO_LIST' | translate }}
              </button>
            }
            <button mat-menu-item (click)="toggleActiveClick.emit()">
              <mat-icon>{{ product().isActive ? 'pause' : 'play_arrow' }}</mat-icon>
              {{ (product().isActive ? 'PRODUCTS.PAUSE' : 'PRODUCTS.RESUME') | translate }}
            </button>
            <button mat-menu-item (click)="removeClick.emit()" class="danger">
              <mat-icon>delete</mat-icon>{{ 'PRODUCTS.REMOVE' | translate }}
            </button>
          </mat-menu>
        </div>
      }
    </div>
  `,
  styles: [`
    .ml-card {
      background: white; border-radius: 4px; overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      display: grid;
      grid-template-columns: 110px 1fr;
      grid-template-rows: 1fr auto;
      height: 200px;
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

    .ml-card-body { padding: 12px; overflow: hidden; }
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
export class ProductCardComponent {
  product = input.required<TrackedProduct>();
  historyRoute = input.required<(string | number)[]>();
  selected = input(false);
  selectionMode = input(false);
  showAssignToList = input(false);
  showInListBadge = input(false);

  cardClick = output<void>();
  selectionChange = output<void>();
  editClick = output<void>();
  assignToListClick = output<void>();
  toggleActiveClick = output<void>();
  removeClick = output<void>();

  onCardClick(): void {
    this.selectionMode() ? this.selectionChange.emit() : this.cardClick.emit();
  }

  distanceLabel(): string {
    const p = this.product();
    if (!p.targetPrice || p.currentPrice <= 0) return '';
    const d = ((p.currentPrice - p.targetPrice) / p.targetPrice) * 100;
    return d <= 0
      ? `${Math.abs(d).toFixed(0)}% abaixo do alvo`
      : `${d.toFixed(0)}% acima do alvo`;
  }
}
