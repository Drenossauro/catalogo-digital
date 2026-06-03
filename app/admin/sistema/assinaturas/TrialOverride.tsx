'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TrialOverride({ subscriptionId }: { subscriptionId: string }) {
  const [open, setOpen] = useState(false)
  const [days, setDays] = useState('7')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/admin/subscriptions/${subscriptionId}/trial`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: Number(days) }),
    })
    setLoading(false)
    if (res.ok) { setOpen(false); router.refresh() }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
      >
        + Estender trial
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 mt-1">
      <input
        type="number"
        value={days}
        onChange={(e) => setDays(e.target.value)}
        min="1"
        max="365"
        className="w-14 bg-white/10 border border-white/20 text-white text-xs px-1.5 py-1 rounded"
      />
      <span className="text-[10px] text-white/40">dias</span>
      <button
        type="submit"
        disabled={loading}
        className="text-[10px] bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-40 cursor-pointer"
      >
        {loading ? '...' : 'OK'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-[10px] text-white/30 hover:text-white cursor-pointer"
      >
        ✕
      </button>
    </form>
  )
}
