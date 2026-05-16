import { db } from '@/lib/db'
import { products, categories, storeSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import CatalogClient from '@/components/catalog/CatalogClient'

export const revalidate = 60

export default async function CatalogPage() {
  const [productRows, categoryRows, settingsRows] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        categoryId: products.categoryId,
        imageUrl: products.imageUrl,
        active: products.active,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(eq(products.active, true))
      .orderBy(products.createdAt),
    db.select().from(categories).orderBy(categories.name),
    db.select().from(storeSettings).limit(1),
  ])

  const settings = settingsRows[0]
  const mapped = productRows.map((p) => ({ ...p, price: Number(p.price) }))

  return (
    <CatalogClient
      products={mapped}
      categories={categoryRows}
      whatsappNumber={settings?.whatsappNumber ?? ''}
      storeName={settings?.storeName ?? 'Catálogo'}
    />
  )
}
