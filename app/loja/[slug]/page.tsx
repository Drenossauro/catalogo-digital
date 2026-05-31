export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { products, categories, stores } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { getTheme } from '@/lib/themes'
import CatalogClient from '@/components/catalog/CatalogClient'
import SuspendedPage from '@/components/catalog/SuspendedPage'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [store] = await db.select({ name: stores.name }).from(stores).where(eq(stores.slug, slug)).limit(1)
  return { title: store ? `${store.name} · Vitrine` : 'Vitrine' }
}

export default async function LojaPage({ params }: Props) {
  const { slug } = await params

  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, slug))
    .limit(1)

  if (!store) notFound()

  const isSuspended =
    store.subscriptionStatus === 'suspended' ||
    (store.subscriptionStatus === 'trial' && store.subscriptionExpiresAt != null && store.subscriptionExpiresAt < new Date())

  if (isSuspended) return <SuspendedPage storeName={store.name} />

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
      .where(and(eq(products.storeId, store.id), eq(products.active, true)))
      .orderBy(products.createdAt),
    db
      .select()
      .from(categories)
      .where(eq(categories.storeId, store.id))
      .orderBy(categories.name),
  ])

  const theme = getTheme(store.theme)
  const mapped = productRows.map((p) => ({ ...p, price: Number(p.price) }))

  return (
    <CatalogClient
      products={mapped}
      categories={categoryRows}
      whatsappNumber={store.whatsappNumber}
      storeName={store.name}
      maxInstallments={Number(store.maxInstallments ?? 1)}
      theme={theme}
      logoUrl={store.logoUrl ?? null}
      storeSlug={slug}
    />
  )
}
