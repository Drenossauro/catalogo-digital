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
      <main className="w-full px-4 py-6">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 text-sm text-[#1a1a1a]/40 hover:text-[#1a1a1a] mb-6 w-fit transition-colors"
        >
          <ChevronLeft size={15} /> Voltar
        </Link>
        <h1 className="font-serif text-xl text-[#1a1a1a] mb-8">Editar produto</h1>
        <ProductForm categories={cats} product={product[0]} />
      </main>
    </>
  )
}
