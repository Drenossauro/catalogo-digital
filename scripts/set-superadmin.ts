import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), 'env.local') })
config({ path: resolve(process.cwd(), '.env.local') })

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { users } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
const db = drizzle(neon(process.env.DATABASE_URL!))

async function main() {
  const email = process.argv[2] ?? 'araujoasa16@gmail.com'

  await db.update(users).set({ role: 'superadmin' }).where(eq(users.email, email))

  const [user] = await db
    .select({ email: users.email, role: users.role, storeId: users.storeId })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  console.log('Role atualizado:', user)
}

main().catch((e) => { console.error(e); process.exit(1) })
