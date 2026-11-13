import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { DiscoveryJob, DiscoveryJobsService } from '../../../core/services/discovery-jobs.service';

/**
 * Janela pequena no canto inferior direito: mostra a busca de produtos parecidos que está rodando em segundo
 * plano (ou o resultado dela) enquanto o usuário navega por outras telas. Some da tela dos candidatos do próprio
 * produto, onde o resultado já aparece por inteiro.
 */
@Component({
  selector: 'app-discovery-panel',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    @for (job of visible(); track job.productId) {
      <div class="pill" role="status">
        <button type="button" class="open" (click)="open(job)">
          @switch (job.status) {
            @case ('running') { <mat-spinner diameter="18" /> }
            @case ('error') { <mat-icon class="err">error_outline</mat-icon> }
            @default { <mat-icon class="ok">{{ job.candidates.length > 0 ? 'check_circle' : 'info' }}</mat-icon> }
          }
          <span>{{ messageKey(job) | translate: { count: job.candidates.length } }}</span>
        </button>
        <button type="button" class="close" [attr.aria-label]="'DISCOVERY_PANEL.CLOSE' | translate" (click)="dismiss(job)">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    }
  `,
  styles: [`
    :host { position: fixed; right: 16px; bottom: 16px; z-index: 1000; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
    .pill { display: flex; align-items: center; background: #fff; color: #333; border-radius: 24px; box-shadow: 0 2px 10px rgba(0,0,0,.25); max-width: min(360px, calc(100vw - 32px)); }
    .open, .close { border: 0; background: transparent; cursor: pointer; color: inherit; font: inherit; }
    .open { display: flex; align-items: center; gap: 8px; padding: 10px 6px 10px 14px; text-align: left; font-size: 13px; }
    .close { display: flex; padding: 8px 10px 8px 4px; }
    .close mat-icon { font-size: 16px; width: 16px; height: 16px; color: #999; }
    .ok { color: #00A650; } .err { color: #D32F2F; }
    .open mat-icon { font-size: 20px; width: 20px; height: 20px; }
  `],
})
export class DiscoveryPanelComponent {
  private readonly jobs = inject(DiscoveryJobsService);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url },
  );

  readonly visible = computed(() => {
    const current = this.url().split('?')[0];
    return this.jobs.jobs().filter(job =>
      (job.status === 'running' || !job.seen) && current !== `/products/${job.productId}/candidates`);
  });

  messageKey(job: DiscoveryJob): string {
    if (job.status === 'running') return 'DISCOVERY_PANEL.RUNNING';
    if (job.status === 'error') return 'DISCOVERY_PANEL.ERROR';
    if (job.candidates.length === 0) return 'DISCOVERY_PANEL.NONE';
    return job.candidates.length === 1 ? 'DISCOVERY_PANEL.FOUND_ONE' : 'DISCOVERY_PANEL.FOUND_MANY';
  }

  open(job: DiscoveryJob): void {
    this.router.navigate(['/products', job.productId, 'candidates']);
  }

  dismiss(job: DiscoveryJob): void {
    this.jobs.markSeen(job.productId);
  }
}
