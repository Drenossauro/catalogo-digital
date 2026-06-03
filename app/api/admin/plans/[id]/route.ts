import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { plans } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.systemRole !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json() as {
    name?: string
    priceMonthly?: string
    priceAnnual?: string | null
    trialDays?: number
    active?: boolean
  }

  await db
    .update(plans)
    .set(body)
    .where(eq(plans.id, id))

  return NextResponse.json({ ok: true })
}
