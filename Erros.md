# PriceWatchSPA — Erros Corrigidos

**2026-05-07 · Fase 3 · ng2-charts incompatível com Angular 20**
- Erro: `npm install ng2-charts` falha com peer dependency conflict
- Causa: ng2-charts@10 exige `@angular/core >= 21.0.0`; projeto usa Angular 20.3.10
- Correção: Usar Chart.js diretamente, sem wrapper Angular. Componente `PriceHistoryComponent` encapsula a instância de `Chart` via `ElementRef + ngAfterViewInit`

**2026-05-07 · Fase 3 · @ngx-translate/http-loader v17 — API mudou**
- Erro: `TS2554: Expected 0 arguments, but got 3` no construtor de `TranslateHttpLoader`
- Causa: @ngx-translate/http-loader v17 eliminou o construtor com `(HttpClient, prefix, suffix)`; agora usa DI automática e configuração via token
- Correção: Substituir factory manual por `provideTranslateHttpLoader({ prefix, suffix })` + `provideTranslateService({ defaultLanguage })` no `appConfig`

**2026-05-07 · Fase 3 · @angular/animations ausente**
- Erro: `Could not resolve "@angular/animations/browser"` no build
- Causa: `provideAnimationsAsync()` importado mas `@angular/animations` não estava na lista de dependências instaladas
- Correção: `npm install @angular/animations --legacy-peer-deps`
