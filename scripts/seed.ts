/**
 * Seed de desenvolvimento — cria loja demo com produtos de exemplo.
 * NÃO usar em produção. Use lib/db/seed.ts para seed de planos e admin.
 *
 * Uso:
 *   npx tsx scripts/seed.ts <email-do-lojista>
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { users, stores, categories, products, storeMembers } from '../lib/db/schema'
import { eq, and } from 'drizzle-orm'

async function main() {
  const email = process.argv[2] ?? 'lojista@demo.com'
  const db = drizzle(neon(process.env.DATABASE_URL!))

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user) {
    console.error(`Usuário "${email}" não encontrado. Crie-o primeiro com scripts/create-user.ts`)
    process.exit(1)
  }

  console.log('Usuário:', user.email)

  const slug = 'loja-demo'
  let storeId: string

  const [existingStore] = await db.select({ id: stores.id }).from(stores).where(eq(stores.slug, slug)).limit(1)
  if (existingStore) {
    storeId = existingStore.id
    console.log('Loja demo já existe:', slug)
  } else {
    const [store] = await db.insert(stores).values({
      slug,
      name: 'Loja Demo',
      ownerId: user.id,
      whatsappNumber: '5511999999999',
      maxInstallments: '3',
      theme: 'prata',
      status: 'active',
    }).returning()
    storeId = store.id
    console.log('Loja criada:', store.slug)

    await db.insert(storeMembers).values({
      storeId,
      userId: user.id,
      role: 'lojista',
      acceptedAt: new Date(),
    })
    console.log('Membro adicionado')
  }

  const catNames = ['Anéis', 'Colares', 'Brincos', 'Pulseiras', 'Conjuntos']
  const createdCats: Record<string, string> = {}

  for (const [i, name] of catNames.entries()) {
    const catSlug = name
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.slug, catSlug), eq(categories.storeId, storeId)))
      .limit(1)

    if (existing) {
      createdCats[name] = existing.id
    } else {
      const [cat] = await db.insert(categories).values({
        name, slug: catSlug, storeId, position: i,
      }).returning()
      createdCats[name] = cat.id
      console.log('Categoria:', cat.name)
    }
  }

  const productData = [
    { name: 'Anel Solitário Prata 925', price: '89.90', cat: 'Anéis', desc: 'Anel solitário em prata 925 com zircônia.' },
    { name: 'Anel Duplo Trançado', price: '74.90', cat: 'Anéis', desc: 'Design moderno com duas fileiras trançadas.' },
    { name: 'Colar Ponto de Luz', price: '129.90', cat: 'Colares', desc: 'Colar delicado com pingente de zircônia.' },
    { name: 'Colar Choker Camadas', price: '99.90', cat: 'Colares', desc: 'Choker de camadas em prata.' },
    { name: 'Brinco Argola Lisa P', price: '59.90', cat: 'Brincos', desc: 'Argola pequena lisa em prata 925.' },
    { name: 'Brinco Gota com Zircônia', price: '79.90', cat: 'Brincos', desc: 'Brinco gota com pedras de zircônia.' },
    { name: 'Pulseira Elo Cartier', price: '109.90', cat: 'Pulseiras', desc: 'Pulseira elo cartier em prata 925.' },
    { name: 'Conjunto Colar + Brinco Pérola', price: '159.90', cat: 'Conjuntos', desc: 'Conjunto completo com colar e brincos.' },
  ]

  for (const [i, p] of productData.entries()) {
    const [product] = await db.insert(products).values({
      name: p.name,
      description: p.desc,
      price: p.price,
      categoryId: createdCats[p.cat] ?? null,
      storeId,
      active: true,
      position: i,
    }).returning()
    console.log('Produto:', product.name)
  }

  console.log('\n✅ Seed de desenvolvimento concluído!')
}

main().catch((e) => { console.error(e); process.exit(1) })
