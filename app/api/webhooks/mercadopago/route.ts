export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { subscriptions, stores } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookSignature, getPreApprovalClient } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  const signatureHeader = req.headers.get('x-signature')
  const requestId = req.headers.get('x-request-id')
  const notificationId = req.nextUrl.searchParams.get('id')

  // Validar assinatura HMAC
  if (!validateWebhookSignature(signatureHeader, requestId, notificationId)) {
    console.warn('[webhook/mp] Assinatura inválida')
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: true })

  const { type, data } = body as { type?: string; data?: { id?: string } }

  // Processar apenas eventos de preapproval (assinatura)
  if (type !== 'subscription_preapproval' || !data?.id) {
    return NextResponse.json({ ok: true })
  }

  try {
    const pa = getPreApprovalClient()
    const preApproval = await pa.get({ id: data.id })

    const mpStatus = preApproval.status // 'authorized' | 'paused' | 'cancelled' | 'pending'
    const mpId = String(preApproval.id)

    // Encontrar subscription pelo mpPreapprovalId
    const [sub] = await db
      .select({ id: subscriptions.id, storeId: subscriptions.storeId })
      .from(subscriptions)
      .where(eq(subscriptions.mpPreapprovalId, mpId))
      .limit(1)

    if (!sub) {
      console.warn('[webhook/mp] Preapproval não encontrado no banco:', mpId)
      return NextResponse.json({ ok: true })
    }

    let newStatus: string
    let storeStatus: string

    switch (mpStatus) {
      case 'authorized':
        newStatus = 'active'
        storeStatus = 'active'
        break
      case 'paused':
        newStatus = 'past_due'
        storeStatus = 'active' // ainda no grace period
        break
      case 'cancelled':
        newStatus = 'cancelled'
        storeStatus = 'inactive'
        break
      default:
        newStatus = 'past_due'
        storeStatus = 'active'
    }

    await db
      .update(subscriptions)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(subscriptions.id, sub.id))

    await db
      .update(stores)
      .set({ status: storeStatus, updatedAt: new Date() })
      .where(eq(stores.id, sub.storeId))

    console.info(`[webhook/mp] ${mpId} → ${newStatus}`)
  } catch (err) {
    console.error('[webhook/mp]', err)
    // Retornar 200 para evitar reenvios do MP
  }

  return NextResponse.json({ ok: true })
}
