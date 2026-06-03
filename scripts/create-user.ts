/**
 * Cria um usuário no banco.
 *
 * Uso:
 *   npx tsx scripts/create-user.ts <email> <senha> [system_role]
 *
 * Exemplos:
 *   npx tsx scripts/create-user.ts admin@site.com senha123 admin   ← admin do sistema
 *   npx tsx scripts/create-user.ts joao@loja.com senha123          ← lojista (sem system_role)
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { users } from '../lib/db/schema'
import { hash } from 'bcryptjs'

const [,, email, password, systemRole] = process.argv

async function main() {
  if (!email || !password) {
    console.error('Uso: npx tsx scripts/create-user.ts <email> <senha> [system_role]')
    process.exit(1)
  }

  const db = drizzle(neon(process.env.DATABASE_URL!))
  const passwordHash = await hash(password, 12)

  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name: email.split('@')[0],
      systemRole: systemRole ?? null,
    })
    .returning({ id: users.id, email: users.email, systemRole: users.systemRole })

  console.log('Usuário criado:', user)
}

main().catch((e) => { console.error(e); process.exit(1) })
