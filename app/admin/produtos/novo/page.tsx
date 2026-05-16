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
      <main className="max-w-lg mx-auto px-4 py-6">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 text-sm text-[#1a1a1a]/40 hover:text-[#1a1a1a] mb-6 w-fit transition-colors"
        >
          <ChevronLeft size={15} /> Voltar
        </Link>
        <h1 className="font-serif text-xl text-[#1a1a1a] mb-8">Novo produto</h1>
        <ProductForm categories={cats} />
      </main>
    </>
  )
}
