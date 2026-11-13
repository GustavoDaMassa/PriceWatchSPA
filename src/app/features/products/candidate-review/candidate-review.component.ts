import { Component, computed, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DiscoveryApiService } from '../../../core/services/api/discovery-api.service';
import { DiscoveryJobsService } from '../../../core/services/discovery-jobs.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display.component';
import { SourceBadgeComponent } from '../../../shared/components/source-badge/source-badge.component';
import { ConfirmOutcome, OfferCandidate } from '../../../shared/models/candidate.model';

/**
 * "Produtos parecidos": mostra as ofertas candidatas e deixa o usuário aceitar (e acompanhar como um
 * produto novo, na mesma lista) ou descartar. Só o próprio usuário decide. Candidatas não são monitoradas até aceitar.
 */
@Component({
  selector: 'app-candidate-review',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule,
    EmptyStateComponent, PriceDisplayComponent, SourceBadgeComponent,
  ],
  template: `
    <div class="review-page">
      <h1>{{ 'CANDIDATES.TITLE' | translate }}</h1>

      @if (loading()) {
        <div class="center">
          <mat-spinner diameter="40" />
          <p>{{ 'CANDIDATES.SEARCHING' | translate }}</p>
        </div>
      } @else {
        @if (candidates().length > 0) {
          <p class="note"><mat-icon>info</mat-icon>{{ 'CANDIDATES.NOTE' | translate }}</p>
        }
        @if (refreshNote(); as note) {
          <p class="note fresh"><mat-icon>travel_explore</mat-icon>{{ note.key | translate: { count: note.count } }}</p>
        }

        @for (c of candidates(); track c.id) {
          <article class="candidate">
            <div class="img">
              @if (c.imageUrl) { <img [src]="c.imageUrl" [alt]="c.name" loading="lazy" /> }
              @else { <mat-icon>image</mat-icon> }
            </div>
            <div class="info">
              <app-source-badge [source]="c.source" />
              <p class="name">{{ c.name }} @if (isNew(c)) { <span class="new-badge">{{ 'CANDIDATES.NEW_BADGE' | translate }}</span> }</p>
              <app-price-display [value]="c.price" />
              <span class="reason" [class.strong]="c.reason === 0">
                {{ (c.reason === 0 ? 'CANDIDATES.REASON_GTIN' : 'CANDIDATES.REASON_KEYWORD') | translate }}
              </span>
              @if (c.aiReason) {
                <span class="ai"><mat-icon>auto_awesome</mat-icon>{{ 'CANDIDATES.AI_SAYS' | translate }} {{ c.aiReason }}</span>
              }
            </div>
            <div class="actions">
              <button mat-flat-button class="btn-yes" [disabled]="busy().has(c.id)" (click)="answer(c, true)">
                {{ 'CANDIDATES.SAME' | translate }}
              </button>
              <button mat-stroked-button [disabled]="busy().has(c.id)" (click)="answer(c, false)">
                {{ 'CANDIDATES.NOT_SAME' | translate }}
              </button>
            </div>
          </article>
        } @empty {
          <app-empty-state icon="travel_explore" [message]="'CANDIDATES.EMPTY' | translate" />
        }

        <div class="footer">
          <button mat-stroked-button class="find-new" [disabled]="refreshing()" (click)="findNew()">
            @if (refreshing()) { <mat-spinner diameter="16" /> }
            {{ (refreshing() ? 'CANDIDATES.NEW_SEARCHING' : 'CANDIDATES.NEW_BUTTON') | translate }}
          </button>
          @if (attached()) {
            <button mat-flat-button class="btn-primary" (click)="goToList()">
              {{ 'CANDIDATES.COMPARE' | translate }}
            </button>
          }
          <button mat-button (click)="finish()">{{ 'CANDIDATES.SKIP' | translate }}</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .review-page { max-width: 760px; margin: 0 auto; padding-bottom: 32px; }
    h1 { margin: 0 0 12px; font-size: 22px; font-weight: 300; color: #333; }
    .center { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 0; color: #666; }
    .note { display: flex; align-items: center; gap: 6px; margin: 0 0 12px; padding: 8px 12px; background: #EAF0FB; border-radius: 4px; font-size: 13px; color: #333; }
    .note mat-icon { font-size: 18px; width: 18px; height: 18px; color: #3483FA; }
    .candidate { display: grid; grid-template-columns: 96px 1fr auto; gap: 16px; align-items: center; background: #fff; border-radius: 6px; padding: 12px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,.1); }
    .img { width: 96px; height: 96px; display: flex; align-items: center; justify-content: center; border: 1px solid #f0f0f0; border-radius: 4px; }
    .img img { width: 100%; height: 100%; object-fit: contain; }
    .img mat-icon { font-size: 40px; width: 40px; height: 40px; color: #ddd; }
    .info { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .name { margin: 0; font-size: 14px; color: #333; line-height: 1.35; }
    .reason { font-size: 12px; color: #666; }
    .new-badge { display: inline-block; margin-left: 6px; padding: 1px 8px; border-radius: 10px; background: #00A650; color: #fff; font-size: 11px; font-weight: 600; }
    .note.fresh { background: #E8F5EE; }
    .find-new { display: inline-flex; align-items: center; gap: 8px; margin-right: auto; }
    .reason.strong { color: #00A650; font-weight: 600; }
    .ai { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #5B3FD0; }
    .ai mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .actions { display: flex; flex-direction: column; gap: 8px; }
    .btn-yes { background: #3483FA !important; color: #fff !important; }
    .btn-primary { background: var(--pw-yellow); color: #333; }
    .footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    @media (max-width: 600px) {
      .candidate { grid-template-columns: 72px 1fr; }
      .img { width: 72px; height: 72px; }
      .actions { grid-column: 1 / -1; flex-direction: row; }
      .actions button { flex: 1; }
    }
  `],
})
export class CandidateReviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly discoveryApi = inject(DiscoveryApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly productId = this.route.snapshot.paramMap.get('productId')!;
  private readonly listId = this.route.snapshot.queryParamMap.get('listId');
  private readonly jobs = inject(DiscoveryJobsService);
  private readonly job = computed(() => this.jobs.job(this.productId));
  readonly candidates = computed<OfferCandidate[]>(() => this.job()?.candidates ?? []);
  /** Tela cheia de espera só na primeira busca; numa nova busca a lista atual continua visível. */
  readonly loading = computed(() => !this.job() || (this.job()!.status === 'running' && !this.job()!.fromRefresh));
  readonly refreshing = computed(() => this.job()?.status === 'running' && !!this.job()?.fromRefresh);
  private readonly newIds = computed(() => new Set(this.job()?.newIds ?? []));

  /** Aviso do resultado da última nova busca (só aparece depois que ela termina). */
  readonly refreshNote = computed<{ key: string; count: number } | null>(() => {
    const job = this.job();
    if (!job || !job.fromRefresh || job.status !== 'done') return null;
    if (job.failure === 'cooldown') return { key: 'CANDIDATES.NEW_COOLDOWN', count: 0 };
    if (job.failure === 'error') return { key: 'CANDIDATES.NEW_ERROR', count: 0 };
    if (job.newIds.length === 0) return { key: 'CANDIDATES.NEW_NONE', count: 0 };
    return { key: job.newIds.length === 1 ? 'CANDIDATES.NEW_FOUND_ONE' : 'CANDIDATES.NEW_FOUND_MANY', count: job.newIds.length };
  });
  readonly busy = signal<Set<string>>(new Set());
  private readonly attachedCount = signal(0);
  readonly attached = computed(() => this.attachedCount() > 0);

  private readonly status = computed(() => this.job()?.status);

  constructor() {
    effect(() => {
      if (this.status() === 'error') this.toast.error(this.translate.instant('COMMON.ERROR_GENERIC'));
    });
    // só vale como "visto" o resultado que chegou com esta tela aberta: se o usuário saiu antes, o painel do canto avisa
    effect(() => {
      if (this.status() === 'done' || this.status() === 'error') untracked(() => this.jobs.markSeen(this.productId));
    });
  }

  /** A busca roda no serviço (não na tela): sair daqui não a interrompe e o painel do canto avisa quando acabar. */
  ngOnInit(): void {
    this.jobs.start(this.productId);
  }

  isNew(candidate: OfferCandidate): boolean {
    return this.newIds().has(candidate.id);
  }

  findNew(): void {
    this.jobs.refresh(this.productId);
  }

  answer(candidate: OfferCandidate, isSameProduct: boolean): void {
    this.busy.update(ids => new Set(ids).add(candidate.id));

    this.discoveryApi.sendFeedback(candidate.id, { isSameProduct, track: isSameProduct }).subscribe({
      next: result => {
        this.jobs.removeCandidate(this.productId, candidate.id);
        if (result.outcome === ConfirmOutcome.Attached) this.attachedCount.update(n => n + 1);
        this.toast.success(this.translate.instant(this.outcomeMessageKey(result.outcome)));
        this.releaseBusy(candidate.id);
      },
      error: () => {
        this.toast.error(this.translate.instant('COMMON.ERROR_GENERIC'));
        this.releaseBusy(candidate.id);
      },
    });
  }

  /** O produto aceito entra na mesma lista do original: a análise da lista mostra os dois lado a lado. */
  goToList(): void {
    this.router.navigate(this.listId ? ['/lists', this.listId, 'analysis'] : ['/items']);
  }

  finish(): void {
    this.router.navigate(['/items']);
  }

  private releaseBusy(id: string): void {
    this.busy.update(ids => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
  }

  private outcomeMessageKey(outcome: ConfirmOutcome): string {
    switch (outcome) {
      case ConfirmOutcome.Attached: return 'CANDIDATES.OUTCOME_ATTACHED';
      case ConfirmOutcome.Rejected: return 'CANDIDATES.OUTCOME_REJECTED';
      default: return 'CANDIDATES.OUTCOME_RECORDED';
    }
  }
}
