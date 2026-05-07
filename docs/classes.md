# PriceWatchSPA — Mapa de Classes

<details id="dir-root">
<summary><strong>/ (raiz)</strong></summary>
<blockquote>

- [angular.json](../angular.json) — configuração do Angular CLI (build, serve, test; fileReplacements para prod)
- [package.json](../package.json) — dependências npm
- [tsconfig.json](../tsconfig.json) — configuração TypeScript base
- [.env.example](../.env.example) — variáveis de ambiente necessárias
- [Erros.md](../Erros.md) — bugs corrigidos durante o desenvolvimento

</blockquote>
</details>

<details id="dir-docs">
<summary><strong>docs/</strong></summary>
<blockquote>

- [requisitos.md](requisitos.md) — RF, RNF, RI e impacto no backend
- [arquitetura.md](arquitetura.md) — stack, estrutura, rotas, paleta, decisões técnicas
- [classes.md](classes.md) — este arquivo

</blockquote>
</details>

<details id="dir-environments">
<summary><strong>src/environments/</strong></summary>
<blockquote>

- [environment.ts](../src/environments/environment.ts) — `{ production: false, apiUrl, pollIntervalMs }`
- [environment.prod.ts](../src/environments/environment.prod.ts) — `{ production: true, apiUrl, pollIntervalMs }`

</blockquote>
</details>

<details id="dir-assets">
<summary><strong>src/assets/i18n/</strong></summary>
<blockquote>

- [pt-BR.json](../src/assets/i18n/pt-BR.json) — traduções em português brasileiro
- [en.json](../src/assets/i18n/en.json) — traduções em inglês

</blockquote>
</details>

<details id="dir-styles">
<summary><strong>src/styles/</strong></summary>
<blockquote>

