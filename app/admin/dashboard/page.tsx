export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, categories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import Link from 'next/link'
import { Plus, Pencil, ToggleLeft, ToggleRight, Package, Tags, ExternalLink, Check } from 'lucide-react'
import AdminNav from '@/components/admin/AdminNav'
import { revalidatePath } from 'next/cache'

export default async function DashboardPage() {
  const session = await auth()
  const storeId = session?.user?.storeId ?? null

  const [rows, categoryRows] = await Promise.all([
    storeId
      ? db.select({
          id: products.id,
          name: products.name,
          price: products.price,
          active: products.active,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.storeId, storeId))
        .orderBy(products.createdAt)
      : Promise.resolve([]),
    storeId
      ? db.select({ id: categories.id }).from(categories).where(eq(categories.storeId, storeId)).limit(1)
      : Promise.resolve([]),
  ])

  const hasCategories = categoryRows.length > 0
  const hasProducts = rows.length > 0
  const storeSlug = session?.user?.storeSlug ?? null

  async function toggleActive(id: string, active: boolean) {
    'use server'
    await db.update(products).set({ active: !active }).where(eq(products.id, id))
    revalidatePath('/admin/dashboard')
  }

  return (
    <>
      <AdminNav />
      <main className="w-full py-6">
        <div className="flex items-center justify-between mb-6 px-4">
          <h1 className="font-serif text-xl text-[#1a1a1a]">Produtos</h1>
          <Link
            href="/admin/produtos/novo"
            className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs tracking-widest uppercase font-medium px-4 py-2.5 hover:bg-black transition-colors"
          >
            <Plus size={14} />
            Novo
          </Link>
        </div>

        {!storeId ? (
          <div className="text-center py-24 text-[#1a1a1a]/30 px-4">
            <p className="text-sm">Sua conta não está associada a nenhuma loja.</p>
          </div>
        ) : !hasProducts ? (
          /* Onboarding checklist */
          <div className="px-4 max-w-md mx-auto py-12">
            <p className="font-serif text-xl text-[#1a1a1a] mb-2">Boas-vindas! ✦</p>
            <p className="text-sm text-[#1a1a1a]/50 mb-8">Complete os passos abaixo para publicar seu catálogo.</p>
            <ol className="flex flex-col gap-4">
              {[
                { done: true,          icon: Check,       label: 'Conta criada',                        href: null },
                { done: true,          icon: Check,       label: 'Plano escolhido',                     href: null },
                { done: hasCategories, icon: Tags,        label: 'Crie sua primeira categoria',          href: '/admin/categorias' },
                { done: false,         icon: Package,     label: 'Adicione seu primeiro produto',        href: '/admin/produtos/novo' },
                { done: false,         icon: ExternalLink, label: 'Compartilhe o link do seu catálogo', href: storeSlug ? `/loja/${storeSlug}` : null },
              ].map(({ done, icon: Icon, label, href }, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-[#1a1a1a]' : 'border border-black/20'}`}>
                    {done
                      ? <Check size={14} className="text-white" />
                      : <Icon size={14} className="text-[#1a1a1a]/30" />
                    }
                  </div>
                  <div className="flex-1">
                    {href && !done ? (
                      <Link href={href} className="text-sm text-[#1a1a1a] underline underline-offset-2 hover:opacity-70 transition-opacity">
                        {label}
                      </Link>
                    ) : (
                      <span className={`text-sm ${done ? 'text-[#1a1a1a]/40 line-through' : 'text-[#1a1a1a]'}`}>{label}</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <>
            {/* Mobile: lista full-bleed */}
            <div className="flex flex-col sm:hidden border-t border-black/8">
              {rows.map((product) => (
                <div key={product.id} className="flex items-center gap-2 px-4 py-5 border-b border-black/5">
                  {/* Tap no texto → editar */}
                  <Link href={`/admin/produtos/${product.id}/editar`} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{product.name}</p>
                    <p className="text-xs text-[#1a1a1a]/40 mt-0.5">
                      {product.categoryName ?? 'Sem categoria'} · R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </p>
                  </Link>
                  <form action={toggleActive.bind(null, product.id, product.active)}>
                    <button type="submit" className="cursor-pointer p-2.5 -mr-1">
                      {product.active
                        ? <ToggleRight size={32} className="text-[#1a1a1a]" />
                        : <ToggleLeft size={32} className="text-[#1a1a1a]/20" />
                      }
                    </button>
                  </form>
                </div>
              ))}
            </div>

            {/* Desktop: tabela */}
            <div className="hidden sm:block px-4 border-t border-black/8">
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
