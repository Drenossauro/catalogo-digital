'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Pencil, RefreshCw, PauseCircle, PlayCircle } from 'lucide-react'

interface Store {
  id: string
  slug: string
  name: string
  subscriptionStatus: string
  subscriptionExpiresAt: Date | null
  createdAt: Date | null
  adminEmail: string | null
}

interface Props { store: Store }

function StatusBadge({ status, expiresAt }: { status: string; expiresAt: Date | null }) {
  const now = new Date()
  const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000) : null

  if (status === 'suspended') {
    return (
      <span className="text-[10px] uppercase tracking-wider text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
        Suspensa
      </span>
    )
  }
  if (status === 'trial') {
    return (
      <span className="text-[10px] uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
        Trial
      </span>
    )
  }
  if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) {
    return (
      <span className="text-[10px] uppercase tracking-wider text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
        Vence em {daysLeft}d
      </span>
    )
  }
  return (
    <span className="text-[10px] uppercase tracking-wider text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
      Ativa
    </span>
  )
}

export default function StoreRow({ store }: Props) {
  const [status, setStatus] = useState(store.subscriptionStatus)
  const [expiresAt, setExpiresAt] = useState<Date | null>(store.subscriptionExpiresAt)
  const [loading, setLoading] = useState(false)

  async function runAction(action: 'renew' | 'suspend' | 'reactivate') {
    setLoading(true)
    const res = await fetch(`/api/stores/${store.id}/subscription`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      const data = await res.json()
      setStatus(data.subscriptionStatus)
      setExpiresAt(data.subscriptionExpiresAt ? new Date(data.subscriptionExpiresAt) : null)
    }
    setLoading(false)
  }

  const expiresFormatted = expiresAt
    ? new Date(expiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="px-4 py-5 border-b border-white/8">
      {/* Info */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-medium text-white">{store.name}</p>
            <StatusBadge status={status} expiresAt={expiresAt} />
          </div>
          <p className="text-xs text-white/40 truncate">{store.adminEmail ?? 'Sem admin'}</p>
          <p className="text-xs text-white/25 font-mono mt-0.5">/loja/{store.slug}</p>
        </div>
        {expiresFormatted && (
          <p className="text-xs text-white/25 shrink-0">vence {expiresFormatted}</p>
        )}
      </div>

      {/* Actions — labels visíveis, tap targets grandes */}
      <div className="flex items-center gap-1 -ml-2">
        <Link
          href={`/loja/${store.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-white/35 hover:text-white transition-colors"
          title="Ver catálogo"
        >
          <ExternalLink size={16} strokeWidth={1.5} />
          <span>Ver</span>
        </Link>

        <Link
          href={`/superadmin/lojas/${store.id}`}
          className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-white/35 hover:text-white transition-colors"
          title="Editar loja"
        >
          <Pencil size={16} strokeWidth={1.5} />
          <span>Editar</span>
        </Link>

        <button
          onClick={() => runAction('renew')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-white/35 hover:text-green-400 transition-colors cursor-pointer disabled:opacity-30"
          title="Renovar +30 dias"
        >
          <RefreshCw size={16} strokeWidth={1.5} />
          <span>Renovar</span>
        </button>

        {status !== 'suspended' ? (
          <button
            onClick={() => runAction('suspend')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-white/35 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-30"
            title="Suspender"
          >
            <PauseCircle size={16} strokeWidth={1.5} />
            <span>Suspender</span>
          </button>
        ) : (
          <button
            onClick={() => runAction('reactivate')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-white/35 hover:text-green-400 transition-colors cursor-pointer disabled:opacity-30"
            title="Reativar"
          >
            <PlayCircle size={16} strokeWidth={1.5} />
            <span>Ativar</span>
          </button>
        )}
      </div>
    </div>
  )
}
