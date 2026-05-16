import { db } from '@/lib/db'
import { products, categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import AdminNav from '@/components/admin/AdminNav'
import { revalidatePath } from 'next/cache'

export default async function DashboardPage() {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      active: products.active,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(products.createdAt)

  async function toggleActive(id: string, active: boolean) {
    'use server'
    await db.update(products).set({ active: !active }).where(eq(products.id, id))
    revalidatePath('/admin/dashboard')
  }

  return (
    <>
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Produtos</h1>
          <Link
            href="/admin/produtos/novo"
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus size={16} />
            Novo produto
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">Nenhum produto cadastrado ainda.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Produto</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Categoria</th>
                  <th className="text-right px-4 py-3">Preço</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {product.categoryName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={toggleActive.bind(null, product.id, product.active)}>
                        <button type="submit" title={product.active ? 'Desativar' : 'Ativar'} className="cursor-pointer">
                          {product.active
                            ? <ToggleRight size={24} className="text-green-500" />
                            : <ToggleLeft size={24} className="text-gray-300" />
                          }
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/produtos/${product.id}/editar`}
                        className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
                      >
                        <Pencil size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
