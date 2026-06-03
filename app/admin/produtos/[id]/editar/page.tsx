export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, categories, productVariants } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getStorePlanFeatures } from '@/lib/plans'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const storeId = session?.user?.storeId ?? null

  const [productRows, cats, variants, features] = await Promise.all([
    storeId
      ? db.select().from(products).where(and(eq(products.id, id), eq(products.storeId, storeId))).limit(1)
      : [],
    storeId
      ? db.select().from(categories).where(eq(categories.storeId, storeId)).orderBy(categories.name)
      : [],
    db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(productVariants.position),
    storeId ? getStorePlanFeatures(storeId) : { has_variants: false },
  ])

  if (!productRows[0]) notFound()

  return (
    <>
      <AdminNav />
      <main className="w-full px-4 py-6">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 text-sm text-[#1a1a1a]/40 hover:text-[#1a1a1a] mb-6 w-fit transition-colors"
        >
          <ChevronLeft size={15} /> Voltar
        </Link>
        <h1 className="font-serif text-xl text-[#1a1a1a] mb-8">Editar produto</h1>
        <ProductForm
          categories={cats}
          product={productRows[0]}
          storeId={storeId ?? undefined}
          initialVariants={variants.map((v) => ({
            id: v.id,
            label: v.label,
            options: v.options as { value: string; price_modifier: number }[],
            required: v.required,
            position: v.position,
          }))}
          hasVariantsPlan={features.has_variants}
        />
      </main>
    </>
  )
}
