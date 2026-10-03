import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OffersApiService } from '../../../core/services/api/offers-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display.component';
import { ProductComparison, StoreOfferSummary } from '../../../shared/models/offer.model';
import { RelativeDatePipe } from '../../../shared/pipes/relative-date.pipe';

/**
 * Comparação lado a lado das ofertas do mesmo produto. A saída para a loja sempre passa pelo
 * endpoint de clique (link de afiliado + registro do clique): a página nunca abre a URL da loja direto.
 */
@Component({
  selector: 'app-product-comparison',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule,
    EmptyStateComponent, PriceDisplayComponent, RelativeDatePipe,
  ],
  template: `
    <div class="cmp-page">
      @if (loading()) {
        <div class="center"><mat-spinner diameter="40" /></div>
      } @else if (comparison(); as cmp) {
        <header class="cmp-head">
          @if (cmp.imageUrl) { <img [src]="cmp.imageUrl" [alt]="cmp.name" /> }
          <div>
            <h1>{{ cmp.name }}</h1>
            <p class="sub">{{ 'COMPARISON.TITLE' | translate }}</p>
          </div>
        </header>

        @for (offer of cmp.offers; track offer.offerId) {
          <article class="offer" [class.cheapest]="offer.isCheapest">
            <div class="store">
              <strong>{{ offer.storeName }}</strong>
              @if (offer.isCheapest && cmp.offers.length > 1) {
                <span class="badge">{{ 'COMPARISON.CHEAPEST' | translate }}</span>
              }
            </div>
            <div class="price"><app-price-display [value]="offer.currentPrice" /></div>
            <div class="meta">
              @if (offer.lowestPrice > 0) {
                <span>{{ 'COMPARISON.LOWEST_EVER' | translate }}: <app-price-display [value]="offer.lowestPrice" /></span>
              }
              <span class="fresh">
                @if (offer.lastCheckedAt) {
                  {{ 'COMPARISON.LAST_CHECKED' | translate }} {{ offer.lastCheckedAt | relativeDate: lang() }}
                } @else {
                  {{ 'COMPARISON.NEVER_CHECKED' | translate }}
                }
              </span>
            </div>
            <button mat-flat-button class="go" (click)="openStore(offer)">
              <mat-icon>open_in_new</mat-icon>{{ 'COMPARISON.GO_TO_STORE' | translate }}
            </button>
          </article>
        } @empty {
          <app-empty-state icon="storefront" [message]="'COMPARISON.EMPTY' | translate" />
        }

        <p class="note">{{ 'COMPARISON.FRESHNESS_NOTE' | translate }}</p>
        <div class="footer">
          <button mat-stroked-button (click)="findMore()">
            <mat-icon>travel_explore</mat-icon>{{ 'COMPARISON.FIND_MORE' | translate }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .cmp-page { max-width: 760px; margin: 0 auto; padding-bottom: 32px; }
    .center { display: flex; justify-content: center; padding: 48px 0; }
    .cmp-head { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .cmp-head img { width: 72px; height: 72px; object-fit: contain; background: #fff; border-radius: 4px; padding: 4px; }
    h1 { margin: 0; font-size: 20px; font-weight: 400; color: #333; }
    .sub { margin: 2px 0 0; font-size: 13px; color: #666; }
    .offer { display: grid; grid-template-columns: 1.2fr 1fr 1.6fr auto; gap: 12px; align-items: center; background: #fff; border-radius: 6px; padding: 14px 16px; margin-bottom: 10px; box-shadow: 0 1px 2px rgba(0,0,0,.1); border: 2px solid transparent; }
    .offer.cheapest { border-color: #00A650; }
    .store { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .badge { background: #00A650; color: #fff; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
    .price ::ng-deep .price { font-size: 22px; font-weight: 400; color: #333; }
    .meta { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: #666; }
    .go { background: #3483FA !important; color: #fff !important; }
    .note { margin: 12px 0; font-size: 12px; color: #999; }
    .footer { display: flex; justify-content: flex-end; }
    @media (max-width: 640px) { .offer { grid-template-columns: 1fr 1fr; } .go { grid-column: 1 / -1; } }
  `],
})
export class ProductComparisonComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly offersApi = inject(OffersApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly productId = this.route.snapshot.paramMap.get('productId')!;
  readonly comparison = signal<ProductComparison | null>(null);
  readonly loading = signal(true);

  lang(): string {
    return this.translate.currentLang ?? this.translate.defaultLang ?? 'pt-BR';
  }

  ngOnInit(): void {
    this.offersApi.getComparison(this.productId).subscribe({
      next: comparison => {
        this.comparison.set(comparison);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error(this.translate.instant('COMMON.ERROR_GENERIC'));
      },
    });
  }

  /**
   * Abre a aba antes da chamada assíncrona (senão o navegador bloqueia o pop-up) e só depois a aponta
   * para a URL devolvida pelo endpoint de clique.
   */
  openStore(offer: StoreOfferSummary): void {
    const tab = window.open('about:blank', '_blank');

    this.offersApi.clickOffer(offer.offerId).subscribe({
      next: ({ url }) => {
        if (!tab) {
          window.location.href = url;
          return;
        }
        tab.opener = null;
        tab.location.href = url;
      },
      error: () => {
        tab?.close();
        this.toast.error(this.translate.instant('COMMON.ERROR_GENERIC'));
      },
    });
  }

  findMore(): void {
    this.router.navigate(['/products', this.productId, 'candidates']);
  }
}
