# Arquitetura — Decisões Técnicas

> Registro das decisões de arquitetura tomadas durante o redesign de 2026-06-01.
> Para o schema e estrutura atual, veja [`CONTEXT.md`](../CONTEXT.md).
> Para o plano de implementação, veja [`ROADMAP.md`](ROADMAP.md).

---

## ADR-001 — Manter Neon em vez de migrar para Supabase

**Contexto:** O projeto nasceu com intenção de usar Supabase (evidenciado por `supabase/schema.sql`), mas foi implementado com Neon + Drizzle. Avaliamos se valia migrar de volta ao Supabase.

**Decisão:** Manter Neon PostgreSQL.

**Razões:**

| Critério | Neon | Supabase |
|---|---|---|
| Inatividade (free tier) | Suspende compute em 5 min (~500ms para retomar) | Pausa projeto inteiro em 7 dias (~2 min para retomar) |
| Modelo | Serverless real — compute separado de storage | Postgres hosted tradicional |
| Fit com Next.js/Vercel | Alto — projetado para workloads serverless | Médio — melhor com conexões persistentes |
| Auth integrado | Não usa (NextAuth) | Usa, mas projeto já tem NextAuth |
| Storage integrado | Não usa (Cloudinary) | Usa, mas projeto já tem Cloudinary |
| Realtime | Não usa | Usa, mas projeto não precisa |
| Branching para dev | Nativo e gratuito | Pago |

**Consequência:** O arquivo `supabase/schema.sql` permanece apenas como referência histórica.

---

## ADR-002 — Subscription por loja, não por lojista

**Contexto:** Um lojista pode ter múltiplas lojas (Business plan). A assinatura poderia ser atrelada ao usuário (cobrindo todas as lojas) ou à loja individualmente.

**Decisão:** Subscription por loja (`subscriptions.store_id UNIQUE`).

**Razões:**
- Lojas podem estar em planos diferentes (ex: uma loja Pro, outra Business)
- Cancelamento de uma loja não afeta as demais
- Facilita upgrade/downgrade por loja
- Modelo mais previsível para o lojista e para a plataforma
- Evita lógica complexa de "quantas lojas cabem nessa subscription"

---

## ADR-003 — Roles via store_members, não em users

**Contexto:** O modelo anterior colocava o role diretamente em `users.role` (`'admin'` | `'superadmin'`). Com múltiplas lojas e múltiplos papéis por usuário, isso não escala.

**Decisão:** `users.system_role` apenas para `'admin'` do sistema. Lojista e Gerente têm seu papel em `store_members.role`.

**Razões:**
- Um gerente pode ser gerente em mais de uma loja com o mesmo papel
- Um lojista pode ser lojista em sua loja e gerente em outra
- Desacopla identidade (usuário) de responsabilidade (papel na loja)
- Extensível: novos papéis (ex: `financeiro`, `estoquista`) sem alterar `users`

**Estrutura resultante:**
```
users.system_role = 'admin'   → Admin do sistema (plataforma)
users.system_role = NULL      → papel definido exclusivamente por store_members

store_members.role = 'lojista'   → dono, paga a assinatura
store_members.role = 'gerente'   → operacional, sem acesso a config/billing
```

---

## ADR-004 — Pedidos como "Intenção de Pedido" sem gateway

**Contexto:** Integrar gateway de pagamento (Stripe, Pagar.me) na V1 aumentaria muito o escopo e a responsabilidade regulatória da plataforma.

**Decisão:** Registrar o pedido no banco com status inicial `'pending'` e redirecionar o cliente para o WhatsApp do lojista. O lojista gerencia o pagamento fora da plataforma e atualiza o status manualmente no painel.

**Razões:**
- Elimina PCI compliance na V1
- O lojista já usa WhatsApp como canal — não muda o hábito dele
- A plataforma ganha visibilidade (dashboard de pedidos) sem intermediar dinheiro
- Gateway pode ser adicionado na V2 sem quebrar a estrutura de `orders`

