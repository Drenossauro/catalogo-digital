const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('🌱 Iniciando seed...')

  // Store settings
  await sql`
    INSERT INTO store_settings (store_name, whatsapp_number, max_installments)
    VALUES ('Pratas da Nay', '5567992486473', '3')
    ON CONFLICT DO NOTHING
  `
  console.log('✓ Configurações da loja criadas')

  // Categories
  const categories = await sql`
    INSERT INTO categories (name, slug) VALUES
      ('Anéis',        'aneis'),
      ('Colares',      'colares'),
      ('Pulseiras',    'pulseiras'),
      ('Brincos',      'brincos'),
      ('Tornozeleiras','tornozeleiras')
    ON CONFLICT (slug) DO NOTHING
    RETURNING id, slug
  `
  console.log('✓ Categorias criadas')

  const bySlug = Object.fromEntries(categories.map(c => [c.slug, c.id]))

  // Products
  const products = [
    // Anéis
    { name: 'Anel Solitário Prata 925', description: 'Anel clássico solitário em prata 925, acabamento polido.', price: '89.90', slug: 'aneis' },
    { name: 'Anel com Pedra Zircônia', description: 'Anel em prata com pedra zircônia brilhante, elegante para o dia a dia.', price: '109.90', slug: 'aneis' },
    { name: 'Anel Infinity Prata', description: 'Anel símbolo do infinito em prata 925, delicado e moderno.', price: '79.90', slug: 'aneis' },
    { name: 'Anel Ajustável Folha', description: 'Anel ajustável com design de folha em prata, estilo boho.', price: '59.90', slug: 'aneis' },
    { name: 'Anel Duplo Prata', description: 'Anel duplo entrelaçado em prata 925, sofisticado e leve.', price: '99.90', slug: 'aneis' },
    { name: 'Anel Coração Prata', description: 'Anel em formato de coração, prata 925, ideal para presentear.', price: '74.90', slug: 'aneis' },

    // Colares
    { name: 'Colar Gota Prata 925', description: 'Colar delicado com pingente de gota em prata 925, corrente 45cm.', price: '129.90', slug: 'colares' },
    { name: 'Colar Choker Prata', description: 'Choker em prata com design minimalista, ajustável.', price: '89.90', slug: 'colares' },
    { name: 'Colar Coração Vazado', description: 'Colar com pingente de coração vazado em prata 925, corrente 40cm.', price: '119.90', slug: 'colares' },
    { name: 'Colar Borboleta Prata', description: 'Colar com pingente de borboleta cravejado em prata, delicado e feminino.', price: '139.90', slug: 'colares' },
    { name: 'Colar Estrela Prata', description: 'Colar com pingente de estrela em prata 925, tendência.', price: '99.90', slug: 'colares' },
    { name: 'Colar Pérola Prata', description: 'Colar com pérola natural e corrente em prata 925.', price: '159.90', slug: 'colares' },
    { name: 'Colar Olho Grego Prata', description: 'Colar protetor com símbolo olho grego em prata e esmalte azul.', price: '109.90', slug: 'colares' },

    // Pulseiras
    { name: 'Pulseira Riviera Prata', description: 'Pulseira riviera em prata 925 com zircônias, brilhante e elegante.', price: '149.90', slug: 'pulseiras' },
    { name: 'Pulseira Berloques Prata', description: 'Pulseira com espaço para berloques em prata 925, personalizável.', price: '99.90', slug: 'pulseiras' },
    { name: 'Pulseira Escrava Prata', description: 'Pulseira escrava lisa em prata 925, clássica e versátil.', price: '89.90', slug: 'pulseiras' },
    { name: 'Pulseira Elo Prata', description: 'Pulseira de elo grosso em prata 925, estilo moderno.', price: '119.90', slug: 'pulseiras' },
    { name: 'Pulseira Coração Prata', description: 'Pulseira delicada com pingente de coração em prata 925.', price: '79.90', slug: 'pulseiras' },
    { name: 'Pulseira Borboleta Prata', description: 'Pulseira com pingentes de borboleta em prata, leve e feminina.', price: '94.90', slug: 'pulseiras' },

    // Brincos
    { name: 'Brinco Argola Prata 925', description: 'Argola clássica em prata 925, tamanho médio, leve e confortável.', price: '69.90', slug: 'brincos' },
    { name: 'Brinco Ponto de Luz Prata', description: 'Brinco ponto de luz com zircônia em prata 925, discreto e elegante.', price: '59.90', slug: 'brincos' },
    { name: 'Brinco Gota Prata', description: 'Brinco pendente gota em prata 925, sofisticado para ocasiões especiais.', price: '89.90', slug: 'brincos' },
    { name: 'Brinco Ear Cuff Prata', description: 'Ear cuff em prata 925, sem necessidade de furo, tendência.', price: '54.90', slug: 'brincos' },
    { name: 'Brinco Estrela Prata', description: 'Brinco pequeno em formato de estrela em prata 925.', price: '49.90', slug: 'brincos' },
    { name: 'Brinco Argola Trabalhada', description: 'Argola com design trabalhado em prata 925, diferenciada.', price: '79.90', slug: 'brincos' },
    { name: 'Brinco Coração Prata', description: 'Brinco coração em prata 925, delicado e romântico.', price: '64.90', slug: 'brincos' },

    // Tornozeleiras
    { name: 'Tornozeleira Delicada Prata', description: 'Tornozeleira fina em prata 925, ajustável, perfeita para o verão.', price: '69.90', slug: 'tornozeleiras' },
    { name: 'Tornozeleira Berloques Prata', description: 'Tornozeleira com berloques em prata 925, charmosa e divertida.', price: '89.90', slug: 'tornozeleiras' },
    { name: 'Tornozeleira Estrela do Mar', description: 'Tornozeleira com pingente de estrela do mar em prata 925.', price: '79.90', slug: 'tornozeleiras' },
    { name: 'Tornozeleira Elo Prata', description: 'Tornozeleira de elo em prata 925, resistente e estilosa.', price: '74.90', slug: 'tornozeleiras' },
    { name: 'Tornozeleira Coração Prata', description: 'Tornozeleira com pingente de coração em prata 925, delicada.', price: '64.90', slug: 'tornozeleiras' },
  ]

  for (const p of products) {
    const categoryId = bySlug[p.slug]
    await sql`
      INSERT INTO products (name, description, price, category_id, active)
      VALUES (${p.name}, ${p.description}, ${p.price}, ${categoryId}, true)
    `
  }
  console.log(`✓ ${products.length} produtos criados`)

  console.log('🎉 Seed concluído!')
}

main().catch(console.error)
