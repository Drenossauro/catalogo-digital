export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { stores, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { Plus, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react'
import SuperAdminNav from '@/components/superadmin/SuperAdminNav'
import { revalidatePath } from 'next/cache'

export default async function LojasPage() {
  const rows = await db
    .select({
      id: stores.id,
      slug: stores.slug,
      name: stores.name,
      active: stores.active,
      createdAt: stores.createdAt,
      adminEmail: users.email,
    })
    .from(stores)
    .leftJoin(users, eq(users.storeId, stores.id))
    .orderBy(stores.createdAt)

  async function toggleStoreActive(id: string, active: boolean) {
    'use server'
    await db.update(stores).set({ active: !active }).where(eq(stores.id, id))
    revalidatePath('/superadmin/lojas')
  }

  return (
    <>
      <SuperAdminNav />
      <main className="w-full py-6">
        <div className="flex items-center justify-between mb-6 px-4">
          <h1 className="font-serif text-xl text-[#1a1a1a]">Lojas</h1>
          <Link
            href="/superadmin/lojas/nova"
            className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs tracking-widest uppercase font-medium px-4 py-2.5 hover:bg-black transition-colors"
          >
            <Plus size={14} />
            Nova loja
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-24 text-[#1a1a1a]/30 px-4">
            <p className="text-sm">Nenhuma loja cadastrada ainda.</p>
          </div>
        ) : (
          <div className="border-t border-black/8 divide-y divide-black/5">
            {rows.map((store) => (
              <div key={store.id} className="flex items-center gap-4 px-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[#1a1a1a]">{store.name}</p>
                    <span className="text-xs text-[#1a1a1a]/30 font-mono">/loja/{store.slug}</span>
                    {!store.active && (
                      <span className="text-[10px] uppercase tracking-wider text-red-400 bg-red-50 px-1.5 py-0.5 rounded">
                        Inativa
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <p className="text-xs text-[#1a1a1a]/40">{store.adminEmail ?? 'Sem admin'}</p>
                    {store.createdAt && (
                      <p className="text-xs text-[#1a1a1a]/30">
                        {new Date(store.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/loja/${store.slug}`}
                  target="_blank"
                  className="text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors p-1.5"
                  title="Ver catálogo"
                >
                  <ExternalLink size={16} />
                </Link>

                <form action={toggleStoreActive.bind(null, store.id, store.active)}>
                  <button type="submit" className="cursor-pointer p-1.5" title={store.active ? 'Desativar' : 'Ativar'}>
                    {store.active
                      ? <ToggleRight size={28} className="text-[#1a1a1a]" />
                      : <ToggleLeft size={28} className="text-[#1a1a1a]/20" />
                    }
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
