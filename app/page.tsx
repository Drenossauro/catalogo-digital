import { createClient } from '@/lib/supabase/server'
import CatalogClient from '@/components/catalog/CatalogClient'

export const revalidate = 60

export default async function CatalogPage() {
  const supabase = await createClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(id, name, slug, created_at)')
      .eq('active', true)
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ])

  return (
    <CatalogClient
      products={products ?? []}
      categories={categories ?? []}
    />
  )
}
