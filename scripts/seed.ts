import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), 'env.local') })
config({ path: resolve(process.cwd(), '.env.local') })

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { users, stores, categories, products } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

const db = drizzle(neon(process.env.DATABASE_URL!))

async function main() {
  // 1. Busca o usuário
  const [user] = await db.select().from(users).where(eq(users.email, 'araujoasa16@gmail.com')).limit(1)
  if (!user) throw new Error('Usuário não encontrado')
  console.log('Usuário:', user.email, '— storeId atual:', user.storeId)

  // 2. Cria a loja se ainda não existe
  let storeId = user.storeId ?? null

  if (!storeId) {
    const [store] = await db.insert(stores).values({
      slug: 'minha-loja',
      name: 'Minha Loja',
      whatsappNumber: '5511999999999',
      maxInstallments: '3',
      theme: 'prata',
      subscriptionStatus: 'active',
    }).returning()
    storeId = store.id
    console.log('Loja criada:', store.slug)

    // Vincula o usuário à loja
    await db.update(users).set({ storeId, role: 'admin' }).where(eq(users.id, user.id))
    console.log('Usuário vinculado à loja')
  } else {
    console.log('Loja já existente, usando storeId:', storeId)
  }

  // 3. Categorias
  const catNames = ['Anéis', 'Colares', 'Brincos', 'Pulseiras', 'Conjuntos']
  const createdCats: Record<string, string> = {}

  for (const name of catNames) {
    const slug = name
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const existing = await db.select().from(categories).where(eq(categories.slug, `${slug}-${storeId.slice(0,6)}`)).limit(1)
    if (existing.length > 0) {
      createdCats[name] = existing[0].id
      continue
    }

    const [cat] = await db.insert(categories).values({
      name,
      slug: `${slug}-${storeId.slice(0, 6)}`,
      storeId,
    }).returning()
    createdCats[name] = cat.id
    console.log('Categoria:', cat.name)
  }

  // 4. Produtos
  const productData = [
    { name: 'Anel Solitário Prata 925', price: '89.90', categoryName: 'Anéis', description: 'Anel solitário em prata 925 com zircônia. Tamanho ajustável.' },
    { name: 'Anel Duplo Trançado', price: '74.90', categoryName: 'Anéis', description: 'Design moderno com duas fileiras trançadas em prata.' },
    { name: 'Anel Falange com Pedra', price: '49.90', categoryName: 'Anéis', description: 'Anel de falange com pedra natural colorida. Delicado e elegante.' },
    { name: 'Colar Ponto de Luz', price: '129.90', categoryName: 'Colares', description: 'Colar delicado com pingente de zircônia. Corrente em prata 925.' },
    { name: 'Colar Choker Camadas', price: '99.90', categoryName: 'Colares', description: 'Choker de camadas em prata com detalhes texturizados.' },
    { name: 'Colar Coração Vazado', price: '89.90', categoryName: 'Colares', description: 'Pingente coração vazado em prata 925 com corrente fina.' },
    { name: 'Brinco Argola Lisa P', price: '59.90', categoryName: 'Brincos', description: 'Argola pequena lisa em prata 925. Minimalista e versátil.' },
    { name: 'Brinco Gota com Zircônia', price: '79.90', categoryName: 'Brincos', description: 'Brinco gota com pedras de zircônia branca. Elegante e sofisticado.' },
    { name: 'Brinco Ear Cuff Folhas', price: '64.90', categoryName: 'Brincos', description: 'Ear cuff delicado com design de folhas. Sem necessidade de furo.' },
    { name: 'Pulseira Elo Cartier', price: '109.90', categoryName: 'Pulseiras', description: 'Pulseira elo cartier em prata 925. Fecho de segurança.' },
    { name: 'Pulseira Berloques', price: '94.90', categoryName: 'Pulseiras', description: 'Pulseira com berloques variados em prata. Personalizável.' },
    { name: 'Conjunto Colar + Brinco Pérola', price: '159.90', categoryName: 'Conjuntos', description: 'Conjunto completo com colar e brincos de pérola sintética e prata.' },
    { name: 'Conjunto Minimalista 3 Peças', price: '189.90', categoryName: 'Conjuntos', description: 'Kit com anel, colar e brinco em prata 925. Estilo clean.' },
  ]

  for (const p of productData) {
    const [product] = await db.insert(products).values({
      name: p.name,
      description: p.description,
      price: p.price,
      categoryId: createdCats[p.categoryName] ?? null,
      storeId,
      active: true,
    }).returning()
    console.log('Produto:', product.name, '— R$', product.price)
  }

  console.log('\nSeed concluído!')
}

main().catch((e) => { console.error(e); process.exit(1) })
