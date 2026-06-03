# HANDOFF — Catálogo Digital

> Documento de contexto para continuidade do projeto em nova sessão.
> Última atualização: 2026-06-03 (sessão 3)

---

## Goal

SaaS B2B multi-tenant de catálogo digital. Qualquer negócio cria sua loja, gerencia produtos e recebe "intenções de pedido" dos clientes via catálogo público acessado por link/QR code. Modelo de receita: assinatura mensal/anual (Mercado Pago Bricks). Lojista se cadastra sem intervenção manual da plataforma.

---

## Stack

- **Framework:** Next.js 16.2.6 (App Router) — usa `proxy.ts` como middleware (renomeado no v16, não `middleware.ts`)
- **Banco:** Neon PostgreSQL + Drizzle ORM (`lib/db/schema.ts` = fonte da verdade)
- **Auth:** NextAuth v5 beta (Credentials provider)
- **E-mail:** Mailtrap
- **Pagamentos:** Mercado Pago Bricks (assinaturas)
- **Imagens:** Cloudinary (upload sem assinatura)
- **Deploy:** Vercel (cron diário configurado em `vercel.json`)

---

## Status Atual

**O produto está em produção e funcionando.** Deploy na Vercel validado, fluxo completo testado (cadastro → plano → dashboard → catálogo → pedido → WhatsApp). Todas as features V1 e V2 implementadas.

URL de produção: `https://catalogo-digital-lemon.vercel.app`

---

## Current Progress

### Implementado e no repositório (master)

**Infraestrutura**
- Schema completo: 11 tabelas (`plans`, `users`, `stores`, `store_members`, `subscriptions`, `categories`, `products`, `product_variants`, `orders`, `order_items`, `notifications`)
- Migration gerada: `drizzle/0000_loving_toro.sql`
- Seed: `npm run db:seed` (cria planos + admin do sistema)
- `proxy.ts` com guards de auth + subscription status + role

**Autenticação & Roles**
- `system_role = 'admin'` para operadores da plataforma
- `store_members.role`: `'lojista'` (dono) | `'gerente'` (operacional)
- `subscriptionStatus` + `id` carregados no JWT a cada sessão
- `session.user.id` = `token.sub` (UUID do usuário)

**Onboarding completo**
- `/cadastro` → `/planos` → `/checkout` (MP Bricks) → `/api/webhooks/mercadopago`
- Step indicator visual em 3 passos (Cadastro → Plano → Pronto) nas páginas `/cadastro` e `/planos`
- `/api/auth/cadastro`, `/api/assinatura/criar`, `/api/slug-check`
- `/api/cron/subscriptions` — cron diário: trial/past_due/inactive + notificações + aviso 3 dias antes de expirar

**Planos (3)**
- Gratuito (R$0): 10 produtos, 3 categorias, 1 membro, sem variantes
- Pro (R$49/mês | R$470/ano): ilimitado, variantes, QR, 3 membros
- Business (R$99/mês | R$950/ano): ilimitado, variantes, QR, membros/lojas ilimitados

**Catálogo público**
- `/loja/[slug]` com carrinho (localStorage), variantes inline, temas
- Empty state elegante quando a loja ainda não tem produtos
- `/loja/[slug]/pedido` — checkout: coleta dados do cliente, salva order no banco, abre WhatsApp
- Tela de confirmação de pedido (antes redirecionava direto ao catálogo)

**Painel admin (lojista/gerente)**
- Dashboard de produtos com toggle ativo/inativo
- Empty state com **checklist de onboarding** para primeiros acessos (crie categoria → produto → compartilhe)
- CRUD de produtos com variantes (gate: plano Pro+)
- Campo de preço com formatação BRL em tempo real
- CRUD de categorias
- Pedidos com itens, filtros por status, ações de avanço
- Configurações da loja
- Membros (convite de gerentes via JWT, sem tabela extra)
- Assinatura (plano atual, datas, recursos)
- **Sistema de toast global** (`lib/toast.ts` + `components/ui/Toaster.tsx`) disponível em todo o admin

**QR Code**
- `/admin/qrcode` — gera QR Code da loja, download SVG, cópia de link
- Gate: `has_qr_code` no plano (Pro/Business)
- Link "QR Code" no AdminNav

**Seletor de loja ativa (Business)**
- `StoreSwitcher` no AdminNav — aparece automaticamente se o usuário tem múltiplas lojas
- Troca a loja ativa via `session.update({ preferredStoreId })` + JWT callback
- `GET /api/user/stores` — lista lojas do usuário autenticado
- `lib/auth.ts` JWT respeita `preferredStoreId`, com fallback para primeira loja

**Convites de gerente**
- Token JWT autossuficiente (sem DB extra), expira em 7 dias
- `/convite/[token]` para aceitar
- E-mail enviado via Mailtrap

