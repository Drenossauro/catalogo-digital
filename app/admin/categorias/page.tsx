export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories, products } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import AdminNav from '@/components/admin/AdminNav'
import CategoriasManager from '@/components/admin/CategoriasManager'

export default async function CategoriasPage() {
  const session = await auth()
  const storeId = session?.user?.storeId ?? null

  const rows = storeId
    ? await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          createdAt: categories.createdAt,
          productCount: sql<number>`count(${products.id})::int`,
        })
        .from(categories)
        .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.storeId, storeId)))
        .where(eq(categories.storeId, storeId))
        .groupBy(categories.id)
        .orderBy(categories.name)
    : []

  return (
    <>
      <AdminNav />
      <main className="w-full px-4 py-6">
        <h1 className="font-serif text-xl text-[#1a1a1a] mb-8">Categorias</h1>
        <CategoriasManager initialCategories={rows} />
      </main>
    </>
  )
}
