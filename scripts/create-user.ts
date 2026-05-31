import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), 'env.local') })
config({ path: resolve(process.cwd(), '.env.local') })

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { users } from '../lib/db/schema'
import { hash } from 'bcryptjs'

const [,, email, password, role = 'admin'] = process.argv

async function main() {
  if (!email || !password) {
    console.error('Usage: tsx scripts/create-user.ts <email> <password> [role]')
    process.exit(1)
  }

  const db = drizzle(neon(process.env.DATABASE_URL!))
  const passwordHash = await hash(password, 12)

  const [user] = await db.insert(users).values({ email, passwordHash, role }).returning({ id: users.id, email: users.email, role: users.role })
  console.log('Usuário criado:', user)
}

main().catch((e) => { console.error(e); process.exit(1) })
