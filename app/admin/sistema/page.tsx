export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { stores, subscriptions, orders, users } from '@/lib/db/schema'
import { eq, count, sql } from 'drizzle-orm'

async function getMetrics() {
  const [
    [totalStores],
    [activeStores],
    [trialStores],
    [pastDueStores],
    [totalUsers],
    [totalOrders],
    mrr,
  ] = await Promise.all([
    db.select({ value: count() }).from(stores),
    db.select({ value: count() }).from(stores).where(eq(stores.status, 'active')),
    db.select({ value: count() }).from(subscriptions).where(eq(subscriptions.status, 'trial')),
    db.select({ value: count() }).from(subscriptions).where(eq(subscriptions.status, 'past_due')),
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(orders),
    db.execute(sql`
      SELECT COALESCE(SUM(
        CASE
          WHEN s.billing_period = 'annual' THEN p.price_annual / 12
          ELSE p.price_monthly
        END
      ), 0) as mrr
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.status IN ('active', 'past_due')
        AND p.price_monthly > 0
    `),
  ])

  const mrrValue = Number((mrr.rows[0] as { mrr: string })?.mrr ?? 0)

  return {
    totalStores: totalStores.value,
    activeStores: activeStores.value,
    trialStores: trialStores.value,
    pastDueStores: pastDueStores.value,
    totalUsers: totalUsers.value,
    totalOrders: totalOrders.value,
    mrr: mrrValue,
  }
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-white/10 p-5">
      <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{label}</p>
      <p className="font-serif text-3xl text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  )
}

export default async function SistemaPage() {
  const m = await getMetrics()

  return (
    <div>
      <h1 className="font-serif text-2xl text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="MRR"
          value={m.mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          sub="Receita mensal recorrente"
        />
        <StatCard label="Lojas ativas" value={m.activeStores} sub={`de ${m.totalStores} total`} />
        <StatCard label="Em trial" value={m.trialStores} />
        <StatCard label="Inadimplentes" value={m.pastDueStores} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Usuários" value={m.totalUsers} />
        <StatCard label="Pedidos registrados" value={m.totalOrders} />
        <StatCard label="Lojas totais" value={m.totalStores} />
      </div>
    </div>
  )
}
