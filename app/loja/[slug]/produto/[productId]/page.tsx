export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { products, stores, productVariants, categories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { getTheme } from '@/lib/themes'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import ProductDetailClient from '@/components/catalog/ProductDetailClient'

interface Props {
  params: Promise<{ slug: string; productId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productId } = await params
  const [row] = await db
    .select({ name: products.name, description: products.description })
    .from(products)
    .innerJoin(stores, eq(stores.id, products.storeId))
    .where(and(eq(stores.slug, slug), eq(products.id, productId)))
    .limit(1)
  return {
    title: row ? `${row.name} · Vitrine` : 'Produto',
    description: row?.description ?? undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug, productId } = await params

  const [store] = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1)
  if (!store) notFound()

  const [product] = await db
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
    .where(and(eq(products.id, productId), eq(products.storeId, store.id), eq(products.active, true)))
    .limit(1)

  if (!product) notFound()

  const [variantRows, categoryRow] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, product.id)).orderBy(productVariants.position),
    product.categoryId
      ? db.select({ name: categories.name, slug: categories.slug }).from(categories).where(eq(categories.id, product.categoryId)).limit(1)
      : Promise.resolve([]),
  ])

  const theme = getTheme(store.theme)
  const catInfo = Array.isArray(categoryRow) ? categoryRow[0] : undefined

  const mapped = {
    ...product,
    price: Number(product.price),
    variants: variantRows.map((v) => ({
      ...v,
      options: v.options as { value: string; price_modifier: number }[],
    })),
  }

  const backHref = catInfo
    ? `/loja/${slug}/categoria/${catInfo.slug}`
    : `/loja/${slug}`

  return (
    <div
      className="min-h-screen w-full"
      style={{
        '--font-serif': theme.fontSerif,
        '--font-sans': theme.fontSans,
        background: theme.bg,
        color: theme.text,
      } as React.CSSProperties}
    >
      {/* Header com navegação */}
      <header
        className="sticky top-0 z-20 backdrop-blur-md border-b"
        style={{ background: theme.navBg, borderColor: theme.border }}
      >
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            href={backHref}
            className="flex items-center gap-1 text-sm transition-opacity hover:opacity-60"
            style={{ color: theme.textMuted }}
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
            <span>{catInfo?.name ?? store.name}</span>
          </Link>
        </div>
      </header>

      <ProductDetailClient
        product={mapped}
        storeSlug={slug}
        maxInstallments={Number(store.maxInstallments ?? 1)}
        theme={theme}
      />
    </div>
  )
}
