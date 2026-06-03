'use client'

import { useState } from 'react'
import { ShoppingBag, ChevronDown } from 'lucide-react'

type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'

interface Order {
  id: string
  customerName: string
  customerPhone: string
  status: string
  total: string
  notes: string | null
  internalNotes: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending:    { label: 'Pendente',    color: 'bg-yellow-100 text-yellow-800' },
  confirmed:  { label: 'Confirmado',  color: 'bg-blue-100 text-blue-800' },
  in_progress:{ label: 'Em preparo', color: 'bg-purple-100 text-purple-800' },
  ready:      { label: 'Pronto',      color: 'bg-green-100 text-green-800' },
  delivered:  { label: 'Entregue',    color: 'bg-green-200 text-green-900' },
  cancelled:  { label: 'Cancelado',   color: 'bg-red-100 text-red-700' },
}

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'in_progress',
  in_progress: 'ready',
  ready: 'delivered',
  delivered: null,
  cancelled: null,
}

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled']

function fmt(d: Date | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function OrdersClient({ initialOrders, storeId }: { initialOrders: Order[]; storeId: string }) {
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [expanding, setExpanding] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  void storeId

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdating(orderId)
    const res = await fetch(`/api/admin/pedidos/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
    }
    setUpdating(null)
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-24 text-[#1a1a1a]/20 px-4">
        <ShoppingBag size={40} strokeWidth={1} className="mx-auto mb-4" />
        <p className="text-sm">Nenhum pedido ainda.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Filtros de status */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer ${filter === 'all' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-black/15 text-[#1a1a1a]/60 hover:border-[#1a1a1a]/40'}`}
        >
          Todos ({orders.length})
        </button>
        {STATUS_ORDER.map((s) => {
          const count = orders.filter((o) => o.status === s).length
          if (count === 0) return null
          const cfg = STATUS_CONFIG[s]
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer ${filter === s ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-black/15 text-[#1a1a1a]/60 hover:border-[#1a1a1a]/40'}`}
            >
              {cfg.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Lista de pedidos */}
      <div className="border-t border-black/8 divide-y divide-black/5">
        {filtered.map((order) => {
          const status = order.status as OrderStatus
          const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
          const next = NEXT_STATUS[status]
          const isExpanded = expanding === order.id

          return (
            <div key={order.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">{order.customerName}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#1a1a1a]/50">{order.customerPhone}</p>
                  <p className="text-xs text-[#1a1a1a]/40 mt-0.5">
                    {fmt(order.createdAt)} · #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    R$ {Number(order.total).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {next && (
                  <button
                    onClick={() => updateStatus(order.id, next)}
                    disabled={updating === order.id}
                    className="px-3 py-1.5 bg-[#1a1a1a] text-white text-xs rounded-full cursor-pointer hover:bg-black transition-colors disabled:opacity-40"
                  >
                    → {STATUS_CONFIG[next].label}
                  </button>
                )}
                {status !== 'cancelled' && status !== 'delivered' && (
                  <button
                    onClick={() => updateStatus(order.id, 'cancelled')}
                    disabled={updating === order.id}
                    className="px-3 py-1.5 border border-red-200 text-red-500 text-xs rounded-full cursor-pointer hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={() => setExpanding(isExpanded ? null : order.id)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-black/15 text-xs text-[#1a1a1a]/60 rounded-full cursor-pointer hover:border-[#1a1a1a]/40 transition-colors ml-auto"
                >
                  Detalhes <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Detalhes expandidos */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-black/8 text-xs text-[#1a1a1a]/60 space-y-1.5">
                  {order.notes && <p><span className="text-[#1a1a1a]/40">Obs. cliente:</span> {order.notes}</p>}
                  {order.internalNotes && <p><span className="text-[#1a1a1a]/40">Obs. interna:</span> {order.internalNotes}</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