**Painel admin do sistema (`/admin/sistema/*`)**
- Dashboard com MRR, lojas ativas, trial, inadimplentes
- Lojas, Usuários, Planos, Assinaturas
- **Edição de planos via UI** — ícone de lápis abre form inline (nome, preços, trial, ativo)
- **Override de trial** — botão "+ Estender trial" em cada assinatura com input de dias
- `PATCH /api/admin/plans/[id]` — edita plano
- `PATCH /api/admin/subscriptions/[id]/trial` — estende trial

**Regras de ouro (hooks automáticos)**
- `SessionStart`: `git pull origin master` automático
- `PreToolUse(git commit*)`: `npm run build` bloqueia commit se falhar
- `Stop`: aviso se há alterações não commitadas

**Git config local**
- `user.name = Drenossauro`
- `user.email = araujoasa16@gmail.com`
- `credential.helper = manager`

---

## What Worked

- **Next.js 16 = `proxy.ts`** — middleware foi renomeado de `middleware.ts` para `proxy.ts`. Qualquer arquivo de middleware deve se chamar `proxy.ts`.
- **JWT autossuficiente para convites** — evitou criar tabela extra no banco.
- **`jose`** já instalado — usado para assinar/verificar tokens de convite.
- **Cron diário resolve o pause de 7 dias** do Supabase free (mas ficamos no Neon mesmo assim).
- **Drizzle `unique()` com múltiplas colunas** — syntax: `uniqueIndex('nome').on(table.col1, table.col2)` ou `unique('nome').on(...)`.
- **`isNotNull()` no Drizzle** — importar de `drizzle-orm`, não de outro lugar.
- **`session.update({ preferredStoreId })` no NextAuth v5** — passa dados para o JWT callback via parâmetro `session` quando `trigger === 'update'`.
- **Toast via event emitter** (`lib/toast.ts`) — evita context wrapper, funciona em qualquer client component com `import { toast } from '@/lib/toast'`.
- **`react-qr-code`** já instalado — sem necessidade de instalar lib nova.

---

## What Didn't Work

- **Migração para Supabase** — descartada. O MCP do Supabase está conectado a uma conta diferente da do projeto. Sem vantagem real sobre o Neon. Revertido para `@neondatabase/serverless`.
- **`middleware.ts` no Next.js 16** — gera erro de build. Usar `proxy.ts`.
- **`db.execute(sql\`...\`).rows`** com `postgres.js` — o driver retorna array diretamente, sem `.rows`. Com `neon-http` (atual), `.rows` é correto.
- **`storeSettings` table** — era legado do modelo single-tenant. Foi removida.
- **`users.storeId` e `users.role`** — colunas removidas. Roles agora em `store_members`, stores via `ownerId` em `stores`.
- **`npm run db:migrate` com URL do pooler Neon** — trava indefinidamente. Usar sempre a URL direta (sem `-pooler.`) para migrations.
- **`drizzle-kit migrate` com `@neondatabase/serverless`** — driver usa WebSocket e o drizzle-kit 0.31.x trava. Solução: usar o script `scripts/migrate.ts` com `pg` direto.
- **`driver: 'pg'` no `drizzle.config.ts`** — não é opção válida no drizzle-kit 0.31.x.
- **`session.user.id` não populado automaticamente** — NextAuth v5 não seta `id` no session callback por padrão. Necessário adicionar `session.user.id = token.sub` explicitamente.

---

## Environment Variables Needed

Ver `.env.example` para o formato completo. Arquivo correto: `.env.local`.

| Variável | Para quê |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL com `?sslmode=require` (URL direta, sem `-pooler`) |
| `AUTH_SECRET` | NextAuth JWT |
| `NEXT_PUBLIC_APP_URL` | URL base (ex: `https://catalogo-digital-lemon.vercel.app`) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Upload de imagens |
| `CLOUDINARY_UPLOAD_PRESET` | Upload sem assinatura |
| `MAILTRAP_TOKEN` | E-mails transacionais |
| `MAILTRAP_FROM_EMAIL` | Remetente dos e-mails |
| `MP_ACCESS_TOKEN` | Mercado Pago server-side |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Mercado Pago client-side (Bricks) |
| `MP_WEBHOOK_SECRET` | Validação HMAC dos webhooks MP |
| `CRON_SECRET` | Protege `/api/cron/subscriptions` |

---

## Setup do Banco (para ambientes novos)

`npm run db:migrate` não funciona com o driver Neon serverless. Usar os scripts:

```bash
# 1. Instalar dependência (só na primeira vez)
npm install pg @types/pg --save-dev

# 2. Aplicar schema do zero (dropa e recria tudo)
npx tsx scripts/migrate.ts

# 3. Seed: planos + admin
npm run db:seed

# 4. Ativar lojas presas em 'pending' (se necessário após testes)
npx tsx scripts/fix-pending-stores.ts
```

