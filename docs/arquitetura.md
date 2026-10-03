# PriceWatchSPA — Arquitetura

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Angular 20.3.10 |
| UI Components | Angular Material 20 (MD3) |
| Estilo | SCSS, Angular Material custom theme |
| Internacionalização | @ngx-translate/core v17 + @ngx-translate/http-loader v17 |
| Gráficos | Chart.js 4 (direto, sem wrapper) |
| HTTP | Angular HttpClient + interceptor funcional |
| Estado | Angular Signals (signal, computed) |
| Roteamento | Angular Router com lazy loading (loadComponent) |
| Deploy | Vercel |
| API | PriceWatch (.NET 8, REST, JWT HS256) |

## Estrutura de Pastas

```
src/app/
├── core/
│   ├── guards/          auth.guard, guest.guard
│   ├── interceptors/    auth.interceptor (JWT + 401)
│   └── services/        auth, notification-polling, theme, language, toast
├── shared/
│   ├── components/      confirm-dialog, empty-state, price-display, skeleton, source-badge
│   ├── models/          auth, product-list, tracked-product, notification, user, error-response
│   └── pipes/           price, relative-date
├── features/
│   ├── auth/            login, register, verify-email
│   ├── dashboard/
│   ├── lists/           list-overview, list-detail, list-analysis
│   ├── products/        add-product, edit-product, price-history
│   ├── notifications/
│   └── profile/         profile-overview, change-password, change-email, delete-account
└── shell/               layout autenticado (header + router-outlet)
```

## Rotas

```
/auth/login               pública (guest guard)
/auth/register            pública (guest guard)
/verify-email             pública sem guard
/dashboard                protegida (auth guard)
/lists                    protegida
/lists/:id                protegida
/lists/:id/analysis       protegida
/notifications            protegida
/profile                  protegida
/profile/change-password  protegida
/profile/change-email     protegida
/profile/delete-account   protegida
```

## Paleta de Cores (Mercado Livre inspired)

| Token CSS | Light | Dark |
|---|---|---|
| `--pw-yellow` | `#FFE600` | `#FFE600` |
| `--pw-bg` | `#EBEBEB` | `#1a1a1a` |
| `--pw-surface` | `#FFFFFF` | `#2d2d2d` |
| `--pw-success` | `#00A650` | `#00A650` |
| `--pw-error` | `#F23D4F` | `#F23D4F` |

## Diagrama de Arquitetura

```mermaid
graph TB
    subgraph Browser
        subgraph Core
            AS[AuthService\nsignal: currentUser]
            NPS[NotificationPollingService\ninterval 30s]
            AI[auth.interceptor\nJWT + 401 handler]
            TS[ThemeService\ndark/light]
            LS[LanguageService\npt-BR / en]
        end

        subgraph Shell
            HDR[Header\nbadge + toggle tema/idioma]
            OUT[router-outlet]
        end

        subgraph Features
            DASH[Dashboard]
            LISTS[Lists]
            PRODS[Products + Chart.js]
            NOTIF[Notifications]
            PROF[Profile]
        end
    end

    subgraph PriceWatch API
        AUTH_EP[/api/auth/*]
        LISTS_EP[/api/lists/*]
        PRODS_EP[/api/lists/:id/products/*]
        NOTIF_EP[/api/notifications/*]
        USERS_EP[/api/users/me*]
    end

    AS --> AI
    DASH --> LISTS_EP & NOTIF_EP
    LISTS --> LISTS_EP
    PRODS --> PRODS_EP
    NOTIF --> NOTIF_EP
    PROF --> USERS_EP
    NPS --> NOTIF_EP
    NPS --> HDR
```

## Fluxo da v1 (implementado em 03/10/2026)

Detalhes de API em `priceWatchAPI/docs/arquitetura.md`. O fluxo novo exige a API com `Features__UnifiedCatalogEnabled=true` (o `start-dev.sh` já liga por padrão).

### Telas e rotas

