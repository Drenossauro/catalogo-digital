export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { users, storeMembers, stores } from '@/lib/db/schema'
import { eq, isNotNull } from 'drizzle-orm'

export default async function SistemaUsuariosPage() {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      systemRole: users.systemRole,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt)

  // Buscar membros com loja
  const memberships = await db
    .select({
      userId: storeMembers.userId,
      role: storeMembers.role,
      storeName: stores.name,
      storeSlug: stores.slug,
    })
    .from(storeMembers)
    .innerJoin(stores, eq(stores.id, storeMembers.storeId))
    .where(isNotNull(storeMembers.acceptedAt))

  const membersByUser = memberships.reduce<Record<string, typeof memberships>>((acc, m) => {
    if (!acc[m.userId]) acc[m.userId] = []
    acc[m.userId].push(m)
    return acc
  }, {})

  return (
    <div>
      <h1 className="font-serif text-2xl text-white mb-6">Usuários ({rows.length})</h1>

      <div className="border border-white/8 divide-y divide-white/5">
        {rows.map((user) => {
          const mems = membersByUser[user.id] ?? []
          return (
            <div key={user.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                    {user.systemRole === 'admin' && (
                      <span className="text-[10px] bg-white text-[#0F0F0F] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Admin</span>
                    )}
                  </div>
                  <p className="text-xs text-white/40">{user.email}</p>
                  {mems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {mems.map((m) => (
                        <span key={m.storeSlug} className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded">
                          {m.storeName} · {m.role}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-white/20 shrink-0">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
