# Contexto do Projeto — Catálogo Digital

> Documento vivo. Atualizado em 2026-06-01 após redesign arquitetural completo.
> Para decisões e rationale, veja [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
> Para o plano de implementação, veja [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

## Visão do Produto

SaaS B2B multi-tenant de catálogo digital. Qualquer negócio (joias, roupas, alimentos, etc.) cria sua loja, gerencia produtos e recebe "intenções de pedido" dos clientes via catálogo público. O cliente final chega à loja por link ou QR code — não há marketplace/descoberta central.

O modelo de receita é assinatura mensal ou anual (Mercado Pago Bricks). O lojista se cadastra, escolhe o plano e paga — sem intervenção manual da plataforma.

---

## Stack

| Camada | Tecnologia | Notas |
|---|---|---|
| Framework | Next.js 16.2.6 (App Router, React 19, TypeScript) | |
| Estilização | Tailwind CSS 4 + PostCSS | |
| Banco de dados | Neon PostgreSQL (serverless) | Mantido em vez de Supabase — ver ADR-001 |
| ORM | Drizzle ORM | Schema em `lib/db/schema.ts` é a fonte da verdade |
| Autenticação | NextAuth v5 (beta) + bcryptjs | |
| Upload de imagens | Cloudinary (unsigned preset) | |
| E-mail transacional | Mailtrap | V1 — único canal de notificação |
| Pagamentos | Mercado Pago Bricks | Apenas assinaturas; sem gateway para pedidos |
| QR Code | react-qr-code | |
| Deploy | Script PowerShell `scripts/deploy.ps1` | |

---

## Estrutura de Diretórios (alvo pós-refatoração)

```
catalogo-digital/
├── app/
│   ├── page.tsx                          # Home pública / landing
│   ├── cadastro/                         # Signup do lojista (step 1)
│   ├── planos/                           # Vitrine de planos (step 2)
│   ├── checkout/                         # MP Bricks — pagamento da assinatura (step 3)
│   ├── loja/[slug]/                      # Catálogo público da loja
│   │   ├── categoria/[catSlug]/          # Produtos por categoria
│   │   └── pedido/                       # Carrinho + dados do cliente
│   ├── admin/                            # Painel do lojista e gerente
│   │   ├── login/
│   │   ├── dashboard/                    # Métricas e resumo
│   │   ├── pedidos/                      # Gestão de pedidos (intenções)
│   │   ├── produtos/
│   │   │   ├── novo/
│   │   │   └── [id]/editar/
│   │   ├── categorias/
│   │   ├── configuracoes/                # Dados da loja (tema, logo, WhatsApp)
│   │   ├── membros/                      # Convite e gestão de gerentes
│   │   └── assinatura/                   # Plano atual, vencimento, upgrade
│   ├── admin/sistema/                    # Painel exclusivo para Admin do sistema
│   │   ├── lojas/
│   │   ├── usuarios/
│   │   ├── planos/
│   │   └── assinaturas/
│   ├── convite/[token]/                  # Aceitar convite de gerente
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── lojas/[slug]/pedidos/         # POST — cria intenção de pedido
│       ├── admin/
│       │   ├── pedidos/[id]/status/      # PATCH — muda status do pedido
│       │   ├── produtos/
│       │   ├── categorias/
│       │   ├── membros/
│       │   └── upload/
│       └── webhooks/
│           └── mercadopago/              # Eventos de assinatura do MP
├── components/
│   ├── catalog/                          # Catálogo público
│   ├── admin/                            # Painel admin (lojista/gerente)
│   └── sistema/                          # Painel admin do sistema
├── lib/
│   ├── auth.ts                           # Configuração NextAuth
│   ├── db/
│   │   ├── index.ts                      # Cliente Drizzle (Neon)
│   │   └── schema.ts                     # Schema completo (fonte da verdade)
│   ├── notifications/
│   │   └── email.ts                      # Serviço de e-mail (Mailtrap)
│   ├── subscriptions.ts                  # Lógica de ciclo de vida de assinatura
│   ├── plans.ts                          # Helpers de limites de plano
│   ├── themes.ts                         # 8 temas predefinidos
│   └── whatsapp.ts                       # Helpers de link WhatsApp
├── supabase/
│   └── schema.sql                        # Legado — não usado em produção
├── drizzle/                              # Migrations geradas pelo drizzle-kit
├── drizzle.config.ts
├── middleware.ts                         # Auth + subscription guard
├── docs/
│   ├── ARCHITECTURE.md                   # Decisões técnicas e rationale
│   └── ROADMAP.md                        # Fases de implementação
└── scripts/
    └── deploy.ps1
```

---

## Modelo de Dados

Schema em `lib/db/schema.ts`. O arquivo `supabase/schema.sql` é um artefato legado sem uso.

### Entidades e relacionamentos

```
plans ──────────────────────────────────────────────┐
                                                     │
users ──────────────── store_members ─── stores ─── subscriptions
  │                         │               │
  │ (owner_id)              │ (role)        ├── categories
  └────────────────────────→┘               ├── products ── product_variants
                                            │
                                            └── orders ── order_items

notifications (log de envios — referencia users e/ou stores)
```

### Tabelas

#### `users`
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | |
| email | text UNIQUE | |
| password_hash | text | |
| system_role | text NULL | `'admin'` ou `NULL`. Lojista/Gerente = NULL (papel via store_members) |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `plans`
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | "Gratuito", "Pro", "Business" |
| slug | text UNIQUE | "free", "pro", "business" |
| price_monthly | numeric(10,2) | |
| price_annual | numeric(10,2) NULL | NULL = sem opção anual |
| trial_days | int | Padrão do plano; sobrescrito por `subscriptions.trial_ends_at` |
| features | jsonb | Ver detalhes abaixo |
| active | boolean | |
| created_at | timestamp | |

**`plans.features` (JSONB):**
```json
{
  "max_products": 10,
  "max_categories": 3,
  "max_members": 1,
  "max_stores": 1,
  "has_variants": false,
  "has_qr_code": false,
  "has_custom_domain": false
}
```
`null` em qualquer campo = ilimitado. Novos flags não exigem migração.

#### `stores`
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| slug | text UNIQUE | Imutável após criação |
| name | text | |
| owner_id | uuid → users | Lojista dono/pagador |
| whatsapp_number | text | |
| max_installments | text | |
| theme | text | |
| logo_url | text NULL | |
| status | text | `'pending'` \| `'active'` \| `'inactive'` |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `store_members`
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| store_id | uuid → stores | cascade delete |
| user_id | uuid → users | cascade delete |
| role | text | `'lojista'` \| `'gerente'` |
| invited_by | uuid → users NULL | |
| accepted_at | timestamp NULL | NULL = convite pendente |
| created_at | timestamp | |

`UNIQUE (store_id, user_id)`

#### `subscriptions`
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| store_id | uuid → stores UNIQUE | Uma subscription por loja |
| plan_id | uuid → plans | |
| status | text | `'trial'` \| `'active'` \| `'past_due'` \| `'cancelled'` \| `'inactive'` |
| billing_period | text | `'monthly'` \| `'annual'` |
| trial_ends_at | timestamp NULL | Sobrescreve `plans.trial_days` se definido |
| current_period_start | timestamp | |
| current_period_end | timestamp | |
| grace_period_ends_at | timestamp NULL | Preenchido quando entra em `past_due` (D+3) |
| mp_preapproval_id | text NULL | ID da assinatura no Mercado Pago |
| mp_payer_email | text NULL | |
| cancelled_at | timestamp NULL | |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `categories`
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| store_id | uuid → stores | cascade delete |
| name | text | |
| slug | text | `UNIQUE (store_id, slug)` |
| position | int | Ordenação |
| created_at | timestamp | |

#### `products`
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| store_id | uuid → stores | cascade delete |
| category_id | uuid → categories NULL | set null on delete |
| name | text | |
| description | text NULL | |
| price | numeric(10,2) | |
| image_url | text NULL | |
| active | boolean | |
| position | int | Ordenação |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `product_variants`
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| product_id | uuid → products | cascade delete |
| label | text | Ex: "Tamanho", "Cor" |
| options | jsonb | `[{ "value": "P", "price_modifier": 0 }, { "value": "G", "price_modifier": 5.00 }]` |
| required | boolean | |
| position | int | |

#### `orders`
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| store_id | uuid → stores | cascade delete |
| customer_name | text | |
| customer_phone | text | |
| customer_address | jsonb NULL | `{ street, number, complement, neighborhood, city, state, zip }` |
| status | text | `'pending'` \| `'confirmed'` \| `'in_progress'` \| `'ready'` \| `'delivered'` \| `'cancelled'` |
| notes | text NULL | Observações do cliente |
| internal_notes | text NULL | Anotações do lojista/gerente |
| total | numeric(10,2) | |
| whatsapp_notified | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `order_items`
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| order_id | uuid → orders | cascade delete |
| product_id | uuid → products NULL | set null (produto pode ser deletado depois) |
| product_name | text | Snapshot no momento do pedido |
| unit_price | numeric(10,2) | Snapshot no momento do pedido |
| quantity | int | |
| variant_label | text NULL | Ex: "Tamanho: M / Cor: Azul" |
| subtotal | numeric(10,2) | |

#### `notifications`
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid → users NULL | |
| store_id | uuid → stores NULL | |
| type | text | Ver tipos abaixo |
| channel | text | `'email'` \| `'in_app'` |
| status | text | `'pending'` \| `'sent'` \| `'failed'` |
| payload | jsonb | Dados enviados (auditoria e reenvio) |
| sent_at | timestamp NULL | |
| created_at | timestamp | |

**Tipos de notificação:** `subscription_trial_ending`, `subscription_past_due`, `subscription_inactive`, `subscription_reactivated`, `new_order`, `invite_received`

---

## Roles e Permissões

### Definição de roles

| Role | Onde vive | Quem é |
|---|---|---|
| `admin` | `users.system_role` | Dev / operador da plataforma |
| `lojista` | `store_members.role` | Dono do negócio — paga a assinatura |
| `gerente` | `store_members.role` | Colaborador — acesso operacional |

### Matriz de permissões

| Ação | Admin (sistema) | Lojista | Gerente |
|---|---|---|---|
| Gerenciar planos | ✅ | ❌ | ❌ |
| Ver todas as lojas / usuários | ✅ | ❌ | ❌ |
| Override de trial por usuário | ✅ | ❌ | ❌ |
| Criar nova loja | ✅ | ✅ (limite do plano) | ❌ |
| Excluir loja | ✅ | ✅ (própria) | ❌ |
| Alterar configurações da loja | ✅ | ✅ | ❌ |
| Convidar / remover membros | ✅ | ✅ | ❌ |
| Ver / gerir assinatura | ✅ | ✅ | ❌ |
| CRUD produtos e categorias | ✅ | ✅ | ✅ |
| Ver e atualizar pedidos | ✅ | ✅ | ✅ |
| Ver dashboard de métricas | ✅ | ✅ | ✅ |

---

## Ciclo de vida da Subscription

```
[cadastro] → trial → active
                        ↓ vencimento não pago
                     past_due  ←─ notificação (e-mail + in-app) D+0
                        ↓ 3 dias sem regularização
                     inactive  ←─ notificação D+3
                        │         loja bloqueada publicamente
                        │         lojista vê apenas /admin/assinatura
                        │         gerentes sem acesso
                        ↓ pagamento regularizado
                     active    ←─ notificação de reativação
```

- Trial configurável por plano (`plans.trial_days`) e sobrescritível por admin (`subscriptions.trial_ends_at`)
- Grace period fixo de 3 dias
- Plano Gratuito não exige cartão

---

## Ciclo de vida de um Pedido

```
Cliente monta carrinho (localStorage)
  → preenche dados (nome, telefone, endereço)
  → POST /api/lojas/[slug]/pedidos
      → cria order + order_items no banco
      → redireciona para WhatsApp com mensagem formatada
  → status inicial: 'pending'

Lojista/Gerente no painel:
  pending → confirmed → in_progress → ready → delivered
                                             → cancelled (qualquer etapa)
```

---

## Onboarding do Lojista

```
/cadastro       → cria User + Store (status: 'pending') + store_members (role: 'lojista')
/planos         → lojista escolhe plano e período (mensal/anual)
/checkout       → Mercado Pago Bricks renderiza formulário
                → MP dispara webhook em /api/webhooks/mercadopago
                → subscription criada com status 'trial' ou 'active'
                → store.status muda para 'active'
/admin/dashboard → lojista começa a configurar a loja
```

---

## Middleware (proteção de rotas)

```
/admin/*
  1. Autenticado?                     → senão: /admin/login
  2. subscription.status?
       trial | active                 → OK
       past_due                       → OK + banner de aviso
       inactive | cancelled           → /admin/assinatura (bloqueio suave)
  3. system_role === 'admin'?         → bypass de tudo acima

/admin/sistema/*
  → system_role === 'admin'           → OK
  → senão: 403

/loja/[slug]/*
  → store.status === 'active'         → OK
  → senão: página de loja inativa (sem revelar dados internos)
```

---

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string Neon PostgreSQL com `?sslmode=require` |
| `AUTH_SECRET` | Segredo NextAuth — gere com `openssl rand -hex 32` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Nome do cloud no Cloudinary |
| `CLOUDINARY_UPLOAD_PRESET` | Upload preset sem assinatura |
| `MAILTRAP_TOKEN` | API token do Mailtrap |
| `MAILTRAP_FROM_EMAIL` | Remetente dos e-mails transacionais |
| `MP_ACCESS_TOKEN` | Access token do Mercado Pago (server-side) |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Public key do MP (Bricks, client-side) |
| `MP_WEBHOOK_SECRET` | Segredo para validação HMAC dos webhooks do MP |
| `NEXT_PUBLIC_APP_URL` | URL base da aplicação (ex: https://seudominio.com) |

> `NEXT_PUBLIC_WHATSAPP_NUMBER` foi removido — o número agora vive em `stores.whatsapp_number`.

---

## Comandos Principais

```bash
npm run dev                   # Desenvolvimento em localhost:3000
npm run build                 # Build de produção
npm run start                 # Servidor de produção
npm run lint                  # ESLint
npm run deploy                # scripts/deploy.ps1

npx drizzle-kit generate      # Gera migration após alterar schema.ts
npx drizzle-kit migrate       # Aplica migrations pendentes no Neon
npx drizzle-kit studio        # UI visual do banco em localhost:4983
```

---

## Notas Técnicas

- `supabase/schema.sql` é artefato legado do modelo inicial (single-tenant + Supabase). Não usado em produção. Mantido apenas para referência histórica.
- `storeSettings` foi **removida** do schema. As configurações por loja vivem em `stores`.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` foi **removido** das env vars. Cada loja tem seu próprio número.
- Cloudinary é acionado diretamente do client com upload preset público. Nenhuma secret do Cloudinary é necessária no servidor.
- O campo `product_id` em `order_items` é nullable — produtos podem ser deletados após o pedido.
- `plans.features` usa JSONB para que novos limites/flags sejam adicionados sem migração de schema.
