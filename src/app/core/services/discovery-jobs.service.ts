import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { OfferCandidate } from '../../shared/models/candidate.model';
import { DiscoveryApiService } from './api/discovery-api.service';

export type DiscoveryJobStatus = 'running' | 'done' | 'error';

export interface DiscoveryJob {
  productId: string;
  status: DiscoveryJobStatus;
  candidates: OfferCandidate[];
  /** True depois que o usuário viu o resultado (na própria tela) ou dispensou o aviso: o painel deixa de mostrá-lo. */
  seen: boolean;
  /** True quando é uma "nova busca" (traz só o que ainda não apareceu). */
  fromRefresh: boolean;
  /** Ids das candidatas que chegaram na nova busca (as demais já estavam na lista). */
  newIds: string[];
  /** Por que a nova busca não rodou: pausa entre buscas ou erro. A lista anterior continua valendo. */
  failure?: 'cooldown' | 'error';
}

/**
 * Guarda a busca de produtos parecidos fora das telas: sair da página não perde o resultado, e o painel do
 * canto da tela avisa quando termina. A API roda a busca até o fim mesmo se o navegador sair da tela.
 */
@Injectable({ providedIn: 'root' })
export class DiscoveryJobsService {
  private readonly api = inject(DiscoveryApiService);
  private readonly state = signal<Record<string, DiscoveryJob>>({});

  readonly jobs = computed(() => Object.values(this.state()));

  job(productId: string): DiscoveryJob | undefined {
    return this.state()[productId];
  }

  /** Começa a busca do produto; se já há uma rodando, reaproveita (a API não aceita duas ao mesmo tempo). */
  start(productId: string): void {
    if (this.state()[productId]?.status === 'running') return;

    this.set({ productId, status: 'running', candidates: [], seen: false, fromRefresh: false, newIds: [] });
    this.api.discover(productId).subscribe({
      next: candidates => this.patch(productId, { status: 'done', candidates }),
      error: () => this.patch(productId, { status: 'error', candidates: [] }),
    });
  }

  /**
   * Nova busca: traz só produtos parecidos que ainda não apareceram. A lista atual continua na tela enquanto
   * a busca roda; se ela falhar (pausa entre buscas, erro), a lista atual é mantida.
   */
  refresh(productId: string): void {
    const job = this.state()[productId];
    if (!job || job.status === 'running') return;

    const previousIds = new Set(job.candidates.map(c => c.id));
    this.set({ ...job, status: 'running', seen: false, fromRefresh: true, newIds: [], failure: undefined });
    this.api.discover(productId, true).subscribe({
      next: candidates => this.patch(productId, {
        status: 'done', candidates, newIds: candidates.filter(c => !previousIds.has(c.id)).map(c => c.id),
      }),
      error: (err: HttpErrorResponse) => this.patch(productId, {
        status: 'done', newIds: [], failure: err?.status === 429 ? 'cooldown' : 'error',
      }),
    });
  }

  markSeen(productId: string): void {
    const job = this.state()[productId];
    if (job && !job.seen) this.patch(productId, { seen: true });
  }

  removeCandidate(productId: string, candidateId: string): void {
    const job = this.state()[productId];
    if (job) this.patch(productId, { candidates: job.candidates.filter(c => c.id !== candidateId) });
  }

  private set(job: DiscoveryJob): void {
    this.state.update(all => ({ ...all, [job.productId]: job }));
  }

  private patch(productId: string, changes: Partial<DiscoveryJob>): void {
    this.state.update(all => (all[productId] ? { ...all, [productId]: { ...all[productId], ...changes } } : all));
  }
}
