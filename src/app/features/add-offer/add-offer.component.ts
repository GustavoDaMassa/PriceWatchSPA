import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { ExtensionBridgeService } from '../../core/services/extension-bridge.service';
import { OffersApiService } from '../../core/services/api/offers-api.service';
import { StoresApiService } from '../../core/services/api/stores-api.service';
import { ToastService } from '../../core/services/toast.service';
import { StoreCapabilities } from '../../shared/models/store.model';
import { ExtensionDialogComponent } from '../../shell/extension-dialog.component';

/**
 * Adicionar um produto: colar o link (a API normaliza, segue links curtos e identifica a loja) ou
 * escolher uma loja e acompanhar direto pela página dela, com a extensão. Depois de adicionar, segue
 * para a descoberta do mesmo produto em outras lojas.
 */
@Component({
  selector: 'app-add-offer',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatProgressSpinnerModule, TranslateModule,
  ],
  template: `
    <div class="add-page">
      <h1>{{ 'ADD_OFFER.TITLE' | translate }}</h1>
      <p class="add-subtitle">{{ 'ADD_OFFER.SUBTITLE' | translate }}</p>

      <form class="add-card" [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'ADD_OFFER.URL_LABEL' | translate }}</mat-label>
          <input matInput formControlName="url" placeholder="https://..." autocomplete="off">
          <mat-hint>{{ 'ADD_OFFER.URL_HINT' | translate }}</mat-hint>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'ADD_OFFER.TARGET_LABEL' | translate }}</mat-label>
          <input matInput type="number" formControlName="targetPrice" min="0" step="0.01">
        </mat-form-field>
        <button mat-flat-button class="btn-primary submit" type="submit" [disabled]="form.invalid || loading()">
          @if (loading()) { <mat-spinner diameter="18" /> } @else { {{ 'ADD_OFFER.SUBMIT' | translate }} }
        </button>
      </form>

      @if (stores().length > 0) {
        <div class="divider"><span>{{ 'ADD_OFFER.OR' | translate }}</span></div>

        <section class="add-card stores">
          <h2>{{ 'ADD_OFFER.PICK_STORE' | translate }}</h2>
          @if (extensionInstalled() === false) {
            <p class="hint">
              {{ 'ADD_OFFER.EXTENSION_NEEDED' | translate }}
              <button mat-button type="button" class="install" (click)="openExtensionDialog()">
                {{ 'ADD_OFFER.INSTALL_EXTENSION' | translate }}
              </button>
            </p>
          } @else if (extensionInstalled()) {
            <p class="hint ok"><mat-icon>check_circle</mat-icon>{{ 'ADD_OFFER.EXTENSION_READY' | translate }}</p>
          }
          <div class="store-grid">
            @for (store of stores(); track store.source) {
              <button type="button" class="store-btn" [disabled]="!extensionInstalled()" (click)="openStore(store)">
                <mat-icon>storefront</mat-icon>
                {{ 'ADD_OFFER.OPEN_STORE' | translate: { store: store.name } }}
              </button>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .add-page { max-width: 640px; margin: 0 auto; padding: 8px 0 32px; }
    h1 { margin: 0 0 4px; font-size: 22px; font-weight: 300; color: #333; }
    .add-subtitle { margin: 0 0 20px; color: #666; font-size: 14px; }
    .add-card { background: #fff; border-radius: 6px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,.1); }
    .full-width { width: 100%; }
    .submit { width: 100%; height: 44px; font-weight: 600; }
    .btn-primary { background-color: var(--pw-yellow); color: #333; }
    .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: #999; font-size: 13px; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #ddd; }
    .stores h2 { margin: 0 0 8px; font-size: 16px; font-weight: 500; color: #333; }
    .hint { margin: 0 0 12px; color: #666; font-size: 13px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
    .hint.ok { color: #00A650; }
    .hint mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .store-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .store-btn {
      display: flex; align-items: center; gap: 6px; padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px;
      background: #fff; color: #333; font-size: 14px; font-family: inherit; cursor: pointer;
      &:hover:not([disabled]) { background: #f5f5f5; }
      &[disabled] { opacity: .5; cursor: not-allowed; }
    }
  `],
})
export class AddOfferComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storesApi = inject(StoresApiService);
  private readonly offersApi = inject(OffersApiService);
  private readonly bridge = inject(ExtensionBridgeService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly stores = signal<StoreCapabilities[]>([]);
  /** null enquanto a detecção não terminou. */
  readonly extensionInstalled = signal<boolean | null>(null);
  readonly loading = signal(false);

  readonly form = this.fb.group({
    // tolera espaço/quebra de linha nas pontas (comum ao colar); o link é aparado antes de enviar
    url: ['', [Validators.required, Validators.pattern(/^\s*\S+\.\S+\s*$/)]],
    targetPrice: [null as number | null],
  });

  ngOnInit(): void {
    this.storesApi.getStores().subscribe({
      next: stores => this.stores.set(stores.filter(s => s.canFetchByUrl)),
      error: () => this.stores.set([]),
    });

    this.bridge.isInstalled().then(installed => this.extensionInstalled.set(installed));

    // fluxo "abrir a loja": a extensão avisa quando o produto foi acompanhado e o usuário volta para esta aba
    this.bridge.tracked$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ productId }) => this.goToCandidates(productId));
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.offersApi.createOffer({
      url: this.form.value.url!.trim(),
      targetPrice: this.form.value.targetPrice ?? undefined,
      listId: this.route.snapshot.queryParamMap.get('listId') ?? undefined,
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: offer => {
          this.toast.success(this.translate.instant('ADD_OFFER.ADDED'));
          this.goToCandidates(offer.productId, offer.listId);
        },
        error: (err: HttpErrorResponse) =>
          this.toast.error(err.error?.message ?? err.error?.detail ?? this.translate.instant('COMMON.ERROR_GENERIC')),
      });
  }

  openStore(store: StoreCapabilities): void {
    this.bridge.openStore(store.homeUrl);
  }

  openExtensionDialog(): void {
    this.dialog.open(ExtensionDialogComponent, { width: '480px' });
  }

  private goToCandidates(productId: string, listId?: string | null): void {
    const commands = ['/products', productId, 'candidates'];
    if (listId) this.router.navigate(commands, { queryParams: { listId } });
    else this.router.navigate(commands);
  }
}
