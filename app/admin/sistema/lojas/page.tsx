export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { stores, storeMembers, users, subscriptions, plans } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import Link from 'next/link'
import { ExternalLink, Pencil } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'text-green-400 bg-green-400/10',
    pending: 'text-yellow-400 bg-yellow-400/10',
    inactive: 'text-red-400 bg-red-400/10',
  }
  const labels: Record<string, string> = { active: 'Ativa', pending: 'Pendente', inactive: 'Inativa' }
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${map[status] ?? 'text-white/40 bg-white/10'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function SubBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-[10px] text-white/20">Sem plano</span>
  const map: Record<string, string> = {
    trial: 'text-blue-400',
    active: 'text-green-400',
    past_due: 'text-orange-400',
    cancelled: 'text-red-400',
    inactive: 'text-red-400',
  }
  const labels: Record<string, string> = { trial: 'Trial', active: 'Pago', past_due: 'Vencida', cancelled: 'Cancelada', inactive: 'Bloqueada' }
  return <span className={`text-[10px] ${map[status] ?? 'text-white/40'}`}>{labels[status] ?? status}</span>
}

export default async function SistemaLojasPage() {
  const rows = await db
    .select({
      id: stores.id,
      slug: stores.slug,
      name: stores.name,
      status: stores.status,
      createdAt: stores.createdAt,
      ownerEmail: users.email,
      subStatus: subscriptions.status,
      planName: plans.name,
    })
    .from(stores)
    .leftJoin(storeMembers, and(eq(storeMembers.storeId, stores.id), eq(storeMembers.role, 'lojista')))
    .leftJoin(users, eq(users.id, storeMembers.userId))
    .leftJoin(subscriptions, eq(subscriptions.storeId, stores.id))
    .leftJoin(plans, eq(plans.id, subscriptions.planId))
    .orderBy(stores.createdAt)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-white">Lojas ({rows.length})</h1>
        <Link href="/superadmin/lojas/nova" className="text-xs bg-white text-[#0F0F0F] px-4 py-2 hover:bg-white/90 transition-colors uppercase tracking-widest font-medium">
          + Nova loja
        </Link>
      </div>

      <div className="border border-white/8 divide-y divide-white/5">
        {rows.map((row) => (
          <div key={row.id} className="px-4 py-4 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="text-sm font-medium text-white">{row.name}</p>
                <StatusBadge status={row.status} />
                <SubBadge status={row.subStatus ?? null} />
                {row.planName && <span className="text-[10px] text-white/20">{row.planName}</span>}
              </div>
              <p className="text-xs text-white/30 font-mono">/loja/{row.slug}</p>
              {row.ownerEmail && <p className="text-xs text-white/25">{row.ownerEmail}</p>}
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Link href={`/loja/${row.slug}`} target="_blank" className="text-white/30 hover:text-white transition-colors p-1">
                <ExternalLink size={15} />
              </Link>
              <Link href={`/superadmin/lojas/${row.id}`} className="text-white/30 hover:text-white transition-colors p-1">
                <Pencil size={15} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
