# Roadmap de Implementação

> Plano definido em 2026-06-01 após redesign arquitetural completo.
> Para contexto e schema, veja [`CONTEXT.md`](../CONTEXT.md).
> Para decisões técnicas, veja [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## Visão geral das fases

```
Fase 0 — Fundação (schema + limpeza)
  ↓
Fase 1 — Auth & Multi-tenancy
  ↓                    ↓                    ↓
Fase 2               Fase 4               Fase 6
Planos &             Pedidos              Multi-loja
Assinaturas            ↓                 & Convites
  ↓                Fase 5
Fase 3             Variantes
Notificações
(E-mail)
  ↓
Fase 7 — Painel Admin do Sistema
```

Fases 2, 4 e 6 podem rodar em paralelo após a Fase 1.
Fase 3 pode ser desenvolvida em paralelo com a Fase 2 (compartilham apenas o schema de `notifications`).

---

## Fase 0 — Fundação

**Objetivo:** Schema correto no banco antes de qualquer nova feature.

### Tarefas

- [ ] Reescrever `lib/db/schema.ts` com todas as novas tabelas:
  - `users` (adicionar `name`, remover `storeId`, mudar `role` para `system_role`)
  - `stores` (adicionar `owner_id`, `status`; remover campos legados)
  - `store_members` (nova)
  - `plans` (nova)
  - `subscriptions` (nova)
  - `categories` (adicionar `position`)
  - `products` (adicionar `position`, `updated_at`)
  - `product_variants` (nova)
  - `orders` (nova)
  - `order_items` (nova)
  - `notifications` (nova)
  - Remover `storeSettings`
- [ ] Gerar migration: `npx drizzle-kit generate`
- [ ] Revisar SQL gerado antes de aplicar
- [ ] Aplicar migration: `npx drizzle-kit migrate`
- [ ] Seed de dados iniciais:
  - Planos (Gratuito, Pro, Business) com features corretas
  - Usuário admin do sistema
- [ ] Remover referências a `storeSettings` no código existente
- [ ] Atualizar `.env.example` com novas variáveis

**Entregável:** Banco com schema novo, sem código quebrado.

---

## Fase 1 — Auth & Multi-tenancy

**Objetivo:** Lojista se cadastra, escolhe plano e acessa o painel. Middleware certo.

**Depende de:** Fase 0

### Tarefas

#### Signup e onboarding
- [ ] Página `/cadastro` — formulário: nome, e-mail, senha, slug da loja
  - Validação de slug único em tempo real
  - Cria `User` + `Store` (status: `pending`) + `store_members` (role: `lojista`)
- [ ] Página `/planos` — vitrine dos planos com tabela de features e preços
  - Cards: Gratuito, Pro, Business (mensal/anual com toggle)
- [ ] Página `/checkout` — Mercado Pago Bricks
  - Integração com MP Preapproval API
  - Webhook handler: `POST /api/webhooks/mercadopago`
    - Valida HMAC da assinatura
    - Cria `subscription` com status correto
    - Atualiza `store.status` para `active`
- [ ] Plano Gratuito: bypass do checkout, subscription criada diretamente

#### Auth
- [ ] Atualizar NextAuth (`lib/auth.ts`):
  - Carregar `system_role` e lista de `store_members` no token/session
  - Suporte a múltiplas lojas por usuário (seletor no painel)
- [ ] Página `/admin/login` — ajustar para novo fluxo

#### Middleware
- [ ] Reescrever `middleware.ts`:
  - `/admin/*` → checa autenticação → checa subscription status
  - `past_due` → acesso com banner
  - `inactive` | `cancelled` → redirect para `/admin/assinatura`
  - `/admin/sistema/*` → checa `system_role === 'admin'`
  - `/loja/[slug]/*` → checa `store.status === 'active'`

#### Painel base
- [ ] Layout do painel admin com navegação lateral
- [ ] Seletor de loja ativa (para lojistas com múltiplas lojas — Business)
- [ ] Página `/admin/assinatura` — plano atual, vencimento, link para gerenciar no MP

**Entregável:** Fluxo completo de cadastro → pagamento → acesso ao painel.

---

## Fase 2 — Planos & Assinaturas

**Objetivo:** Lógica de ciclo de vida das subscriptions funcionando.

**Depende de:** Fase 1

### Tarefas

- [ ] Serviço `lib/subscriptions.ts`:
  - `checkSubscriptionStatus(storeId)` — retorna status atual
  - `getActivePlan(storeId)` — retorna plano e features
  - `enforceLimit(storeId, resource)` — verifica limite do plano antes de criar recurso
- [ ] Serviço `lib/plans.ts`:
  - `canCreateProduct(storeId)` — checa `max_products`
  - `canCreateCategory(storeId)` — checa `max_categories`
  - `canAddMember(storeId)` — checa `max_members`
  - `canCreateStore(userId)` — checa `max_stores`
  - `hasVariants(storeId)` — checa `has_variants`
- [ ] Cron job (Vercel Cron ou equivalente):
  - Roda diariamente
  - Varre subscriptions com `current_period_end < now()` e status `active`
  - Move para `past_due`, preenche `grace_period_ends_at = now() + 3 days`
  - Varre subscriptions com `grace_period_ends_at < now()` e status `past_due`
  - Move para `inactive`, atualiza `store.status = 'inactive'`
  - Dispara notificações em cada transição
- [ ] Gates de plano nas API routes (produtos, categorias, membros)

**Entregável:** Subscriptions expiram, bloqueiam e reativam automaticamente.

---

## Fase 3 — Notificações (E-mail via Mailtrap)

**Objetivo:** Lojista é avisado por e-mail nos eventos críticos.

**Depende de:** Fase 0 (schema de `notifications`). Pode rodar em paralelo com Fase 2.

### Tarefas

- [ ] Configurar Mailtrap como provider (`MAILTRAP_TOKEN`)
- [ ] Serviço `lib/notifications/email.ts`:
  - `sendEmail({ to, subject, template, data })` — wrapper genérico
  - Registra em `notifications` antes e após o envio (status `pending` → `sent` | `failed`)
- [ ] Templates de e-mail (HTML):
  - `subscription_trial_ending` — aviso N dias antes do trial terminar
  - `subscription_past_due` — vencimento não pago (D+0)
  - `subscription_inactive` — loja bloqueada (D+3)
  - `subscription_reactivated` — pagamento regularizado
  - `new_order` — novo pedido recebido pelo lojista
  - `invite_received` — convite de gerente
- [ ] Acionar templates nas transições de status (integrar com cron da Fase 2)
- [ ] Banner in-app para `past_due` (componente no layout do painel)

**Entregável:** Lojista recebe e-mails em todos os eventos do ciclo de subscription e novos pedidos.

---

## Fase 4 — Pedidos ("Intenção de Pedido")

**Objetivo:** Cliente faz pedido no catálogo; lojista gerencia status no painel.

**Depende de:** Fase 1

### Tarefas

#### Catálogo público (lado do cliente)
- [ ] Carrinho persistido em `localStorage` (contexto React)
- [ ] Botão "Adicionar ao carrinho" em cada produto
- [ ] Ícone/contador de carrinho no header do catálogo
- [ ] Página `/loja/[slug]/pedido`:
  - Resumo dos itens e total
  - Formulário: nome, telefone, endereço (opcional), observações
  - Botão "Fazer Pedido"
- [ ] `POST /api/lojas/[slug]/pedidos`:
  - Valida que a loja está ativa
  - Cria `order` + `order_items` (com snapshots de nome e preço)
  - Retorna ID do pedido
  - Redireciona para WhatsApp com mensagem formatada incluindo número do pedido

#### Painel admin
- [ ] Página `/admin/pedidos`:
  - Lista paginada com filtro por status e data
  - Card de pedido: cliente, itens, total, status atual
  - Ação de mudança de status (dropdown ou botões por etapa)
  - Campo de `internal_notes` editável
- [ ] `PATCH /api/admin/pedidos/[id]/status` — atualiza status
- [ ] Badge de pedidos pendentes no menu lateral (polling a cada 30s ou SSE)

**Entregável:** Fluxo completo de pedido do catálogo ao painel.

---

## Fase 5 — Variantes de Produto

**Objetivo:** Produtos com opções (tamanho, cor, ponto, etc.).

**Depende de:** Fase 4 (variante precisa aparecer no pedido)

### Tarefas

- [ ] Gate: variantes disponíveis apenas para planos Pro e Business (`has_variants`)
- [ ] No painel (edição de produto):
  - Seção "Variantes" com botão para adicionar grupo (ex: "Tamanho")
  - Para cada grupo: label, lista de opções com `value` e `price_modifier`
  - Flag `required`
  - Reordenação por drag-and-drop (ou setas simples)
- [ ] API routes: CRUD de `product_variants`
- [ ] No catálogo público:
  - Seletor de variante antes de "Adicionar ao carrinho"
  - Preço dinâmico (base + `price_modifier`)
  - Validação de variantes obrigatórias
- [ ] `variant_label` concatenado no item do carrinho (ex: "Tamanho: M / Cor: Azul")
- [ ] `variant_label` salvo em `order_items`

**Entregável:** Produtos com variantes selecionáveis, refletidas nos pedidos.

---

## Fase 6 — Multi-loja & Convites

**Objetivo:** Lojista Business gerencia múltiplas lojas; lojista convida gerentes.

**Depende de:** Fase 1 e Fase 2 (gates de plano)

### Tarefas

#### Multi-loja
- [ ] Lojista pode criar nova loja pelo painel (gate: `max_stores`)
- [ ] Seletor de loja ativa no header do painel admin
- [ ] Cada loja tem sua própria subscription (ao criar nova loja → redirect para `/planos`)

#### Convite de gerentes
- [ ] Página `/admin/membros`:
  - Lista de membros atuais com role e status (ativo / convite pendente)
  - Formulário de convite: e-mail
  - Ação de remover membro
- [ ] `POST /api/admin/membros/convite`:
  - Valida gate `max_members`
  - Gera token de convite (UUID, expira em 7 dias)
  - Envia e-mail com link `/convite/[token]`
  - Cria `store_members` com `accepted_at = null`
- [ ] Página `/convite/[token]`:
  - Se usuário já existe: mostra botão "Aceitar convite" → atualiza `accepted_at`
  - Se usuário não existe: formulário de cadastro rápido → cria `User` → aceita convite

**Entregável:** Lojista Business gerencia equipe e múltiplas lojas.

---

## Fase 7 — Painel Admin do Sistema

**Objetivo:** Visibilidade e controle total da plataforma para o Admin.

**Depende de:** Fases 2 e 3

### Tarefas

- [ ] Layout separado em `/admin/sistema/*` com navegação própria
- [ ] `/admin/sistema/lojas` — todas as lojas, filtros por status/plano, link para detalhes
- [ ] `/admin/sistema/usuarios` — todos os usuários, role, loja(s) vinculada(s)
- [ ] `/admin/sistema/planos` — CRUD de planos (editar features, preços, trial_days)
- [ ] `/admin/sistema/assinaturas`:
  - Lista de subscriptions com status
  - Ação de override de trial (editar `trial_ends_at` manualmente)
  - Ação de forçar reativação / cancelamento
- [ ] `/admin/sistema/dashboard`:
  - MRR (Monthly Recurring Revenue)
  - Lojas ativas / em trial / inadimplentes
  - Pedidos criados no dia / semana
  - Novos cadastros no período

**Entregável:** Admin tem visibilidade e controle total sem ir ao banco de dados.

---

## Backlog V2 (fora de escopo agora)

| Item | Motivo do adiamento |
|---|---|
| Gateway de pagamento para pedidos | PCI compliance, complexidade |
| WhatsApp como canal de notificação | Risco de bloqueio de API não-oficial; burocracia da API oficial |
| Domínio customizado por loja | Complexidade de DNS + SSL |
| Avaliações de produtos | Sem prioridade de negócio na V1 |
| Analytics avançado | Pode usar ferramenta externa (Plausible, PostHog) |
| App mobile | Catálogo já é responsivo |
| Múltiplos usuários admin do sistema | Hoje é só o fundador |

---

## Critérios de conclusão por fase

Cada fase só é considerada concluída quando:
1. Código implementado e revisado
2. Migration aplicada no banco de produção (Fase 0)
3. Fluxo testado manualmente end-to-end
4. `CONTEXT.md` atualizado se alguma decisão mudou durante a implementação
