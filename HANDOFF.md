# HANDOFF — Catálogo Digital

> Documento de contexto para continuidade do projeto em nova sessão.
> Última atualização: 2026-06-03

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
- `subscriptionStatus` carregado no JWT a cada sessão

**Onboarding completo**
- `/cadastro` → `/planos` → `/checkout` (MP Bricks) → `/api/webhooks/mercadopago`
- `/api/auth/cadastro`, `/api/assinatura/criar`, `/api/slug-check`
- `/api/cron/subscriptions` — cron diário: trial/past_due/inactive + notificações

**Planos (3)**
- Gratuito (R$0): 10 produtos, 3 categorias, 1 membro, sem variantes
- Pro (R$49/mês | R$470/ano): ilimitado, variantes, QR, 3 membros
- Business (R$99/mês | R$950/ano): ilimitado, variantes, QR, membros/lojas ilimitados

**Catálogo público**
- `/loja/[slug]` com carrinho (localStorage), variantes inline, temas
- `/loja/[slug]/pedido` — checkout: coleta dados do cliente, salva order no banco, abre WhatsApp

**Painel admin (lojista/gerente)**
- Dashboard de produtos com toggle ativo/inativo
- CRUD de produtos com variantes (gate: plano Pro+)
- CRUD de categorias
- Pedidos com itens, filtros por status, ações de avanço
- Configurações da loja
- Membros (convite de gerentes via JWT, sem tabela extra)
- Assinatura (plano atual, datas, recursos)

**Convites de gerente**
- Token JWT autossuficiente (sem DB extra), expira em 7 dias
- `/convite/[token]` para aceitar
- E-mail enviado via Mailtrap

**Painel admin do sistema (`/admin/sistema/*`)**
- Dashboard com MRR, lojas ativas, trial, inadimplentes
- Lojas, Usuários, Planos, Assinaturas

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

---

## What Didn't Work

- **Migração para Supabase** — descartada. O MCP do Supabase está conectado a uma conta diferente da do projeto. Sem vantagem real sobre o Neon. Revertido para `@neondatabase/serverless`.
- **`middleware.ts` no Next.js 16** — gera erro de build. Usar `proxy.ts`.
- **`db.execute(sql\`...\`).rows`** com `postgres.js` — o driver retorna array diretamente, sem `.rows`. Com `neon-http` (atual), `.rows` é correto.
- **`storeSettings` table** — era legado do modelo single-tenant. Foi removida.
- **`users.storeId` e `users.role`** — colunas removidas. Roles agora em `store_members`, stores via `ownerId` em `stores`.

---

## Environment Variables Needed

Ver `.env.example` para o formato completo. Arquivo correto: `.env.local`.

| Variável | Para quê |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL com `?sslmode=require` |
| `AUTH_SECRET` | NextAuth JWT |
| `NEXT_PUBLIC_APP_URL` | URL base (ex: `http://localhost:3000`) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Upload de imagens |
| `CLOUDINARY_UPLOAD_PRESET` | Upload sem assinatura |
| `MAILTRAP_TOKEN` | E-mails transacionais |
| `MAILTRAP_FROM_EMAIL` | Remetente dos e-mails |
| `MP_ACCESS_TOKEN` | Mercado Pago server-side |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Mercado Pago client-side (Bricks) |
| `MP_WEBHOOK_SECRET` | Validação HMAC dos webhooks MP |
| `CRON_SECRET` | Protege `/api/cron/subscriptions` |

---

## Next Steps

### Prioridade alta (para lançar com primeiros clientes)

1. **Configurar `.env.local`** com todas as variáveis e rodar:
   ```bash
   npm run db:migrate   # aplica o schema no Neon
   npm run db:seed      # cria planos + admin
   ```

2. **Testar o fluxo completo localmente:**
   - Cadastro → plano gratuito → dashboard → criar produto → catálogo → pedido → painel

3. **Configurar variáveis de ambiente no Vercel** (produção)

4. **Testar webhook do Mercado Pago** em sandbox antes de ir a produção

### Backlog V2

- **QR Code da loja** — feature listada nos planos Pro/Business, página não implementada ainda
- **Seletor de loja ativa** — Business plan permite múltiplas lojas, mas o switcher no AdminNav não foi feito
- **Aviso "trial terminando em X dias"** — cron processa a expiração mas não dispara aviso antecipado (3 dias antes)
- **Gestão de planos via UI** — hoje só via seed ou Drizzle Studio
- **Override de trial por usuário** — existe no modelo (via `subscriptions.trial_ends_at`) mas sem UI no painel sistema
- **Domínio customizado** — V2 conforme decisão arquitetural
- **WhatsApp como canal de notificação** — V2 (risco de bloqueio de API não-oficial)

### Documentação de referência

- `CONTEXT.md` — schema completo, permissões, fluxos, env vars
- `docs/ARCHITECTURE.md` — ADRs e decisões técnicas (por que Neon, por que JWT para convites, etc.)
- `docs/ROADMAP.md` — 7 fases com status

---

## Key Files

```
lib/db/schema.ts          ← fonte da verdade do banco
lib/auth.ts               ← NextAuth config com subscriptionStatus no JWT
proxy.ts                  ← middleware (Next.js 16: proxy.ts, não middleware.ts!)
lib/plans.ts              ← gates de plano (canCreateProduct, etc.)
lib/subscriptions.ts      ← criação/consulta de subscriptions
lib/notifications/email.ts ← envio via Mailtrap
lib/mercadopago.ts        ← cliente MP + validação de webhook
lib/invite.ts             ← JWT de convite de gerente
vercel.json               ← cron diário às 09h UTC
.claude/settings.json     ← regras de ouro + permissões pre-aprovadas
```
