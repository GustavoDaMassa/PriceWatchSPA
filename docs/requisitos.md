# PriceWatchSPA — Requisitos

## Requisitos Funcionais

### RF01 — Autenticação
- Registro com nome, email e senha
- Verificação de email opcional — ausência impede apenas alertas por email, não o login
- Reenvio de token de verificação (na tela de perfil)
- Login sem necessidade de verificação prévia
- Logout local (limpa token do localStorage)

### RF02 — Dashboard (home pós-login)
- Contagem de listas, produtos rastreados e notificações não lidas
- Produtos com preço já abaixo do alvo
- Próximo produto a ser verificado (`nextCheckAt`)
- Atalhos para criar lista e ver notificações

### RF03 — Listas de Produtos
- Listar todas as listas do usuário
- Criar lista (nome + descrição opcional)
- Editar lista
- Deletar lista com confirmação (cascata no backend)
- Visualizar análise da lista (produtos ordenados por proximidade ao preço-alvo)

### RF04 — Produtos Rastreados
- Listar produtos de uma lista
- Adicionar produto: usuário informa URL + fonte; backend retorna nome, imagem e preço atual
- Definir/editar preço-alvo em tela separada
- Ativar/pausar rastreamento
- Remover produto com confirmação
- Visualizar histórico de preços: gráfico de linha com linha de referência do preço-alvo

### RF05 — Notificações
- Listar com filtro lidas/não-lidas
- Marcar como lida individualmente
- Marcar todas como lidas
- Badge no header com polling a cada 30s

### RF06 — Perfil
- Ver dados do perfil (com indicador de email verificado/não verificado)
- Alterar senha
- Alterar email (dispara re-verificação no backend)
- Deletar conta com confirmação e senha
- Reenviar email de verificação (visível se não verificado)

---

## Requisitos Não-Funcionais

- **RNF01** — i18n: PT-BR e EN via @ngx-translate/core v17
- **RNF02** — Tema dark/light com toggle; design inspirado no Mercado Livre; primária `#FFE600`
- **RNF03** — Responsivo (mobile e desktop)
- **RNF04** — Angular 20+, standalone components, Angular Signals, Angular Material MD3
- **RNF05** — Lazy loading por feature (loadComponent)
- **RNF06** — Interceptor HTTP: injeta JWT e redireciona para login em 401
- **RNF07** — Deploy no Vercel; URL da API configurável via `environment.prod.ts`

---

## Requisitos Implícitos

- **RI01** — Loading states (skeleton/spinner) em operações assíncronas
- **RI02** — Estado vazio para listas sem itens
- **RI03** — Toasts de feedback (sucesso/erro) baseados em `ErrorResponse { status, error, message }`
- **RI04** — Formatação de preço por locale (R$ PT-BR, $ EN)
- **RI05** — Formatação de datas por locale (datas chegam em UTC)
- **RI06** — Indicador visual de status do produto: ativo vs pausado
- **RI07** — Badge de fonte: Mercado Livre / Kabum / Manual
- **RI08** — Análise com código de cor: verde = abaixo do alvo, amarelo = próximo, vermelho = longe
- **RI09** — Diálogos de confirmação para ações destrutivas
- **RI10** — Rota `/verify-email` pública (link por email com `?email=&token=`)

---

## Impacto no Backend (PriceWatch — ajustes necessários)

1. **Email verification para login**: remover validação `isEmailVerified` do fluxo de login
2. **`AddProductRequest`**: tornar `name` e `targetPrice` opcionais — backend preenche via fetcher
