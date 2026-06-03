export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { products, categories, stores, productVariants } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
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

  // Loja inativa = inadimplente ou suspensa pelo admin
  if (store.status === 'inactive') return <SuspendedPage storeName={store.name} />

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
      .orderBy(products.position, products.createdAt),
    db
      .select()
      .from(categories)
      .where(eq(categories.storeId, store.id))
      .orderBy(categories.position, categories.name),
  ])

  // Buscar variantes dos produtos
  const productIds = productRows.map((p) => p.id)
  const variantRows = productIds.length > 0
    ? await db
        .select()
        .from(productVariants)
        .where(inArray(productVariants.productId, productIds))
        .orderBy(productVariants.position)
    : []

  const variantsByProduct = variantRows.reduce<Record<string, typeof variantRows>>((acc, v) => {
    if (!acc[v.productId]) acc[v.productId] = []
    acc[v.productId].push(v)
    return acc
  }, {})

  const theme = getTheme(store.theme)
  const mapped = productRows.map((p) => ({
    ...p,
    price: Number(p.price),
    variants: (variantsByProduct[p.id] ?? []).map((v) => ({
      ...v,
      options: v.options as { value: string; price_modifier: number }[],
    })),
  }))

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
