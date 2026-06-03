'use client'

import Link from 'next/link'
import { ExternalLink, Pencil } from 'lucide-react'

interface Store {
  id: string
  slug: string
  name: string
  status: string                    // status da loja: 'pending' | 'active' | 'inactive'
  createdAt: Date | null
  ownerEmail: string | null
  subscriptionStatus: string | null // status da subscription: 'trial' | 'active' | 'past_due' | etc.
  planName: string | null
}

interface Props { store: Store }

function StoreBadge({ storeStatus }: { storeStatus: string }) {
  if (storeStatus === 'inactive') {
    return (
      <span className="text-[10px] uppercase tracking-wider text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
        Inativa
      </span>
    )
  }
  if (storeStatus === 'pending') {
    return (
      <span className="text-[10px] uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
        Pendente
      </span>
    )
  }
  return (
    <span className="text-[10px] uppercase tracking-wider text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
      Ativa
    </span>
  )
}

function SubscriptionBadge({ status }: { status: string | null }) {
  if (!status) return null

  const map: Record<string, { label: string; color: string }> = {
    trial: { label: 'Trial', color: 'text-blue-400 bg-blue-400/10' },
    active: { label: 'Pago', color: 'text-green-400 bg-green-400/10' },
    past_due: { label: 'Vencida', color: 'text-orange-400 bg-orange-400/10' },
    cancelled: { label: 'Cancelada', color: 'text-red-400 bg-red-400/10' },
    inactive: { label: 'Bloqueada', color: 'text-red-400 bg-red-400/10' },
  }

  const badge = map[status] ?? { label: status, color: 'text-white/40 bg-white/10' }

  return (
    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${badge.color}`}>
      {badge.label}
    </span>
  )
}

export default function StoreRow({ store }: Props) {
  return (
    <div className="px-4 py-5 border-b border-white/8">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-medium text-white">{store.name}</p>
            <StoreBadge storeStatus={store.status} />
            <SubscriptionBadge status={store.subscriptionStatus} />
            {store.planName && (
              <span className="text-[10px] text-white/30">{store.planName}</span>
            )}
          </div>
          <p className="text-xs text-white/40 truncate">{store.ownerEmail ?? 'Sem lojista'}</p>
          <p className="text-xs text-white/25 font-mono mt-0.5">/loja/{store.slug}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 -ml-2">
        <Link
          href={`/loja/${store.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-white/35 hover:text-white transition-colors"
        >
          <ExternalLink size={16} strokeWidth={1.5} />
          <span>Ver</span>
        </Link>

        <Link
          href={`/superadmin/lojas/${store.id}`}
          className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-white/35 hover:text-white transition-colors"
        >
          <Pencil size={16} strokeWidth={1.5} />
          <span>Editar</span>
        </Link>
      </div>
    </div>
  )
}
