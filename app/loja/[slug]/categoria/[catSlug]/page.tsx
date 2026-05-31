export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { products, categories, stores } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getTheme } from '@/lib/themes'
import CategoryPageClient from '@/components/catalog/CategoryPageClient'

interface Props {
  params: Promise<{ slug: string; catSlug: string }>
}

export default async function LojaCategoryPage({ params }: Props) {
  const { slug, catSlug } = await params

  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, slug))
    .limit(1)

  if (!store) notFound()

  const isSuspended =
    store.subscriptionStatus === 'suspended' ||
    (store.subscriptionStatus === 'trial' && store.subscriptionExpiresAt != null && store.subscriptionExpiresAt < new Date())

  if (isSuspended) notFound()

  const [[category], productRows] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, catSlug), eq(categories.storeId, store.id)))
      .limit(1),
    db
      .select()
      .from(products)
      .where(and(eq(products.storeId, store.id), eq(products.active, true)))
      .orderBy(products.createdAt),
  ])

  if (!category) notFound()

  const theme = getTheme(store.theme)
  const catProducts = productRows
    .filter((p) => p.categoryId === category.id)
    .map((p) => ({ ...p, price: Number(p.price) }))

  return (
    <div className="w-full min-h-screen" style={{ background: theme.bg, color: theme.text }}>
      <header
        className="sticky top-0 z-30 backdrop-blur-md border-b"
        style={{ background: theme.navBg, borderColor: theme.border, fontFamily: theme.fontSans }}
      >
        <div className="w-full px-4 h-14 flex items-center gap-3">
          <Link href={`/loja/${slug}`} className="transition-colors" style={{ color: theme.textMuted }}>
            <ChevronLeft size={20} strokeWidth={1.5} />
          </Link>
          <h1 className="font-serif text-xl tracking-wide">{category.name}</h1>
        </div>
      </header>

      <CategoryPageClient
        products={catProducts}
        whatsappNumber={store.whatsappNumber}
        maxInstallments={Number(store.maxInstallments ?? 1)}
        theme={theme}
        storeSlug={slug}
      />
    </div>
  )
}
