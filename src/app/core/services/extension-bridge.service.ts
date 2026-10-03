import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const WEB = 'pricewatch-web';
const EXTENSION = 'pricewatch-extension';

/**
 * Ponte com a extensão do Chrome. O site e a extensão trocam mensagens por <c>window.postMessage</c>
 * (o content script da extensão roda nesta página): o site pergunta (PING) e a extensão responde (PONG).
 * Sem a extensão instalada ninguém responde, e o fluxo cai no "colar o link".
 */
@Injectable({ providedIn: 'root' })
export class ExtensionBridgeService {
  /** True se a extensão respondeu dentro do tempo limite. */
  isInstalled(timeoutMs = 800): Promise<boolean> {
    const id = crypto.randomUUID();

    return new Promise<boolean>(resolve => {
      const finish = (installed: boolean) => {
        clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        resolve(installed);
      };
      const onMessage = (event: MessageEvent) => {
        if (event.source === window && event.data?.source === EXTENSION && event.data?.type === 'PONG' && event.data?.id === id)
          finish(true);
      };
      const timer = setTimeout(() => finish(false), timeoutMs);

      window.addEventListener('message', onMessage);
      window.postMessage({ source: WEB, type: 'PING', id }, window.location.origin);
    });
  }

  /**
   * Abre a loja em outra aba com um marcador (#pw=...) que a extensão reconhece para mostrar o botão
   * "Acompanhar com PriceWatch" em destaque e, depois do clique, devolver o usuário a esta aba.
   */
  openStore(homeUrl: string): void {
    window.open(`${homeUrl}#pw=${crypto.randomUUID()}`, '_blank', 'noopener');
  }

  /** Emite o id do produto toda vez que a extensão avisa que um produto foi acompanhado na loja. */
  tracked$(): Observable<{ productId: string }> {
    return new Observable(subscriber => {
      const onMessage = (event: MessageEvent) => {
        if (event.source === window && event.data?.source === EXTENSION && event.data?.type === 'TRACKED' && event.data?.productId)
          subscriber.next({ productId: event.data.productId });
      };
      window.addEventListener('message', onMessage);
      return () => window.removeEventListener('message', onMessage);
    });
  }
}