- [_theme.scss](../src/styles/theme.scss) — tema Angular Material MD3 (light + dark) com paleta ML (#FFE600)
- [_variables.scss](../src/styles/variables.scss) — breakpoints, espaçamento, border-radius, sombras

</blockquote>
</details>

## src/app

<details id="dir-app-root">
<summary><strong>src/app/</strong></summary>
<blockquote>

<details id="app-ts">
<summary><strong><a href="../src/app/app.ts">app.ts</a></strong></summary>
<blockquote>

<details><summary>classe</summary><blockquote>

`App` — componente raiz, inicializa [ThemeService](#theme-service-ts) e [LanguageService](#language-service-ts) no `ngOnInit`

</blockquote></details>

<details><summary>dependencias</summary><blockquote>

- [ThemeService](#theme-service-ts)
- [LanguageService](#language-service-ts)

</blockquote></details>

</blockquote>
</details>

- [app.config.ts](../src/app/app.config.ts) — providers globais: `provideRouter`, `provideHttpClient(withInterceptors([authInterceptor]))`, `provideAnimationsAsync`, `provideTranslateService`, `provideTranslateHttpLoader`
- [app.routes.ts](../src/app/app.routes.ts) — rotas raiz com lazy loading; protegidas por [authGuard](#auth-guard-ts); públicas por [guestGuard](#guest-guard-ts)

</blockquote>
</details>

### src/app/core

<details id="dir-core-guards">
<summary><strong>src/app/core/guards/</strong></summary>
<blockquote>

<details id="auth-guard-ts">
<summary><strong><a href="../src/app/core/guards/auth.guard.ts">auth.guard.ts</a></strong></summary>
<blockquote>

<details><summary>funcao</summary><blockquote>

`authGuard: CanActivateFn` — verifica se [AuthService](#auth-service-ts).`isAuthenticated()` e token não expirado; redireciona para `/auth/login` se não

</blockquote></details>

</blockquote>
</details>

<details id="guest-guard-ts">
<summary><strong><a href="../src/app/core/guards/guest.guard.ts">guest.guard.ts</a></strong></summary>
<blockquote>

<details><summary>funcao</summary><blockquote>

`guestGuard: CanActivateFn` — redireciona usuários autenticados para `/dashboard`

</blockquote></details>

</blockquote>
</details>

</blockquote>
</details>

<details id="dir-core-interceptors">
<summary><strong>src/app/core/interceptors/</strong></summary>
<blockquote>

<details id="auth-interceptor-ts">
<summary><strong><a href="../src/app/core/interceptors/auth.interceptor.ts">auth.interceptor.ts</a></strong></summary>
<blockquote>

<details><summary>funcao</summary><blockquote>

`authInterceptor: HttpInterceptorFn` — verifica expiração do token antes de cada request; injeta `Authorization: Bearer <token>`; captura 401 e redireciona para login

</blockquote></details>

<details><summary>dependencias</summary><blockquote>

- [AuthService](#auth-service-ts)

</blockquote></details>

</blockquote>
</details>

</blockquote>
</details>

<details id="dir-core-services">
<summary><strong>src/app/core/services/</strong></summary>
<blockquote>

<details id="auth-service-ts">
<summary><strong><a href="../src/app/core/services/auth.service.ts">auth.service.ts</a></strong></summary>
<blockquote>

<details><summary>classe</summary><blockquote>

`AuthService` (`providedIn: 'root'`) — gerencia sessão JWT no localStorage

</blockquote></details>

<details><summary>atributos</summary><blockquote>

- `currentUser: Signal<CurrentUser | null>` — usuário atual (null = não autenticado)
- `isAuthenticated: Signal<boolean>` — computed de `currentUser`

</blockquote></details>

<details><summary>metodos</summary><blockquote>

- `login(response: AuthResponse): void` — persiste usuário e atualiza signal
- `logout(): void` — limpa localStorage e signal
- `getToken(): string | null`
- `isTokenExpired(): boolean` — decode local do JWT (campo `exp`)

</blockquote></details>

<details><summary>tipos</summary><blockquote>

- [AuthResponse](#auth-model-ts), [CurrentUser](#auth-model-ts)

</blockquote></details>

</blockquote>
</details>

<details id="notification-polling-service-ts">
<summary><strong><a href="../src/app/core/services/notification-polling.service.ts">notification-polling.service.ts</a></strong></summary>
<blockquote>

<details><summary>classe</summary><blockquote>

`NotificationPollingService` (`providedIn: 'root'`) — polling de 30s para notificações não lidas

</blockquote></details>

<details><summary>atributos</summary><blockquote>

- `unreadCount: Signal<number>` — contagem de notificações não lidas

</blockquote></details>

<details><summary>metodos</summary><blockquote>

- `start(): void` — inicia o interval; idempotente
- `stop(): void` — cancela subscription e zera contador

</blockquote></details>

<details><summary>dependencias</summary><blockquote>

- [AuthService](#auth-service-ts)

</blockquote></details>

</blockquote>
</details>

<details id="theme-service-ts">
<summary><strong><a href="../src/app/core/services/theme.service.ts">theme.service.ts</a></strong></summary>
<blockquote>

<details><summary>classe</summary><blockquote>

`ThemeService` (`providedIn: 'root'`) — controla dark/light via class `dark` no `<html>`

</blockquote></details>

<details><summary>atributos</summary><blockquote>

- `isDark: Signal<boolean>`

</blockquote></details>

<details><summary>metodos</summary><blockquote>

- `toggle(): void`
- `init(): void` — aplicar tema salvo no startup

</blockquote></details>

</blockquote>
</details>

<details id="language-service-ts">
<summary><strong><a href="../src/app/core/services/language.service.ts">language.service.ts</a></strong></summary>
<blockquote>

<details><summary>classe</summary><blockquote>

`LanguageService` (`providedIn: 'root'`) — controla idioma via ngx-translate; detecta `navigator.language`

</blockquote></details>

<details><summary>atributos</summary><blockquote>

- `current: Signal<Language>` — `'pt-BR' | 'en'`

</blockquote></details>

<details><summary>metodos</summary><blockquote>

- `init(): void` — aplica idioma salvo no startup
- `switch(lang: Language): void`

</blockquote></details>

</blockquote>
</details>

<details id="toast-service-ts">
<summary><strong><a href="../src/app/core/services/toast.service.ts">toast.service.ts</a></strong></summary>
<blockquote>

<details><summary>classe</summary><blockquote>

`ToastService` (`providedIn: 'root'`) — encapsula `MatSnackBar` para toasts de sucesso/erro

</blockquote></details>

<details><summary>metodos</summary><blockquote>

- `success(message: string): void` — 3s, panelClass `toast-success`
- `error(message: string): void` — 5s, panelClass `toast-error`

</blockquote></details>

</blockquote>
</details>

</blockquote>
</details>

### src/app/shared

<details id="dir-shared-models">
<summary><strong>src/app/shared/models/</strong></summary>
<blockquote>

<details id="auth-model-ts">
<summary><strong><a href="../src/app/shared/models/auth.model.ts">auth.model.ts</a></strong></summary>
<blockquote>

`RegisterRequest`, `LoginRequest`, `AuthResponse`, `VerifyEmailRequest`, `ResendVerificationRequest`, `CurrentUser`

</blockquote>
</details>

<details id="product-list-model-ts">
<summary><strong><a href="../src/app/shared/models/product-list.model.ts">product-list.model.ts</a></strong></summary>
<blockquote>

`ProductList`, `CreateProductListRequest`, `UpdateProductListRequest`, `AnalysisItem`

</blockquote>
</details>

<details id="tracked-product-model-ts">
<summary><strong><a href="../src/app/shared/models/tracked-product.model.ts">tracked-product.model.ts</a></strong></summary>
<blockquote>

`ProductSource` (0=ML, 1=Kabum, 2=Manual), `PRODUCT_SOURCE_LABELS`, `TrackedProduct`, `PriceSnapshot`, `AddProductRequest`, `UpdateProductRequest`

</blockquote>
</details>

<details id="notification-model-ts">
<summary><strong><a href="../src/app/shared/models/notification.model.ts">notification.model.ts</a></strong></summary>
<blockquote>

`NotificationType` (0=TargetPriceReached, 1=NewLowestPrice), `NOTIFICATION_TYPE_LABELS`, `AppNotification`

</blockquote>
</details>

<details id="user-model-ts">
<summary><strong><a href="../src/app/shared/models/user.model.ts">user.model.ts</a></strong></summary>
<blockquote>

`UserProfile`, `ChangePasswordRequest`, `ChangeEmailRequest`, `DeleteAccountRequest`

</blockquote>
</details>

<details id="error-response-model-ts">
<summary><strong><a href="../src/app/shared/models/error-response.model.ts">error-response.model.ts</a></strong></summary>
<blockquote>

`ErrorResponse { status: number; error: string; message: string }`

</blockquote>
</details>

</blockquote>
</details>

<details id="dir-shared-components">
<summary><strong>src/app/shared/components/</strong></summary>
<blockquote>

<details id="confirm-dialog-component-ts">
<summary><strong><a href="../src/app/shared/components/confirm-dialog/confirm-dialog.component.ts">confirm-dialog.component.ts</a></strong></summary>
<blockquote>

`ConfirmDialogComponent` — MatDialog com título, mensagem e botões Cancelar/Confirmar; fecha com `true`/`false`. Exporta `ConfirmDialogData { title, message, confirmLabel?, cancelLabel? }`.

</blockquote>
</details>

<details id="empty-state-component-ts">
<summary><strong><a href="../src/app/shared/components/empty-state/empty-state.component.ts">empty-state.component.ts</a></strong></summary>
<blockquote>

`EmptyStateComponent` — inputs: `message` (required), `icon` (default `'inbox'`). Centralizado com ícone 48px.

</blockquote>
</details>

<details id="price-display-component-ts">
<summary><strong><a href="../src/app/shared/components/price-display/price-display.component.ts">price-display.component.ts</a></strong></summary>
<blockquote>

`PriceDisplayComponent` — inputs: `value: number` (required), `currency: string` (default `'BRL'`). Formata via `CurrencyPipe` com locale derivado do idioma ativo no `TranslateService`.

</blockquote>
</details>

<details id="skeleton-component-ts">
<summary><strong><a href="../src/app/shared/components/skeleton/skeleton.component.ts">skeleton.component.ts</a></strong></summary>
<blockquote>

`SkeletonComponent` — inputs: `height` (default `'16px'`), `width` (default `'100%'`). Animação shimmer CSS.

</blockquote>
</details>

<details id="source-badge-component-ts">
<summary><strong><a href="../src/app/shared/components/source-badge/source-badge.component.ts">source-badge.component.ts</a></strong></summary>
<blockquote>

`SourceBadgeComponent` — input: `source: ProductSource`. Exibe `MatChip` com label e cor por fonte (amarelo=ML, laranja=Kabum, cinza=Manual).

</blockquote>
</details>

</blockquote>
</details>

<details id="dir-shared-pipes">
<summary><strong>src/app/shared/pipes/</strong></summary>
<blockquote>

<details id="relative-date-pipe-ts">
<summary><strong><a href="../src/app/shared/pipes/relative-date.pipe.ts">relative-date.pipe.ts</a></strong></summary>
<blockquote>

`RelativeDatePipe` — `transform(dateString, lang)` → "agora mesmo" / "há 3 horas" (pt-BR) ou "just now" / "3 hours ago" (en). `pure: false` para reagir a mudanças de idioma.

</blockquote>
</details>

<details id="dir-core-api-services">
<summary><strong>src/app/core/services/api/</strong></summary>
<blockquote>

<details id="auth-api-service-ts">
<summary><strong><a href="../src/app/core/services/api/auth-api.service.ts">auth-api.service.ts</a></strong></summary>
<blockquote>

`AuthApiService` — `register`, `login`, `verifyEmail`, `resendVerification`. Base: `/api/auth`.

</blockquote>
</details>

<details id="lists-api-service-ts">
<summary><strong><a href="../src/app/core/services/api/lists-api.service.ts">lists-api.service.ts</a></strong></summary>
<blockquote>

`ListsApiService` — `getLists`, `createList`, `updateList`, `deleteList`, `getAnalysis`. Base: `/api/lists`.

</blockquote>
</details>

<details id="products-api-service-ts">
<summary><strong><a href="../src/app/core/services/api/products-api.service.ts">products-api.service.ts</a></strong></summary>
<blockquote>

`ProductsApiService` — `getProducts(listId)`, `addProduct(listId, req)` em `/api/lists/:listId/products`; `updateProduct(id, req)`, `removeProduct(id)`, `getPriceHistory(id)` em `/api/products/:id` (sem listId).

</blockquote>
</details>

<details id="notifications-api-service-ts">
<summary><strong><a href="../src/app/core/services/api/notifications-api.service.ts">notifications-api.service.ts</a></strong></summary>
<blockquote>

`NotificationsApiService` — `getNotifications(isRead?)`, `markAsRead`, `markAllAsRead`. Base: `/api/notifications`.

</blockquote>
</details>

<details id="users-api-service-ts">
<summary><strong><a href="../src/app/core/services/api/users-api.service.ts">users-api.service.ts</a></strong></summary>
<blockquote>

`UsersApiService` — `getProfile`, `changePassword`, `changeEmail`, `deleteAccount`. Base: `/api/users/me`.

</blockquote>
</details>

</blockquote>
</details>

### src/app/shell

<details id="dir-shell">
<summary><strong>src/app/shell/</strong></summary>
<blockquote>

<details id="shell-component-ts">
<summary><strong><a href="../src/app/shell/shell.component.ts">shell.component.ts</a></strong></summary>
<blockquote>

<details><summary>classe</summary><blockquote>

`ShellComponent` — layout autenticado com `MatToolbar` + `router-outlet`; inicia/para polling de notificações

</blockquote></details>

<details><summary>metodos</summary><blockquote>

- `logout(): void`
- `toggleTheme(): void`
- `toggleLang(): void`

</blockquote></details>

<details><summary>dependencias</summary><blockquote>

- [AuthService](#auth-service-ts)
- [NotificationPollingService](#notification-polling-service-ts)
- [ThemeService](#theme-service-ts)
- [LanguageService](#language-service-ts)

</blockquote></details>

</blockquote>
</details>

- [shell.component.html](../src/app/shell/shell.component.html) — toolbar fixo com nav + badge + toggles + outlet
- [shell.component.scss](../src/app/shell/shell.component.scss) — estilos do layout (toolbar amarela, nav, responsividade)

</blockquote>
</details>

### src/app/features

<details id="dir-features-auth">
<summary><strong>src/app/features/auth/</strong></summary>
<blockquote>

<details id="login-component-ts">
<summary><strong><a href="../src/app/features/auth/login/login.component.ts">login/login.component.ts</a></strong></summary>
<blockquote>

`LoginComponent` — Reactive Form (email + password); chama `AuthApiService.login`; navega para `/dashboard` no sucesso; toast de erro com `ProblemDetails.detail`.

</blockquote>
</details>

<details id="register-component-ts">
<summary><strong><a href="../src/app/features/auth/register/register.component.ts">register/register.component.ts</a></strong></summary>
<blockquote>

`RegisterComponent` — Reactive Form (name + email + password); chama `AuthApiService.register`; redireciona para `/auth/login`.

</blockquote>
</details>

<details id="verify-email-component-ts">
<summary><strong><a href="../src/app/features/auth/verify-email/verify-email.component.ts">verify-email/verify-email.component.ts</a></strong></summary>
<blockquote>

`VerifyEmailComponent` — rota pública; lê `?email=&token=` dos queryParams; chama `AuthApiService.verifyEmail` no `ngOnInit`; signal `status: 'loading' | 'success' | 'error'`.

</blockquote>
</details>

</blockquote>
</details>

<details id="dir-features-dashboard">
<summary><strong>src/app/features/dashboard/</strong></summary>
<blockquote>

<details id="dashboard-component-ts">
<summary><strong><a href="../src/app/features/dashboard/dashboard.component.ts">dashboard.component.ts</a></strong></summary>
<blockquote>

`DashboardComponent` — carrega listas + produtos (forkJoin por lista) no `ngOnInit`; signals: `lists`, `totalProducts`, `belowTarget`, `nextCheck`; usa `NotificationPollingService.unreadCount`.

</blockquote>
</details>

</blockquote>
</details>

<details id="dir-features-lists">
<summary><strong>src/app/features/lists/</strong></summary>
<blockquote>

<details id="list-overview-component-ts">
<summary><strong><a href="../src/app/features/lists/list-overview/list-overview.component.ts">list-overview/list-overview.component.ts</a></strong></summary>
<blockquote>

`ListOverviewComponent` — grid de listas; abre `ListFormDialogComponent` para criar/editar; `ConfirmDialogComponent` para deletar.

</blockquote>
</details>

<details id="list-form-dialog-component-ts">
<summary><strong><a href="../src/app/features/lists/list-form-dialog/list-form-dialog.component.ts">list-form-dialog/list-form-dialog.component.ts</a></strong></summary>
<blockquote>

`ListFormDialogComponent` — MatDialog para criar/editar lista; `MAT_DIALOG_DATA: ProductList | null`; usa `createList` ou `updateList` conforme dados recebidos.

</blockquote>
</details>

<details id="list-detail-component-ts">
<summary><strong><a href="../src/app/features/lists/list-detail/list-detail.component.ts">list-detail/list-detail.component.ts</a></strong></summary>
<blockquote>

`ListDetailComponent` — grid de produtos de uma lista; abre `AddProductDialogComponent` e `EditProductDialogComponent`; toggle ativo/pausado; remoção com confirmação.

</blockquote>
</details>

<details id="list-analysis-component-ts">
<summary><strong><a href="../src/app/features/lists/list-analysis/list-analysis.component.ts">list-analysis/list-analysis.component.ts</a></strong></summary>
<blockquote>

`ListAnalysisComponent` — tabela MatTable; `distanceClass(pct)` → `dist-below` (verde, ≤0%), `dist-near` (amarelo, ≤20%), `dist-far` (vermelho, >20%).

</blockquote>
</details>

</blockquote>
</details>

<details id="dir-features-products">
<summary><strong>src/app/features/products/</strong></summary>
<blockquote>

<details id="add-product-dialog-component-ts">
<summary><strong><a href="../src/app/features/products/add-product/add-product-dialog.component.ts">add-product/add-product-dialog.component.ts</a></strong></summary>
<blockquote>

`AddProductDialogComponent` — form com URL + targetPrice opcional; backend auto-detecta source pela URL; `MAT_DIALOG_DATA: { listId: string }`.

</blockquote>
</details>

<details id="edit-product-dialog-component-ts">
<summary><strong><a href="../src/app/features/products/edit-product/edit-product-dialog.component.ts">edit-product/edit-product-dialog.component.ts</a></strong></summary>
<blockquote>

`EditProductDialogComponent` — form com targetPrice + toggle isActive; `MAT_DIALOG_DATA: { product: TrackedProduct }`.

</blockquote>
</details>

<details id="price-history-component-ts">
<summary><strong><a href="../src/app/features/products/price-history/price-history.component.ts">price-history/price-history.component.ts</a></strong></summary>
<blockquote>

`PriceHistoryComponent` — Chart.js via `viewChild<ElementRef>('chartCanvas')`; linha de preço + linha tracejada do alvo; `ngOnDestroy` destrói instância do chart. `listId` mantido para botão de voltar; API usa apenas `productId`.

</blockquote>
</details>

</blockquote>
</details>

<details id="dir-features-notifications">
<summary><strong>src/app/features/notifications/</strong></summary>
<blockquote>

<details id="notifications-component-ts">
<summary><strong><a href="../src/app/features/notifications/notifications.component.ts">notifications.component.ts</a></strong></summary>
<blockquote>

`NotificationsComponent` — signal `filterUnread`; `filtered` computed; `markRead` atualiza localmente + decrementa `polling.unreadCount`; `markAll` zera o contador.

</blockquote>
</details>

</blockquote>
</details>

<details id="dir-features-profile">
<summary><strong>src/app/features/profile/</strong></summary>
<blockquote>

<details id="profile-overview-component-ts">
<summary><strong><a href="../src/app/features/profile/profile-overview/profile-overview.component.ts">profile-overview/profile-overview.component.ts</a></strong></summary>
<blockquote>

`ProfileOverviewComponent` — exibe perfil; badge verificado/não verificado; botão reenviar verificação; links para sub-rotas de perfil.

</blockquote>
</details>

- `change-password/change-password.component.ts` — `ChangePasswordComponent` — form currentPassword + newPassword
- `change-email/change-email.component.ts` — `ChangeEmailComponent` — form newEmail
- `delete-account/delete-account.component.ts` — `DeleteAccountComponent` — form password + `ConfirmDialogComponent` + logout após exclusão

</blockquote>
</details>
