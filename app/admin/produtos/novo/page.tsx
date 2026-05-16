import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

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
        <ProductForm categories={categories ?? []} />
      </main>
    </>
  )
}
