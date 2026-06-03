import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
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
  const { days } = await req.json() as { days: number }

  if (!days || days < 1 || days > 365) {
    return NextResponse.json({ error: 'Dias inválidos (1–365).' }, { status: 400 })
  }

  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1)
  if (!sub) return NextResponse.json({ error: 'Assinatura não encontrada.' }, { status: 404 })

  const base = sub.trialEndsAt && sub.trialEndsAt > new Date() ? sub.trialEndsAt : new Date()
  const newTrialEndsAt = new Date(base)
  newTrialEndsAt.setDate(newTrialEndsAt.getDate() + days)

  await db
    .update(subscriptions)
    .set({
      trialEndsAt: newTrialEndsAt,
      status: 'trial',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, id))

  return NextResponse.json({ ok: true, trialEndsAt: newTrialEndsAt.toISOString() })
}
