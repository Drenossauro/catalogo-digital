'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X, Check } from 'lucide-react'

interface Plan {
  id: string
  name: string
  slug: string
  priceMonthly: string
  priceAnnual: string | null
  trialDays: number
  features: unknown
  active: boolean
}

function fmtBRL(val: string | null) {
  if (!val) return '—'
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtFeatures(raw: unknown) {
  if (!raw || typeof raw !== 'object') return '—'
  const f = raw as Record<string, unknown>
  return Object.entries(f)
    .map(([k, v]) => {
      if (v === null) return `${k}: ilimitado`
      if (v === true) return k
      if (v === false) return null
      return `${k}: ${v}`
    })
    .filter(Boolean)
    .join(' · ')
}

function PlanEditForm({ plan, onDone }: { plan: Plan; onDone: () => void }) {
  const router = useRouter()
  const [name, setName] = useState(plan.name)
  const [priceMonthly, setPriceMonthly] = useState(plan.priceMonthly)
  const [priceAnnual, setPriceAnnual] = useState(plan.priceAnnual ?? '')
  const [trialDays, setTrialDays] = useState(String(plan.trialDays))
  const [active, setActive] = useState(plan.active)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/admin/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        priceMonthly,
        priceAnnual: priceAnnual || null,
        trialDays: Number(trialDays),
        active,
      }),
    })
    setSaving(false)
    if (res.ok) { onDone(); router.refresh() }
    else setError('Erro ao salvar.')
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-white/5 border border-white/10">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white text-sm px-2 py-1.5 rounded"
          />
        </div>
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Preço mensal (R$)</label>
          <input
            value={priceMonthly}
            onChange={(e) => setPriceMonthly(e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white text-sm px-2 py-1.5 rounded"
          />
        </div>
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Preço anual (R$)</label>
          <input
            value={priceAnnual}
            onChange={(e) => setPriceAnnual(e.target.value)}
            placeholder="—"
            className="w-full bg-white/10 border border-white/20 text-white text-sm px-2 py-1.5 rounded"
          />
        </div>
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Trial (dias)</label>
          <input
            type="number"
            value={trialDays}
            onChange={(e) => setTrialDays(e.target.value)}
            min="0"
            className="w-full bg-white/10 border border-white/20 text-white text-sm px-2 py-1.5 rounded"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-blue-400"
            />
            <span className="text-sm text-white/70">Plano ativo</span>
          </label>
        </div>
      </div>
      <p className="text-[10px] text-white/20">Features (ex: limites de produtos/membros) devem ser editadas via seed ou Drizzle Studio para evitar inconsistências.</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-40 cursor-pointer"
        >
          <Check size={13} /> {saving ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          onClick={onDone}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 text-white/60 text-xs rounded hover:text-white cursor-pointer"
        >
          <X size={13} /> Cancelar
        </button>
      </div>
    </div>
  )
}

export default function PlansAdmin({ initialPlans, subscriberCounts }: {
  initialPlans: Plan[]
  subscriberCounts: Record<string, number>
}) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {initialPlans.map((plan) => (
        <div key={plan.id} className={`border ${plan.active ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-serif text-lg text-white">{plan.name}</h2>
                  {!plan.active && <span className="text-[10px] text-white/30">Inativo</span>}
                </div>
                <p className="text-xs text-white/40 font-mono">{plan.slug}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-right shrink-0">
                  <p className="text-sm text-white">{fmtBRL(plan.priceMonthly)}<span className="text-white/40 text-xs">/mês</span></p>
                  {plan.priceAnnual && (
                    <p className="text-xs text-white/40">{fmtBRL(plan.priceAnnual)}/ano</p>
                  )}
                </div>
                <button
                  onClick={() => setEditingId(editingId === plan.id ? null : plan.id)}
                  className="p-1.5 text-white/30 hover:text-white transition-colors cursor-pointer"
                  title="Editar plano"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-white/50">
              <span>{subscriberCounts[plan.id] ?? 0} assinante(s)</span>
              {plan.trialDays > 0 && <span>{plan.trialDays} dias de trial</span>}
              <span className="text-white/30">{fmtFeatures(plan.features)}</span>
            </div>
          </div>

          {editingId === plan.id && (
            <PlanEditForm plan={plan} onDone={() => setEditingId(null)} />
          )}
        </div>
      ))}
    </div>
  )
}