> **DATABASE_URL**: usar URL direta do Neon (sem `-pooler.`). Para o app em produção no Vercel, pode usar a URL com pooler.

---

## Bugs Corrigidos

| Sessão | Bug | Arquivo | Fix |
|---|---|---|---|
| 2 | Redirect loop `/cadastro` ↔ `/planos` ao selecionar plano gratuito | `app/planos/PlansClient.tsx` | Botão "Começar grátis" chama `POST /api/assinatura/criar` |
| 2 | Loja presa em `pending`, erro "Loja não encontrada ou inativa" | DB + fluxo | `activateStore()` chamado corretamente |
| 2 | Campo de preço sem formatação BRL | `components/admin/ProductForm.tsx` | `type="text"` com formatação em tempo real |
| 3 | `session.user.id` undefined → `StoreSwitcher` retornava 401 | `lib/auth.ts` + `types/next-auth.d.ts` | `session.user.id = token.sub` no session callback |

---

## Sugestões Futuras

### Curto prazo (próxima sessão)

- **Usar o toast globalmente** — o sistema está criado mas ainda não está sendo chamado em nenhuma ação. Integrar nos formulários de produto, categoria, configurações (ex: "Produto salvo!", "Categoria excluída!")
- **Skeleton loaders** — o dashboard ainda não tem estado de carregamento visual. Implementar com `loading.tsx` no App Router ou componentes skeleton
- **Busca/filtro no dashboard** — com muitos produtos, o lojista precisa de um campo de busca por nome
- **Paginação** — pedidos e produtos sem limite superior (hoje carrega até 100/tudo)

### Médio prazo

- **Cloudinary** — configurar as variáveis e testar o upload de imagem de produto end-to-end
- **Analytics simples** — painel com métricas da loja: pedidos por dia, produtos mais pedidos, ticket médio
- **Exportar pedidos** — CSV dos pedidos para o lojista
- **Notificação de novo pedido por e-mail** — o tipo `new_order` existe em `lib/notifications/email.ts` mas precisa ser chamado quando o pedido é criado em `/api/lojas/[slug]/pedidos`
- **Preview do catálogo no admin** — iframe ou link visível no dashboard para o lojista ver como a loja está

### Longo prazo / V3

- **Domínio customizado** — decisão arquitetural adiada
- **WhatsApp como canal de notificação** — risco de bloqueio de API não-oficial
- **App mobile** — React Native ou PWA
- **Múltiplos temas visuais editáveis** — hoje há 8 temas fixos; editor visual seria diferencial
- **Integração com sistemas de delivery** — iFood, Rappi (apenas visualização/sync de pedidos)

---

## Key Files

```
lib/db/schema.ts              ← fonte da verdade do banco
lib/auth.ts                   ← NextAuth config com session.user.id, subscriptionStatus, preferredStoreId
lib/toast.ts                  ← sistema de toast global (event emitter)
lib/plans.ts                  ← gates de plano (canCreateProduct, etc.)
lib/subscriptions.ts          ← criação/consulta de subscriptions
lib/notifications/email.ts    ← envio via Mailtrap (6 tipos de notificação)
lib/mercadopago.ts            ← cliente MP + validação de webhook
lib/invite.ts                 ← JWT de convite de gerente
proxy.ts                      ← middleware (Next.js 16: proxy.ts, não middleware.ts!)
vercel.json                   ← cron diário às 09h UTC
.claude/settings.json         ← regras de ouro + permissões pre-aprovadas

components/ui/Toaster.tsx     ← componente de toast (já incluído no admin/layout.tsx)
components/admin/AdminNav.tsx ← nav com StoreSwitcher e link QR Code
components/admin/StoreSwitcher.tsx ← seletor de loja ativa (Business plan)
components/admin/ProductForm.tsx   ← formulário de produto com formatação de preço BRL

app/admin/qrcode/             ← página QR Code (gate: has_qr_code)
app/admin/sistema/planos/PlansAdmin.tsx       ← gestão de planos com edição inline
app/admin/sistema/assinaturas/TrialOverride.tsx ← override de trial por assinatura

app/api/user/stores/route.ts              ← lista lojas do usuário autenticado
app/api/admin/plans/[id]/route.ts         ← PATCH edição de plano
app/api/admin/subscriptions/[id]/trial/route.ts ← PATCH override de trial

scripts/migrate.ts            ← migration via pg direto (substitui npm run db:migrate)
scripts/fix-pending-stores.ts ← ativa lojas presas em 'pending'
scripts/check-tables.ts       ← lista tabelas existentes no banco
types/next-auth.d.ts          ← types do session (inclui session.user.id)
```
