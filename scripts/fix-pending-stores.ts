import { Client } from 'pg'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function fix() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  const { rows } = await client.query(`
    UPDATE stores SET status = 'active', updated_at = NOW()
    WHERE status = 'pending'
    RETURNING slug, name
  `)

  if (rows.length === 0) {
    console.log('Nenhuma loja pending encontrada.')
  } else {
    console.log(`${rows.length} loja(s) ativada(s):`)
    rows.forEach((r: { slug: string; name: string }) => console.log(` - ${r.name} (${r.slug})`))
  }

  await client.end()
}

fix().catch(console.error)
