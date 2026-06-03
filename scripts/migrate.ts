import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  console.log('Dropando schema público...')
  await client.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`)

  console.log('Aplicando migration 0000_loving_toro...')
  const sql = readFileSync(join(process.cwd(), 'drizzle/0000_loving_toro.sql'), 'utf8')
  await client.query(sql)

  console.log('Migration aplicada com sucesso.')
  await client.end()
}

migrate().catch((err) => {
  console.error('Migration falhou:', err.message)
  process.exit(1)
})
