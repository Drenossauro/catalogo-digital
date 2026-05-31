export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { stores, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import SuperAdminNav from '@/components/superadmin/SuperAdminNav'
import StoreRow from '@/components/superadmin/StoreRow'

export default async function LojasPage() {
  const rows = await db
    .select({
      id: stores.id,
      slug: stores.slug,
      name: stores.name,
      subscriptionStatus: stores.subscriptionStatus,
      subscriptionExpiresAt: stores.subscriptionExpiresAt,
      createdAt: stores.createdAt,
      adminEmail: users.email,
    })
    .from(stores)
    .leftJoin(users, eq(users.storeId, stores.id))
    .orderBy(stores.createdAt)

  return (
    <>
      <SuperAdminNav />
      <main className="w-full py-6">
        <div className="flex items-center justify-between mb-6 px-4">
          <h1 className="font-serif text-xl text-white">Lojas</h1>
          <Link
            href="/superadmin/lojas/nova"
            className="flex items-center gap-1.5 bg-white text-[#0F0F0F] text-xs tracking-widest uppercase font-medium px-4 py-2.5 hover:bg-white/90 transition-colors"
          >
            <Plus size={14} />
            Nova loja
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-24 text-white/20 px-4">
            <p className="text-sm">Nenhuma loja cadastrada ainda.</p>
          </div>
        ) : (
          <div className="border-t border-white/8 divide-y divide-white/5">
            {rows.map((store) => (
              <StoreRow key={store.id} store={store} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
