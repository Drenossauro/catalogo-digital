export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { plans, subscriptions } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import PlansAdmin from './PlansAdmin'

export default async function SistemaplanosPage() {
  const rows = await db.select().from(plans).orderBy(plans.priceMonthly)

  const counts = await Promise.all(
    rows.map((p) =>
      db.select({ value: count() }).from(subscriptions).where(eq(subscriptions.planId, p.id))
        .then(([r]) => ({ planId: p.id, count: r.value })),
    ),
  )

  const countMap = Object.fromEntries(counts.map((c) => [c.planId, c.count]))

  return (
    <div>
      <h1 className="font-serif text-2xl text-white mb-6">Planos</h1>
      <PlansAdmin initialPlans={rows} subscriberCounts={countMap} />
    </div>
  )
}
