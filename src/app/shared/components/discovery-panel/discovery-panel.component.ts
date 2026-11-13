import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { DiscoveryJob, DiscoveryJobsService } from '../../../core/services/discovery-jobs.service';

/**
 * Janela fixa no canto inferior direito para a busca de produtos parecidos. Enquanto a busca roda, fica
 * minimizada (só o título com o indicador); quando o resultado chega ela se abre sozinha, muda de cor e aponta
 * para a tela dos parecidos. Não some sozinha: só quando o usuário abre o resultado ou fecha. Não aparece na tela
 * dos candidatos do próprio produto, onde o resultado já está por inteiro.
 */
@Component({
  selector: 'app-discovery-panel',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    @for (job of visible(); track job.productId) {
      <section class="win" [class.ready]="isReady(job)" [class.failed]="job.status === 'error' || job.failure === 'error'" role="status" aria-live="polite">
        <header>
          @switch (job.status) {
            @case ('running') { <mat-spinner diameter="18" /> }
            @case ('error') { <mat-icon>error_outline</mat-icon> }
            @default { <mat-icon>{{ isReady(job) ? 'check_circle' : 'info' }}</mat-icon> }
          }
          <strong>{{ 'DISCOVERY_PANEL.TITLE' | translate }}</strong>
          @if (job.status === 'running') {
            <button type="button" class="icon" (click)="toggle(job)"
                    [attr.aria-label]="(isOpen(job) ? 'DISCOVERY_PANEL.MINIMIZE' : 'DISCOVERY_PANEL.EXPAND') | translate">
              <mat-icon>{{ isOpen(job) ? 'expand_more' : 'expand_less' }}</mat-icon>
            </button>
          }
          <button type="button" class="icon" [attr.aria-label]="'DISCOVERY_PANEL.CLOSE' | translate" (click)="dismiss(job)">
            <mat-icon>close</mat-icon>
          </button>
        </header>
        @if (isOpen(job)) {
          <div class="body">
            <p>{{ messageKey(job) | translate: { count: found(job) } }}</p>
            @if (isReady(job)) {
              <button mat-flat-button class="cta" (click)="open(job)">{{ 'DISCOVERY_PANEL.VIEW' | translate }}</button>
            } @else if (job.status === 'error' || job.failure === 'error') {
              <button mat-stroked-button (click)="open(job)">{{ 'DISCOVERY_PANEL.RETRY' | translate }}</button>
            } @else if (job.status === 'done') {
              <button mat-stroked-button (click)="dismiss(job)">{{ 'DISCOVERY_PANEL.OK' | translate }}</button>
            }
          </div>
        }
      </section>
    }
  `,
  styles: [`
    :host { position: fixed; right: 16px; bottom: 16px; z-index: 1000; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
    .win { width: 300px; max-width: calc(100vw - 32px); background: #fff; color: #333; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 4px 16px rgba(0,0,0,.25); overflow: hidden; }
    header { display: flex; align-items: center; gap: 8px; padding: 10px 8px 10px 12px; background: #3483FA; color: #fff; font-size: 14px; }
    header strong { flex: 1; font-weight: 500; }
    header mat-icon { font-size: 20px; width: 20px; height: 20px; }
    header ::ng-deep .mdc-circular-progress__determinate-circle, header ::ng-deep circle { stroke: #fff; }
    .icon { display: flex; border: 0; background: transparent; color: inherit; cursor: pointer; padding: 2px; border-radius: 50%; }
    .body { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
    .body p { margin: 0; font-size: 13px; line-height: 1.4; }
    .cta { background: #00A650 !important; color: #fff !important; }
    .win.ready { border-color: #00A650; animation: pulse 1.2s ease-out 2; }
    .win.ready header { background: #00A650; }
    .win.failed header { background: #D32F2F; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0,166,80,.6); } 100% { box-shadow: 0 0 0 14px rgba(0,166,80,0); } }
    @media (prefers-reduced-motion: reduce) { .win.ready { animation: none; } }
  `],
})
export class DiscoveryPanelComponent {
  private readonly jobs = inject(DiscoveryJobsService);
  private readonly router = inject(Router);

  /** Produtos cujo painel o usuário abriu à mão enquanto a busca ainda roda (por padrão fica minimizado). */
  private readonly expandedWhileRunning = signal<ReadonlySet<string>>(new Set());

  private readonly url = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url },
  );

  readonly visible = computed(() => {
    const current = this.url().split('?')[0];
    return this.jobs.jobs().filter(job =>
      (job.status === 'running' || !job.seen) && current !== `/products/${job.productId}/candidates`);
  });

  /** Quantos produtos o aviso conta: numa nova busca, só os que chegaram agora. */
  found(job: DiscoveryJob): number {
    return job.fromRefresh ? job.newIds.length : job.candidates.length;
  }

  isReady(job: DiscoveryJob): boolean {
    return job.status === 'done' && !job.failure && this.found(job) > 0;
  }

  /** Minimizada enquanto roda; aberta assim que termina (é o aviso de que o resultado chegou). */
  isOpen(job: DiscoveryJob): boolean {
    return job.status !== 'running' || this.expandedWhileRunning().has(job.productId);
  }

  toggle(job: DiscoveryJob): void {
    this.expandedWhileRunning.update(set => {
      const next = new Set(set);
      if (!next.delete(job.productId)) next.add(job.productId);
      return next;
    });
  }

  messageKey(job: DiscoveryJob): string {
    const fresh = job.fromRefresh;
    if (job.status === 'running') return fresh ? 'DISCOVERY_PANEL.RUNNING_NEW' : 'DISCOVERY_PANEL.RUNNING';
    if (job.status === 'error' || job.failure === 'error') return 'DISCOVERY_PANEL.ERROR';
    if (job.failure === 'cooldown') return 'DISCOVERY_PANEL.COOLDOWN';
    if (job.failure === 'exhausted') return 'DISCOVERY_PANEL.EXHAUSTED';
    const count = this.found(job);
    if (count === 0) return fresh ? 'DISCOVERY_PANEL.NONE_NEW' : 'DISCOVERY_PANEL.NONE';
    if (count === 1) return fresh ? 'DISCOVERY_PANEL.FOUND_NEW_ONE' : 'DISCOVERY_PANEL.FOUND_ONE';
    return fresh ? 'DISCOVERY_PANEL.FOUND_NEW_MANY' : 'DISCOVERY_PANEL.FOUND_MANY';
  }

  open(job: DiscoveryJob): void {
    this.router.navigate(['/products', job.productId, 'candidates']);
  }

  dismiss(job: DiscoveryJob): void {
    this.jobs.markSeen(job.productId);
  }
}
