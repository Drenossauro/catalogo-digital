export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import AdminNav from '@/components/admin/AdminNav'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewProductPage() {
  const session = await auth()
  const storeId = session?.user?.storeId ?? null

  const cats = storeId
    ? await db.select().from(categories).where(eq(categories.storeId, storeId)).orderBy(categories.name)
    : []

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
        <h1 className="font-serif text-xl text-[#1a1a1a] mb-8">Novo produto</h1>
        <ProductForm categories={cats} storeId={storeId ?? undefined} />
      </main>
    </>
  )
}
