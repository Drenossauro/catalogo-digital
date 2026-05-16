export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { products, categories, storeSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import CategoryPageClient from '@/components/catalog/CategoryPageClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params

  const [[category], settingsRows, productRows] = await Promise.all([
    db.select().from(categories).where(eq(categories.slug, slug)).limit(1),
    db.select().from(storeSettings).limit(1),
    db.select().from(products).where(eq(products.active, true)).orderBy(products.createdAt),
  ])

  if (!category) notFound()

  const settings = settingsRows[0]
  const catProducts = productRows
    .filter((p) => p.categoryId === category.id)
    .map((p) => ({ ...p, price: Number(p.price) }))

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5]">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors">
            <ChevronLeft size={20} strokeWidth={1.5} />
          </Link>
          <h1 className="font-serif text-xl tracking-wide">{category.name}</h1>
        </div>
      </header>

      <CategoryPageClient
        products={catProducts}
        whatsappNumber={settings?.whatsappNumber ?? ''}
        maxInstallments={Number(settings?.maxInstallments ?? 1)}
      />
    </div>
  )
}
