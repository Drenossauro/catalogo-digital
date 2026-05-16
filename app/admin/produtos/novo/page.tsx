export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import AdminNav from '@/components/admin/AdminNav'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewProductPage() {
  const cats = await db.select().from(categories).orderBy(categories.name)

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
        <h1 className="text-xl font-bold text-gray-900 mb-6">Novo produto</h1>
        <ProductForm categories={cats} />
      </main>
    </>
  )
}
