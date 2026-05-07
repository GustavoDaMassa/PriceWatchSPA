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

- `confirm-dialog/` — dialog de confirmação para ações destrutivas *(stub — implementar na Fase 5)*
- `empty-state/` — estado vazio reutilizável *(stub)*
- `price-display/` — formata R$/$ por locale *(stub)*
- `skeleton/` — placeholder de carregamento *(stub)*
- `source-badge/` — badge ML/Kabum/Manual *(stub)*

</blockquote>
</details>

<details id="dir-shared-pipes">
<summary><strong>src/app/shared/pipes/</strong></summary>
<blockquote>

- `price.pipe.ts` — CurrencyPipe por locale *(stub)*
- `relative-date.pipe.ts` — "há 2 horas" / "2 hours ago" *(stub)*

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

- `login/login.component.ts` — `LoginComponent` *(stub)*
- `register/register.component.ts` — `RegisterComponent` *(stub)*
- `verify-email/verify-email.component.ts` — `VerifyEmailComponent` *(stub)*

</blockquote>
</details>

<details id="dir-features-dashboard">
<summary><strong>src/app/features/dashboard/</strong></summary>
<blockquote>

- `dashboard.component.ts` — `DashboardComponent` *(stub)*

</blockquote>
</details>

<details id="dir-features-lists">
<summary><strong>src/app/features/lists/</strong></summary>
<blockquote>

- `list-overview/list-overview.component.ts` — `ListOverviewComponent` *(stub)*
- `list-detail/list-detail.component.ts` — `ListDetailComponent` *(stub)*
- `list-analysis/list-analysis.component.ts` — `ListAnalysisComponent` *(stub)*

</blockquote>
</details>

<details id="dir-features-products">
<summary><strong>src/app/features/products/</strong></summary>
<blockquote>

- `add-product/add-product.component.ts` — `AddProductComponent` *(stub)*
- `edit-product/edit-product.component.ts` — `EditProductComponent` *(stub)*
- `price-history/price-history.component.ts` — `PriceHistoryComponent` *(stub — usará Chart.js via ElementRef)*

</blockquote>
</details>

<details id="dir-features-notifications">
<summary><strong>src/app/features/notifications/</strong></summary>
<blockquote>

- `notifications.component.ts` — `NotificationsComponent` *(stub)*

</blockquote>
</details>

<details id="dir-features-profile">
<summary><strong>src/app/features/profile/</strong></summary>
<blockquote>

- `profile-overview/profile-overview.component.ts` — `ProfileOverviewComponent` *(stub)*
- `change-password/change-password.component.ts` — `ChangePasswordComponent` *(stub)*
- `change-email/change-email.component.ts` — `ChangeEmailComponent` *(stub)*
- `delete-account/delete-account.component.ts` — `DeleteAccountComponent` *(stub)*

</blockquote>
</details>
