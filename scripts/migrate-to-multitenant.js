// migrate-to-multitenant.js
// Migrates existing single-tenant data to the multi-tenant stores structure.
//
// What it does:
// 1. Reads the first row from store_settings table
// 2. Creates a row in stores table with that data + slug 'pratas-da-nay'
// 3. Updates all products to have store_id = new store id
// 4. Updates all categories to have store_id = new store id
// 5. Updates the first user to have role = 'superadmin' and store_id = null
// Prints instructions on what to do next (create admin user for Nay via superadmin panel)

require('dotenv').config({ path: '.env.local' })

const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL)

async function run() {
  console.log('🚀 Starting multi-tenant migration...\n')

  // 1. Read first store_settings row
  const [settings] = await sql`SELECT * FROM store_settings LIMIT 1`

  if (!settings) {
    console.log('⚠️  No store_settings found. Skipping settings migration.')
  } else {
    console.log(`Found store_settings: "${settings.store_name}"`)
  }

  // 2. Check if a store with this slug already exists
  const [existingStore] = await sql`SELECT * FROM stores WHERE slug = 'pratas-da-nay' LIMIT 1`

  let storeId

  if (existingStore) {
    console.log(`Store 'pratas-da-nay' already exists (id: ${existingStore.id}). Using existing.`)
    storeId = existingStore.id
  } else {
    // Insert new store
    const [newStore] = await sql`
      INSERT INTO stores (slug, name, whatsapp_number, max_installments, theme, logo_url, active)
      VALUES (
        'pratas-da-nay',
        ${settings?.store_name ?? 'Pratas da Nay'},
        ${settings?.whatsapp_number ?? ''},
        ${settings?.max_installments ?? '1'},
        ${settings?.theme ?? 'prata'},
        ${settings?.logo_url ?? null},
        true
      )
      RETURNING *
    `
    storeId = newStore.id
    console.log(`✅ Created store 'pratas-da-nay' (id: ${storeId})`)
  }

  // 3. Update all products to have store_id
  const productsResult = await sql`
    UPDATE products SET store_id = ${storeId} WHERE store_id IS NULL
  `
  console.log(`✅ Updated products with store_id`)

  // 4. Update all categories to have store_id
  const categoriesResult = await sql`
    UPDATE categories SET store_id = ${storeId} WHERE store_id IS NULL
  `
  console.log(`✅ Updated categories with store_id`)

  // 5. Update first user to be superadmin with no store
  const [firstUser] = await sql`SELECT * FROM users ORDER BY created_at ASC LIMIT 1`

  if (firstUser) {
    await sql`
      UPDATE users SET role = 'superadmin', store_id = NULL WHERE id = ${firstUser.id}
    `
    console.log(`✅ Updated user "${firstUser.email}" → role=superadmin, store_id=null`)
  } else {
    console.log('⚠️  No users found. Skipping user migration.')
  }

  console.log('\n✅ Migration complete!\n')
  console.log('📋 Next steps:')
  console.log('   1. Log in as superadmin with your existing credentials')
  console.log('   2. Go to /superadmin/lojas')
  console.log('   3. Create a new store for "Pratas da Nay" with a dedicated admin login')
  console.log('   4. The admin user for that store will use the credentials you set in step 3')
  console.log('   5. All existing products and categories are now linked to store slug "pratas-da-nay"')
  console.log('\n   The catalog URL for this store is: /loja/pratas-da-nay')
}

run().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
