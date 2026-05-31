# Catálogo Digital — Visão de Produto

## O que é

SaaS B2B para revendedoras autônomas (bijuterias, prata, cosméticos, roupas etc.) que precisam de um catálogo online profissional mas não têm conhecimento técnico para criar um site. A loja fica no ar com link próprio, tema visual personalizado e integração com WhatsApp.

---

## Perfis de usuário

### 1. Lojista (`role: admin`)
A revendedora que assina o serviço.

**Acesso:** `/admin`

**Pode:**
- Gerenciar seus produtos (criar, editar, excluir, ocultar)
- Organizar categorias
- Configurar nome da loja, logo, tema visual, número do WhatsApp
- Definir número máximo de parcelas exibidas no catálogo
- Ver e compartilhar o link + QR code do catálogo

**Não pode:**
- Ver ou acessar dados de outras lojas
- Gerenciar assinaturas diretamente
- Criar novos usuários

---

### 2. Master Admin (`role: superadmin`)
Os donos do SaaS (você, sócio, cônjuge).

**Acesso:** `/superadmin`

**Pode:**
- Criar novas lojas com credenciais de acesso para o lojista
- Ativar e desativar lojas
- Visualizar todas as lojas cadastradas
- Acessar qualquer catálogo de loja
- Gerenciar assinaturas (marcar como pago, definir vencimento, suspender)
- Promover usuários a superadmin

---

## Modelo de negócio

- **Assinatura mensal** por loja ativa
- Onboarding feito manualmente pelo superadmin (cria a loja, entrega as credenciais)
- Não há self-service de cadastro — toda loja é criada pelo master admin

---

## Catálogo público

Cada loja tem seu catálogo acessível em:
```
/loja/[slug]
```

**Funcionalidades do catálogo:**
- Navegação por categorias
- Carrinho (sessão local, sem login)
- Botão "Pedir via WhatsApp" com mensagem pré-formatada com os itens do carrinho
- Tema visual escolhido pelo lojista (fonte + paleta de cores)
- Logo da loja ou nome em texto
- CTA no rodapé para aquisição de novo catálogo

---

## Roadmap

### ✅ Fase 1 — MVP (concluído)
- [x] Catálogo público com carrinho e WhatsApp
- [x] Painel admin: produtos, categorias, configurações
- [x] Upload de imagem (Cloudinary)
- [x] Temas visuais predefinidos (8 temas)
- [x] Upload de logo
- [x] QR code + share no painel admin

### ✅ Fase 2 — Multi-tenant (concluído)
- [x] Tabela `stores` no banco
- [x] Isolamento por `storeId` em produtos e categorias
- [x] Roles: `admin` e `superadmin`
- [x] Painel superadmin: listar e criar lojas
- [x] Rotas por loja: `/loja/[slug]`
- [x] Script de migração dos dados existentes

### 🔜 Fase 3 — Assinaturas
- [ ] Campo `subscriptionStatus` na tabela `stores` (`active` | `suspended` | `trial`)
- [ ] Campo `subscriptionExpiresAt` (data de vencimento)
- [ ] Painel superadmin: exibir status e vencimento de cada loja
- [ ] Botão superadmin: renovar / suspender assinatura
- [ ] Catálogo exibe página de suspensão quando loja está inativa
- [ ] (Futuro) Integração com gateway de pagamento para cobrança automática

### 🔜 Fase 4 — Experiência do lojista
- [ ] Página de perfil do lojista (trocar senha, trocar email)
- [ ] Notificação de vencimento próximo (email ou WhatsApp)
- [ ] Dashboard com métricas básicas (nº de produtos, acessos ao catálogo)
- [ ] Ordenação manual de produtos e categorias

### 💡 Fase 5 — Crescimento (em aberto)
- [ ] Subdomínio customizado por loja (ex: `nay.catalogodigital.com.br`)
- [ ] Domínio próprio da lojista apontando para o catálogo
- [ ] Múltiplos usuários por loja (vendedora + gerente)
- [ ] Variantes de produto (tamanho, cor)
- [ ] Cupom de desconto
- [ ] Integração com Instagram (importar fotos)

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Banco de dados | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Autenticação | NextAuth.js v5 (credentials + JWT) |
| Upload de imagens | Cloudinary |
| Estilização | Tailwind CSS v4 |
| Deploy | Vercel |
| Fontes | Google Fonts via `next/font` |

---

## Estrutura de rotas

```
/                          → Catálogo legado (Pratas da Nay)
/loja/[slug]               → Catálogo por loja (multi-tenant)
/loja/[slug]/categoria/[catSlug]

/admin/login               → Login do lojista
/admin/dashboard           → Produtos da loja
/admin/produtos/novo
/admin/produtos/[id]/editar
/admin/categorias
/admin/configuracoes       → Tema, logo, WhatsApp

/superadmin/lojas          → Lista de todas as lojas
/superadmin/lojas/nova     → Criar nova loja + credenciais
```

---

## Decisões de produto

**Por que não tem self-service?**
O público-alvo tem baixa familiaridade técnica. O onboarding manual garante que a lojista entregue as informações corretas e o master admin configure tudo antes de ela acessar pela primeira vez. Reduz suporte e churn no início.

**Por que WhatsApp e não checkout?**
O processo de venda das revendedoras já acontece via WhatsApp. O catálogo é um facilitador do fluxo existente, não uma ruptura. Adicionar checkout exigiria gateway, gestão de pedidos e logística — escopo que vai além do MVP.

**Por que temas fixos e não editor livre?**
Temas predefinidos garantem qualidade visual mesmo sem conhecimento de design. Um editor livre produziria combinações ruins e aumentaria o tempo de suporte.
