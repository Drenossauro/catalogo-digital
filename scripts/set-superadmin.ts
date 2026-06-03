/**
 * Define system_role = 'admin' para um usuário existente.
 *
 * Uso:
 *   npx tsx scripts/set-superadmin.ts <email>
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { users } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

const db = drizzle(neon(process.env.DATABASE_URL!))

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Uso: npx tsx scripts/set-superadmin.ts <email>')
    process.exit(1)
  }

  await db.update(users).set({ systemRole: 'admin' }).where(eq(users.email, email))

  const [user] = await db
    .select({ email: users.email, systemRole: users.systemRole })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  console.log('Usuário atualizado:', user)
}

main().catch((e) => { console.error(e); process.exit(1) })
