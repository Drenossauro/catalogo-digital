export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { plans } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import PlansClient from './PlansClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Planos · Vitrine' }

export default async function PlanosPage() {
  const rows = await db
    .select()
    .from(plans)
    .where(eq(plans.active, true))
    .orderBy(plans.priceMonthly)

  return <PlansClient plans={rows} />
}
