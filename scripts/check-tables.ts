import { Client } from 'pg'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `)

  console.log('Tabelas no banco:')
  rows.forEach(r => console.log(' -', r.table_name))

  await client.end()
}

check().catch(console.error)
