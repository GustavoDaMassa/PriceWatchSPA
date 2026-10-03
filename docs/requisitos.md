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

### RF07 — Fluxo da v1: adicionar por link, comparar e confirmar (planejado, 02/10/2026)
- **Entrada por link:** campo para colar o link do produto; a API identifica a loja, segue link curto e importa o produto (RF20 da API)
- **Seletor de lojas:** alternativa ao link — o usuário escolhe a loja e é levado à página dela em outra aba; com a extensão instalada aparece o botão "Acompanhar com PriceWatch" e, ao clicar, volta para a aba do site já aberta (RF21)
- **Detecção da extensão:** o site detecta se a extensão está instalada; sem ela, oferece instalar ou usa o campo de link
- **Descoberta em outras lojas:** depois de acompanhar, a tela mostra as ofertas candidatas encontradas em outras lojas, com loja, preço, imagem e o motivo ("mesmo GTIN" ou "palavra-chave")
- **Confirmação:** para cada candidata, "É o mesmo produto?" (sim/não) e "Acompanhar esta oferta?"; pré-seleção quando o GTIN é igual; o veredito é enviado à API (RF22, RF23)
- **Comparação lado a lado:** ofertas do mesmo produto ordenadas por preço, com destaque da mais barata e indicação de "atualizado há X" por oferta (RF16, RNF18)
- **Ir para a loja:** o botão passa pelo endpoint de redirect (`GET /api/offers/{id}/redirect`); a SPA nunca abre a URL original direto (RF17, `ProductLinkDialogComponent.openUrl()`)
- **Lojas indisponíveis:** lojas sem busca não aparecem na descoberta; a lista vem de `GET /api/stores` (RF26)

### RF08 — Notificações (evolução, planejado)
- Central in-app continua com polling (RF05); passa a exibir também o canal de entrega e o link de afiliado da oferta
- Preferências de canal (e-mail, push no app) na tela de perfil

---

## Requisitos Não-Funcionais

- **RNF01** — i18n: PT-BR e EN via @ngx-translate/core v17
- **RNF02** — Tema dark/light com toggle; design inspirado no Mercado Livre; primária `#FFE600`
- **RNF03** — Responsivo (mobile e desktop)
- **RNF04** — Angular 20+, standalone components, Angular Signals, Angular Material MD3
- **RNF05** — Lazy loading por feature (loadComponent)
- **RNF06** — Interceptor HTTP: injeta JWT e redireciona para login em 401
- **RNF07** — Deploy no Vercel; URL da API configurável via `environment.prod.ts`. **Planejado para a v1:** migrar o deploy para a Cloudflare Pages (gratuito, uso comercial permitido; o plano gratuito da Vercel não permite uso comercial) — ver `priceWatchAPI/docs/analise-financeira.md`
- **RNF08** — A SPA nunca altera páginas de lojas nem abre links de loja diretamente; toda saída para a loja passa pelo redirect da API (RNF20 da API)
- **RNF09** — Mostrar o frescor do preço ("atualizado há X") em todas as telas que exibem preço (RNF18 da API)

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

### Impacto no backend — v1 (planejado)

3. `POST /api/offers` aceita link (inclusive curto) e dados extraídos pelo cliente
4. `GET /api/stores`, `POST /api/products/{id}/discover`, `GET /api/products/{id}/candidates`, `POST /api/candidates/{id}/feedback` (ver `priceWatchAPI/docs/arquitetura.md`, "Arquitetura da v1")
5. DTOs de oferta expõem `lastCheckedAt` para o indicador de frescor
