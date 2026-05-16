export const dynamic = 'force-dynamic'

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
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-xl text-[#1a1a1a]">Produtos</h1>
          <Link
            href="/admin/produtos/novo"
            className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs tracking-widest uppercase font-medium px-4 py-2.5 hover:bg-black transition-colors"
          >
            <Plus size={14} />
            Novo
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-24 text-[#1a1a1a]/30">
            <p className="text-sm">Nenhum produto cadastrado ainda.</p>
          </div>
        ) : (
          <>
            {/* Mobile: lista */}
            <div className="flex flex-col divide-y divide-black/5 sm:hidden">
              {rows.map((product) => (
                <div key={product.id} className="flex items-center gap-3 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a1a] truncate">{product.name}</p>
                    <p className="text-xs text-[#1a1a1a]/40 mt-0.5">
                      {product.categoryName ?? 'Sem categoria'} · R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <form action={toggleActive.bind(null, product.id, product.active)}>
                    <button type="submit" className="cursor-pointer p-1">
                      {product.active
                        ? <ToggleRight size={26} className="text-[#1a1a1a]" />
                        : <ToggleLeft size={26} className="text-[#1a1a1a]/20" />
                      }
                    </button>
                  </form>
                  <Link
                    href={`/admin/produtos/${product.id}/editar`}
                    className="text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors p-1"
                  >
                    <Pencil size={15} />
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop: tabela */}
            <div className="hidden sm:block border-t border-black/8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/8">
                    <th className="text-left py-3 text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wider">Produto</th>
                    <th className="text-left py-3 text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wider">Categoria</th>
                    <th className="text-right py-3 text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wider">Preço</th>
                    <th className="text-center py-3 text-xs font-medium text-[#1a1a1a]/40 uppercase tracking-wider">Visível</th>
                    <th className="py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {rows.map((product) => (
                    <tr key={product.id} className="group">
                      <td className="py-3.5 font-medium text-[#1a1a1a] max-w-[240px] truncate pr-4">
                        {product.name}
                      </td>
                      <td className="py-3.5 text-[#1a1a1a]/50 pr-4">
                        {product.categoryName ?? '—'}
                      </td>
                      <td className="py-3.5 text-right text-[#1a1a1a] font-medium pr-4">
                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3.5 text-center pr-4">
                        <form action={toggleActive.bind(null, product.id, product.active)}>
                          <button type="submit" className="cursor-pointer">
                            {product.active
                              ? <ToggleRight size={22} className="text-[#1a1a1a]" />
                              : <ToggleLeft size={22} className="text-[#1a1a1a]/20" />
                            }
                          </button>
                        </form>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/admin/produtos/${product.id}/editar`}
                          className="text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors inline-block p-1"
                        >
                          <Pencil size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  )
}
