const { neon } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const EMAIL = 'naymascanto@gmail.com'
const PASSWORD = '16062404'

async function main() {
  const sql = neon(process.env.DATABASE_URL)
  const hash = await bcrypt.hash(PASSWORD, 10)
  await sql`INSERT INTO users (email, password_hash) VALUES (${EMAIL}, ${hash})`
  console.log('Usuário criado com sucesso!')
}

main().catch(console.error)
