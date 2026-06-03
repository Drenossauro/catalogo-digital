# Catálogo Digital

Sistema B2B multi-tenant de catálogo digital de produtos. Cada loja tem seu catálogo público (`/loja/[slug]`), painel admin protegido por login e integração com WhatsApp para pedidos.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Neon PostgreSQL · Drizzle ORM · NextAuth v5 · Cloudinary

---

## Executando localmente

### Pré-requisitos

- Node.js 20+
- npm 10+
- Conta no [Neon](https://neon.tech) (banco PostgreSQL serverless gratuito)
- Conta no [Cloudinary](https://cloudinary.com) (plano gratuito suficiente)

### 1. Clone e instale as dependências

```bash
git clone <url-do-repositorio>
cd catalogo-digital
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
# Neon PostgreSQL — copie a connection string do painel do Neon
DATABASE_URL=postgres://user:password@host/dbname?sslmode=require

# NextAuth — gere um segredo aleatório
AUTH_SECRET=<rode: openssl rand -hex 32>

# WhatsApp — código do país + DDD + número, sem espaço nem caracteres especiais
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999

# Cloudinary — encontre no painel em Settings > Account
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_UPLOAD_PRESET=seu_upload_preset_sem_assinatura
```

> **Cloudinary:** No painel, vá em **Settings → Upload → Upload presets** e crie um preset com *Signing Mode* = **Unsigned**.

### 3. Crie e aplique o schema no banco

```bash
# Gera os arquivos de migration a partir do schema Drizzle
npx drizzle-kit generate

# Aplica as migrations no banco Neon
npx drizzle-kit migrate
```

### 4. Crie o primeiro usuário superadmin

Execute o SQL abaixo no console do Neon (ou via `npx drizzle-kit studio`), substituindo email e hash da senha:

```sql
-- Gere o hash da senha com: node -e "require('bcryptjs').hash('suasenha', 12).then(console.log)"
INSERT INTO users (email, password_hash, role)
VALUES ('admin@exemplo.com', '$2b$12$...hash...', 'superadmin');
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

| Rota | Descrição |
|---|---|
| `/` | Home pública |
| `/loja/[slug]` | Catálogo público de uma loja |
| `/admin/login` | Login do administrador de loja |
| `/admin/dashboard` | Painel do admin |
| `/superadmin/lojas` | Painel do superadmin (todas as lojas) |

---

## Banco de dados

O schema vive em [`lib/db/schema.ts`](lib/db/schema.ts) e é gerenciado pelo Drizzle ORM.

```bash
npx drizzle-kit studio   # UI visual do banco em localhost:4983
npx drizzle-kit generate # Gera migration após alterar o schema
npx drizzle-kit migrate  # Aplica migrations pendentes
```

## Scripts disponíveis

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run start      # Servidor de produção
npm run lint       # Lint com ESLint
npm run deploy     # Executa scripts/deploy.ps1

npm run db:generate  # Gera migration após alterar lib/db/schema.ts
npm run db:migrate   # Aplica migrations pendentes no Neon
npm run db:studio    # UI visual do banco em localhost:4983
npm run db:seed      # Seed de planos + usuário admin do sistema
```

---

Para mais detalhes sobre a arquitetura, modelo de dados e decisões técnicas, consulte [CONTEXT.md](CONTEXT.md).
