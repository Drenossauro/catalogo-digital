import { db } from '@/lib/db'
import { products, categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import CatalogClient from '@/components/catalog/CatalogClient'

export const revalidate = 60

export default async function CatalogPage() {
  const [productRows, categoryRows] = await Promise.all([
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
  ])

  const mapped = productRows.map((p) => ({
    ...p,
    price: Number(p.price),
  }))

  return <CatalogClient products={mapped} categories={categoryRows} />
}
