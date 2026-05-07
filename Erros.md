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

**2026-05-07 · Fase 7 · ngx-translate v17 — TranslateService não injetado em testes standalone**
- Erro: `NG0201: No provider found for _TranslateService` em todos os componentes com `TranslateModule`
- Causa: Em Angular 20 standalone, `TranslateModule.forRoot()` nos `imports` do TestBed não registra o serviço para componentes standalone. A v17 do ngx-translate mudou o mecanismo de injeção
- Correção: Substituir `TranslateModule.forRoot()` por `provideTranslateService({ fallbackLang: 'en' })` nos `providers` de todos os specs

**2026-05-07 · Fase 7 · Router mockado conflita com provideRouter([])**
- Erro: `TypeError: Cannot read properties of undefined (reading 'root')` em componentes com RouterLink
- Causa: Fornecer `provideRouter([])` junto com `{ provide: Router, useValue: mock }` quebra a inicialização interna do router
- Correção: Remover o mock do Router; injetar o router real via `TestBed.inject(Router)` e usar `spyOn(router, 'navigate')`

**2026-05-07 · Fase 7 · CurrencyPipe — locale pt-BR não registrado em testes**
- Erro: `NG0701: Missing locale data for the locale "pt-BR"` em componentes que usam PriceDisplayComponent
- Causa: Angular não inclui dados de locale pt-BR por padrão; `registerLocaleData` não estava sendo chamado antes dos testes
- Correção: (1) Registrar locale em `main.ts` para produção; (2) criar `src/test-setup.ts` incluído nos polyfills de teste via `tsconfig.spec.json`; (3) tornar `PriceDisplayComponent.locale()` seguro com `?? 'en'` como fallback
