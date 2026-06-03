/**
 * Seed inicial — planos e usuário admin do sistema.
 *
 * Pré-requisito: migrations aplicadas (`npx drizzle-kit migrate`)
 *
 * Como rodar:
 *   npx tsx lib/db/seed.ts
 *
 * Variáveis de ambiente lidas de `.env.local`.
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { hash } from 'bcryptjs'
import * as schema from './schema'
import { eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function seed() {
  console.log('🌱  Iniciando seed...')

  // -------------------------------------------------------------------------
  // Planos
  // -------------------------------------------------------------------------
  const planData = [
    {
      name: 'Gratuito',
      slug: 'free',
      priceMonthly: '0.00',
      priceAnnual: null,
      trialDays: 0,
      features: {
        max_products: 10,
        max_categories: 3,
        max_members: 1,
        max_stores: 1,
        has_variants: false,
        has_qr_code: false,
        has_custom_domain: false,
      },
    },
    {
      name: 'Pro',
      slug: 'pro',
      priceMonthly: '49.00',
      priceAnnual: '470.00',
      trialDays: 14,
      features: {
        max_products: null,
        max_categories: null,
        max_members: 3,
        max_stores: 1,
        has_variants: true,
        has_qr_code: true,
        has_custom_domain: false,
      },
    },
    {
      name: 'Business',
      slug: 'business',
      priceMonthly: '99.00',
      priceAnnual: '950.00',
      trialDays: 14,
      features: {
        max_products: null,
        max_categories: null,
        max_members: null,
        max_stores: null,
        has_variants: true,
        has_qr_code: true,
        has_custom_domain: false,
      },
    },
  ]

  for (const plan of planData) {
    const existing = await db
      .select({ id: schema.plans.id })
      .from(schema.plans)
      .where(eq(schema.plans.slug, plan.slug))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(schema.plans)
        .set({ ...plan, active: true })
        .where(eq(schema.plans.slug, plan.slug))
      console.log(`  ✓ Plano "${plan.name}" atualizado`)
    } else {
      await db.insert(schema.plans).values({ ...plan, active: true })
      console.log(`  ✓ Plano "${plan.name}" criado`)
    }
  }

  // -------------------------------------------------------------------------
  // Usuário admin do sistema
  // -------------------------------------------------------------------------
  const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@catalogo.dev'
  const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'mudar@123'

  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, ADMIN_EMAIL))
    .limit(1)

  if (existing.length > 0) {
    console.log(`  ✓ Admin "${ADMIN_EMAIL}" já existe — pulando`)
  } else {
    const passwordHash = await hash(ADMIN_PASSWORD, 12)
    await db.insert(schema.users).values({
      email: ADMIN_EMAIL,
      passwordHash,
      name: 'Admin',
      systemRole: 'admin',
    })
    console.log(`  ✓ Admin "${ADMIN_EMAIL}" criado (senha: ${ADMIN_PASSWORD})`)
    console.log('  ⚠️  Altere a senha após o primeiro login!')
  }

  console.log('✅  Seed concluído!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌  Seed falhou:', err)
  process.exit(1)
})