**Limitação conhecida:** Sem confirmação de pagamento automática. Aceita conscientemente para V1.

---

## ADR-005 — Snapshots em order_items

**Contexto:** Produtos podem ser editados (preço, nome) ou deletados após um pedido ser feito.

**Decisão:** `order_items` armazena `product_name` e `unit_price` como snapshots no momento do pedido. `product_id` é nullable (set null on delete).

**Razões:**
- Histórico de pedidos permanece correto mesmo após edições/deleções de produto
- Simples — sem versionamento de produto
- `product_id` nullable permite rastrear o produto de origem quando ainda existe

---

## ADR-006 — plans.features como JSONB

**Contexto:** Os limites dos planos (max produtos, max membros, features habilitadas) precisam ser flexíveis. Uma abordagem seria uma coluna por feature; outra seria JSONB.

**Decisão:** JSONB com schema documentado.

**Razões:**
- Adicionar nova feature/limite não exige migration de schema
- Admin pode alterar limites de um plano específico sem deploy
- Fácil de serializar e checar no código (`plan.features.max_products`)

**Convenção:** `null` em qualquer campo = ilimitado. Campos ausentes = feature desabilitada.

---

## ADR-007 — E-mail como único canal de notificação na V1

**Contexto:** Foram considerados e-mail, WhatsApp (API) e in-app como canais de notificação.

**Decisão:** E-mail via Mailtrap na V1. In-app como banner/toast no painel (sem tabela extra). WhatsApp na V2.

**Razões:**
- APIs de WhatsApp não-oficiais (Z-API, Evolution) têm risco de bloqueio de conta
- API oficial do Meta tem burocracia e custo de aprovação de templates
- Mailtrap é simples de integrar, tem plano gratuito generoso e já está disponível como MCP neste ambiente
- A tabela `notifications` já está preparada para `channel: 'whatsapp'` quando chegar a hora

---

## ADR-008 — Trial configurável em dois níveis

**Contexto:** O trial pode ser padrão para todos ou customizado por cliente (ex: dar 30 dias para um parceiro estratégico).

**Decisão:** `plans.trial_days` define o padrão. `subscriptions.trial_ends_at` pode ser sobrescrito manualmente por um `admin` do sistema.

**Razões:**
- Simplicidade — não há tabela extra de "override de trial"
- O admin do sistema já tem acesso ao painel de assinaturas
- Auditável — a data final fica registrada na subscription

---

## ADR-009 — Plano Gratuito sem exigir cartão

**Contexto:** Exigir cartão no cadastro do plano gratuito aumenta a fricção e reduz conversão.

**Decisão:** Plano Gratuito não exige cartão. A subscription é criada com `status: 'active'` e `mp_preapproval_id: null`.

**Consequência:** A lógica de cobrança só entra em jogo no upgrade para plano pago. O middleware trata `mp_preapproval_id = null` + `status = 'active'` como plano gratuito legítimo.

---

## Princípios Gerais de Arquitetura

1. **Schema é a lei.** `lib/db/schema.ts` é a única fonte da verdade. Nunca alterar banco diretamente — sempre via migration do Drizzle.

2. **Snapshots em dados históricos.** Qualquer dado sujeito a mudança que faça parte de um registro histórico (pedido, fatura) é armazenado como snapshot, não como referência.

3. **JSONB para extensibilidade, colunas para consultas.** Dados que precisam ser filtrados/indexados ficam em colunas. Dados de configuração flexível ficam em JSONB.

4. **Gates de plano no servidor.** Limites de plano são sempre verificados nas API routes e Server Actions — nunca apenas no front-end.

5. **Notificações são logs.** Todo envio de notificação gera um registro em `notifications`. Isso permite reenvio, auditoria e métricas sem sistema de fila na V1.

6. **Middleware como primeira linha de defesa.** Autenticação e status de subscription são verificados no middleware antes de chegar em qualquer página ou API route protegida.
