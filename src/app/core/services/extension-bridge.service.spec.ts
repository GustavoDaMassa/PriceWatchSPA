import { TestBed } from '@angular/core/testing';
import { ExtensionBridgeService } from './extension-bridge.service';

describe('ExtensionBridgeService', () => {
  let service: ExtensionBridgeService;
  let stopFakeExtension: (() => void) | undefined;

  /** Simula o content script da extensão respondendo ao PING. */
  function installFakeExtension(): void {
    const handler = (event: MessageEvent) => {
      if (event.source === window && event.data?.source === 'pricewatch-web' && event.data?.type === 'PING')
        window.postMessage({ source: 'pricewatch-extension', type: 'PONG', id: event.data.id }, window.location.origin);
    };
    window.addEventListener('message', handler);
    stopFakeExtension = () => window.removeEventListener('message', handler);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtensionBridgeService);
  });

  afterEach(() => stopFakeExtension?.());

  it('should report the extension as installed when it answers the ping', async () => {
    installFakeExtension();

    expect(await service.isInstalled(1000)).toBeTrue();
  });

  it('should report not installed when nobody answers before the timeout', async () => {
    expect(await service.isInstalled(60)).toBeFalse();
  });

  it('should ignore answers that carry another request id', async () => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'PING')
        window.postMessage({ source: 'pricewatch-extension', type: 'PONG', id: 'another-id' }, window.location.origin);
    };
    window.addEventListener('message', handler);
    stopFakeExtension = () => window.removeEventListener('message', handler);

    expect(await service.isInstalled(80)).toBeFalse();
  });

  it('should ignore answers that do not come from the extension', async () => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'PING')
        window.postMessage({ source: 'someone-else', type: 'PONG', id: event.data.id }, window.location.origin);
    };
    window.addEventListener('message', handler);
    stopFakeExtension = () => window.removeEventListener('message', handler);

    expect(await service.isInstalled(80)).toBeFalse();
  });

  it('should open the store in a new tab with the pw marker', () => {
    const open = spyOn(window, 'open');

    service.openStore('https://www.kabum.com.br');

    expect(open).toHaveBeenCalledTimes(1);
    const [url, target, features] = open.calls.mostRecent().args;
    expect(String(url)).toMatch(/^https:\/\/www\.kabum\.com\.br#pw=[0-9a-f-]{36}$/);
    expect(target).toBe('_blank');
    expect(features).toBe('noopener');
  });

  it('should emit the product id when the extension reports a tracked product', async () => {
    const received: string[] = [];
    const sub = service.tracked$().subscribe(e => received.push(e.productId));

    window.postMessage({ source: 'pricewatch-extension', type: 'TRACKED', productId: 'P42' }, window.location.origin);
    window.postMessage({ source: 'someone-else', type: 'TRACKED', productId: 'IGNORED' }, window.location.origin);
    await new Promise(resolve => setTimeout(resolve, 30));
    sub.unsubscribe();

    expect(received).toEqual(['P42']);
  });
});
