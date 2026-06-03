export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { subscriptions, stores, plans, storeMembers, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import TrialOverride from './TrialOverride'

function fmt(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_COLOR: Record<string, string> = {
  trial: 'text-blue-400',
  active: 'text-green-400',
  past_due: 'text-orange-400',
  cancelled: 'text-red-400',
  inactive: 'text-red-400',
}

export default async function SistemaAssinaturasPage() {
  const rows = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      billingPeriod: subscriptions.billingPeriod,
      trialEndsAt: subscriptions.trialEndsAt,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      gracePeriodEndsAt: subscriptions.gracePeriodEndsAt,
      mpPreapprovalId: subscriptions.mpPreapprovalId,
      storeName: stores.name,
      storeSlug: stores.slug,
      planName: plans.name,
      priceMonthly: plans.priceMonthly,
      priceAnnual: plans.priceAnnual,
      ownerEmail: users.email,
    })
    .from(subscriptions)
    .innerJoin(stores, eq(stores.id, subscriptions.storeId))
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .leftJoin(storeMembers, and(eq(storeMembers.storeId, stores.id), eq(storeMembers.role, 'lojista')))
    .leftJoin(users, eq(users.id, storeMembers.userId))
    .orderBy(subscriptions.createdAt)

  const STATUS_LABEL: Record<string, string> = {
    trial: 'Trial', active: 'Ativo', past_due: 'Vencido', cancelled: 'Cancelado', inactive: 'Inativo',
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-white mb-6">Assinaturas ({rows.length})</h1>

      <div className="border border-white/8 divide-y divide-white/5">
        {rows.map((row) => (
          <div key={row.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-medium text-white">{row.storeName}</p>
                  <span className={`text-xs ${STATUS_COLOR[row.status] ?? 'text-white/40'}`}>
                    {STATUS_LABEL[row.status] ?? row.status}
                  </span>
                  <span className="text-xs text-white/30">{row.planName} · {row.billingPeriod === 'annual' ? 'Anual' : 'Mensal'}</span>
                </div>
                {row.ownerEmail && <p className="text-xs text-white/30">{row.ownerEmail}</p>}
                <p className="text-xs text-white/20 font-mono mt-0.5">/loja/{row.storeSlug}</p>
                <TrialOverride subscriptionId={row.id} />
              </div>
              <div className="shrink-0 text-right text-xs text-white/40">
                {row.status === 'trial' && row.trialEndsAt && (
                  <p>Trial até {fmt(row.trialEndsAt)}</p>
                )}
                <p>Renova {fmt(row.currentPeriodEnd)}</p>
                {row.status === 'past_due' && row.gracePeriodEndsAt && (
                  <p className="text-orange-400">Grace até {fmt(row.gracePeriodEndsAt)}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
