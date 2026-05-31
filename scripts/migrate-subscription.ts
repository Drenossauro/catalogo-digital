import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), 'env.local') })
config({ path: resolve(process.cwd(), '.env.local') })

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) throw new Error('DATABASE_URL not found')

  const client = neon(DATABASE_URL)
  const db = drizzle(client)

  console.log('Running subscription migration...')

  await db.execute(sql`
    ALTER TABLE stores
      ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp;
  `)

  // Migrate existing inactive stores to 'suspended'
  await db.execute(sql`
    UPDATE stores
    SET subscription_status = 'suspended'
    WHERE active = false
      AND subscription_status = 'active';
  `)

  // Drop legacy active column from stores
  await db.execute(sql`
    ALTER TABLE stores DROP COLUMN IF EXISTS active;
  `)

  console.log('Migration complete.')
}

main().catch((e) => { console.error(e); process.exit(1) })
