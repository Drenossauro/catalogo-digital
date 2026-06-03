'use client'

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

export default function PlansAdmin({ initialPlans, subscriberCounts }: {
  initialPlans: Plan[]
  subscriberCounts: Record<string, number>
}) {
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

  return (
    <div className="flex flex-col gap-4">
      {initialPlans.map((plan) => (
        <div key={plan.id} className={`border p-5 ${plan.active ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-serif text-lg text-white">{plan.name}</h2>
                {!plan.active && <span className="text-[10px] text-white/30">Inativo</span>}
              </div>
              <p className="text-xs text-white/40 font-mono">{plan.slug}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-white">{fmtBRL(plan.priceMonthly)}<span className="text-white/40 text-xs">/mês</span></p>
              {plan.priceAnnual && (
                <p className="text-xs text-white/40">{fmtBRL(plan.priceAnnual)}/ano</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-white/50">
            <span>{subscriberCounts[plan.id] ?? 0} assinante(s)</span>
            {plan.trialDays > 0 && <span>{plan.trialDays} dias de trial</span>}
            <span className="text-white/30">{fmtFeatures(plan.features)}</span>
          </div>
        </div>
      ))}

      <p className="text-xs text-white/20 mt-2">
        Para editar planos, use o seed ou atualize diretamente via Drizzle Studio.
        Alterações de preço não afetam assinaturas existentes.
      </p>
    </div>
  )
}