| Rota | Componente | O que faz |
|---|---|---|
| `/add` | `AddOfferComponent` | Cola o link (a API normaliza, segue link curto e identifica a loja) e preço-alvo opcional; `?listId=` mantém a lista. Abaixo, "escolha uma loja" (só as com `canFetchByUrl`), que depende da extensão. Depois de adicionar, vai para os candidatos |
| `/products/:productId/candidates` | `CandidateReviewComponent` | Roda a descoberta (`POST .../discover`), lista as candidatas e deixa confirmar ("é o mesmo — acompanhar") ou descartar; mostra o resultado do voto (anexada, aguardando outro usuário, já pertence a outro produto, descartada) |
| `/products/:productId/comparison` | `ProductComparisonComponent` | Ofertas lado a lado, a mais barata destacada, "atualizado há X" por oferta (RNF18) e a nota de que o preço pode ter atraso; "Buscar em outras lojas" volta aos candidatos |

`productId` é o do produto-mestre. Itens da lista legada (`TrackedProduct` na SPA) carregam `productId` (aditivo, nulo no modelo legado); o card ganha **Comparar lojas** no menu só quando existe.

### Saída para a loja (RF17)
Nenhuma tela abre a URL da loja direto. Comparação e diálogo "abrir na plataforma" abrem a aba **antes** da chamada assíncrona (senão o navegador bloqueia o pop-up), chamam `POST /api/offers/{id}/click` ou `POST /api/products/{id}/click` e só então apontam a aba para a URL devolvida (link de afiliado, quando há rede), com `opener` zerado.

### Serviços novos (`core/services`)
`api/stores-api`, `api/offers-api` (importar, comparação, clique), `api/discovery-api` (descobrir, candidatas, voto), `products-api.click` e `extension-bridge`.

### Protocolo com a extensão (`ExtensionBridgeService`)
Troca de mensagens por `window.postMessage` na própria origem do site. O content script da extensão precisa rodar também nesta origem (`matches` do site e de `localhost:4200`) e só aceitar mensagens com `event.source === window`.

| Direção | Mensagem | Quando |
|---|---|---|
| Site → extensão | `{ source: "pricewatch-web", type: "PING", id }` | O site pergunta se a extensão está instalada (timeout de 800 ms) |
| Extensão → site | `{ source: "pricewatch-extension", type: "PONG", id, version }` | Resposta com o mesmo `id` |
| Extensão → site | `{ source: "pricewatch-extension", type: "TRACKED", productId }` | Depois de acompanhar um produto no fluxo "abrir a loja"; o site vai para os candidatos |

"Abrir a loja": o site abre `<homeUrl>#pw=<uuid>` em aba nova; a extensão reconhece o marcador, mostra o botão "Acompanhar com PriceWatch" em destaque, envia o produto para a API, foca a aba do site e manda o `TRACKED`. Sem extensão, os botões de loja ficam desativados com o convite para instalar e o fluxo é só colar o link.

### Deploy
O alvo é a **Cloudflare Pages** (o plano gratuito permite uso comercial; a Vercel Hobby não). `public/_redirects` (`/* /index.html 200`) faz o fallback da SPA. Configuração no painel: comando `npm ci --legacy-peer-deps && npm run build`, diretório de saída `dist/PriceWatchSPA/browser`, `environment.prod.ts` apontando para a API de produção. O `vercel.json` continua até a migração.

## Decisões Técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| JWT storage | localStorage | Backend não suporta httpOnly cookie |
| Token expiry | Decode local antes de cada request | Evita request com token já expirado |
| Polling | RxJS interval(30s) + takeUntilDestroyed | Backend sem SSE/WebSocket |
| Charts | Chart.js direto (sem wrapper) | ng2-charts requer Angular 21+ |
| Toasts | MatSnackBar via ToastService | Reaproveitamento do Material |
| Tema | mat.theme() com class="dark" no html | Padrão MD3 para dark/light |
| Idioma | navigator.language + localStorage | UX automática sem perguntar |
| State | Signals (signal, computed) | Escala suficiente, sem NgRx |
| ngx-translate | v17 com provideTranslateService() | Nova API standalone-friendly |
