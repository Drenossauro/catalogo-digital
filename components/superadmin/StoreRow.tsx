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
    <div className="flex items-center gap-4 px-4 py-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-white">{store.name}</p>
          <span className="text-xs text-white/25 font-mono">/loja/{store.slug}</span>
          <StatusBadge status={status} expiresAt={expiresAt} />
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-xs text-white/40">{store.adminEmail ?? 'Sem admin'}</p>
          {expiresFormatted && (
            <p className="text-xs text-white/25">vence {expiresFormatted}</p>
          )}
          {store.createdAt && (
            <p className="text-xs text-white/20">
              {new Date(store.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/loja/${store.slug}`}
          target="_blank"
          className="text-white/25 hover:text-white transition-colors p-1.5"
          title="Ver catálogo"
        >
          <ExternalLink size={15} />
        </Link>

        <Link
          href={`/superadmin/lojas/${store.id}`}
          className="text-white/25 hover:text-white transition-colors p-1.5"
          title="Editar loja"
        >
          <Pencil size={15} />
        </Link>

        <button
          onClick={() => runAction('renew')}
          disabled={loading}
          className="text-white/25 hover:text-green-400 transition-colors p-1.5 cursor-pointer disabled:opacity-30"
          title="Renovar +30 dias"
        >
          <RefreshCw size={15} />
        </button>

        {status !== 'suspended' ? (
          <button
            onClick={() => runAction('suspend')}
            disabled={loading}
            className="text-white/25 hover:text-red-400 transition-colors p-1.5 cursor-pointer disabled:opacity-30"
            title="Suspender"
          >
            <PauseCircle size={15} />
          </button>
        ) : (
          <button
            onClick={() => runAction('reactivate')}
            disabled={loading}
            className="text-white/25 hover:text-green-400 transition-colors p-1.5 cursor-pointer disabled:opacity-30"
            title="Reativar"
          >
            <PlayCircle size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
