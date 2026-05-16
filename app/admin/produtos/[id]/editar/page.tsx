export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { products, categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params

  const [product, cats] = await Promise.all([
    db.select().from(products).where(eq(products.id, id)).limit(1),
    db.select().from(categories).orderBy(categories.name),
  ])

  if (!product[0]) notFound()

  return (
    <>
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 w-fit transition-colors"
        >
          <ChevronLeft size={16} /> Voltar
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mb-6">Editar produto</h1>
        <ProductForm categories={cats} product={product[0]} />
      </main>
    </>
  )
}
