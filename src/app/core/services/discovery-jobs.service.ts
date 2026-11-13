import { computed, inject, Injectable, signal } from '@angular/core';
import { OfferCandidate } from '../../shared/models/candidate.model';
import { DiscoveryApiService } from './api/discovery-api.service';

export type DiscoveryJobStatus = 'running' | 'done' | 'error';

export interface DiscoveryJob {
  productId: string;
  status: DiscoveryJobStatus;
  candidates: OfferCandidate[];
  /** True depois que o usuário abriu o resultado ou dispensou o aviso: o painel deixa de mostrar o job. */
  seen: boolean;
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

    this.set({ productId, status: 'running', candidates: [], seen: false });
    this.api.discover(productId).subscribe({
      next: candidates => this.patch(productId, { status: 'done', candidates }),
      error: () => this.patch(productId, { status: 'error', candidates: [] }),
    });
  }

  markSeen(productId: string): void {
    if (this.state()[productId]) this.patch(productId, { seen: true });
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
