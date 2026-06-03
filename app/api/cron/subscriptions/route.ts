export const dynamic = 'force-dynamic'

/**
 * Cron job diário de manutenção de assinaturas.
 * Chamado pelo Vercel Cron (vercel.json) ou manualmente.
 * Protegido por CRON_SECRET para evitar chamadas não autorizadas.
 */

import { db } from '@/lib/db'
import { subscriptions, stores } from '@/lib/db/schema'
import { eq, and, lt, isNotNull } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, subjectFor } from '@/lib/notifications/email'

const GRACE_DAYS = 3

export async function GET(req: NextRequest) {
  // Validar secret para evitar chamadas não autorizadas
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  let processed = 0

  // ── 1. Trial expirado → past_due (se tiver preapproval) ou inactive (se não tiver) ──
  const expiredTrials = await db
    .select({ id: subscriptions.id, storeId: subscriptions.storeId, mpPreapprovalId: subscriptions.mpPreapprovalId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, 'trial'),
        lt(subscriptions.trialEndsAt, now),
        isNotNull(subscriptions.trialEndsAt),
      ),
    )

  for (const sub of expiredTrials) {
    // Se tem preapproval, o MP cobrará automaticamente → mover para active
    // Se não tem (trial sem cartão, ex: plano free com trial), marcar como inactive
    const newStatus = sub.mpPreapprovalId ? 'active' : 'inactive'
    const storeStatus = sub.mpPreapprovalId ? 'active' : 'inactive'

    await db
      .update(subscriptions)
      .set({ status: newStatus, updatedAt: now })
      .where(eq(subscriptions.id, sub.id))

    await db
      .update(stores)
      .set({ status: storeStatus, updatedAt: now })
      .where(eq(stores.id, sub.storeId))

    processed++
  }

  // ── 2. Período vencido → past_due ──────────────────────────────────────────
  const expiredActive = await db
    .select({ id: subscriptions.id, storeId: subscriptions.storeId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, 'active'),
        lt(subscriptions.currentPeriodEnd, now),
      ),
    )

  for (const sub of expiredActive) {
    const gracePeriodEndsAt = new Date(now)
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + GRACE_DAYS)

    await db
      .update(subscriptions)
      .set({ status: 'past_due', gracePeriodEndsAt, updatedAt: now })
      .where(eq(subscriptions.id, sub.id))

    // Notificar lojista
    await sendEmail({
      storeId: sub.storeId,
      type: 'subscription_past_due',
      graceDaysLeft: GRACE_DAYS,
    }).catch(console.error)

    processed++
  }

  // ── 3. Grace period expirado → inactive ────────────────────────────────────
  const expiredGrace = await db
    .select({ id: subscriptions.id, storeId: subscriptions.storeId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, 'past_due'),
        lt(subscriptions.gracePeriodEndsAt, now),
        isNotNull(subscriptions.gracePeriodEndsAt),
      ),
    )

  for (const sub of expiredGrace) {
    await db
      .update(subscriptions)
      .set({ status: 'inactive', updatedAt: now })
      .where(eq(subscriptions.id, sub.id))

    await db
      .update(stores)
      .set({ status: 'inactive', updatedAt: now })
      .where(eq(stores.id, sub.storeId))

    await sendEmail({
      storeId: sub.storeId,
      type: 'subscription_inactive',
    }).catch(console.error)

    processed++
  }

  console.info(`[cron/subscriptions] Processadas ${processed} assinaturas`)
  return NextResponse.json({ ok: true, processed, timestamp: now.toISOString() })
}
