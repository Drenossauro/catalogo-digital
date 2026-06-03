export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { plans } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import {
  createFreeSubscription,
  createPaidSubscription,
  activateStore,
  type BillingPeriod,
} from '@/lib/subscriptions'
import { createPreApproval } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const storeId = session.user.storeId
  if (!storeId) {
    return NextResponse.json({ error: 'Nenhuma loja encontrada.' }, { status: 400 })
  }

  const body = await req.json()
  const { planSlug, billingPeriod, mpFormData } = body as {
    planSlug: string
    billingPeriod: BillingPeriod
    mpFormData?: Record<string, unknown>
  }

  // Buscar plano
  const [plan] = await db
    .select()
    .from(plans)
    .where(eq(plans.slug, planSlug))
    .limit(1)

  if (!plan) {
    return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 })
  }

  try {
    // --- Plano gratuito ---
    if (planSlug === 'free') {
      await createFreeSubscription(storeId)
      await activateStore(storeId)
      return NextResponse.json({ ok: true, redirect: '/admin/dashboard' })
    }

    // --- Planos pagos ---
    if (!mpFormData?.token) {
      return NextResponse.json({ error: 'Dados de pagamento ausentes.' }, { status: 400 })
    }

    const amount =
      billingPeriod === 'annual'
        ? Number(plan.priceAnnual ?? plan.priceMonthly)
        : Number(plan.priceMonthly)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const preApproval = await createPreApproval({
      payerEmail: session.user.email ?? (mpFormData.payer as { email?: string })?.email ?? '',
      cardTokenId: mpFormData.token as string,
      planName: `${plan.name} ${billingPeriod === 'annual' ? 'Anual' : 'Mensal'}`,
      amountBRL: amount,
      trialDays: plan.trialDays ?? 0,
      backUrl: `${appUrl}/admin/dashboard`,
    })

    await createPaidSubscription({
      storeId,
      planId: plan.id,
      billingPeriod,
      trialDays: plan.trialDays ?? 0,
      mpPreapprovalId: String(preApproval.id),
      mpPayerEmail: String(preApproval.payer_email ?? ''),
    })

    await activateStore(storeId)
    return NextResponse.json({ ok: true, redirect: '/admin/dashboard' })
  } catch (err) {
    console.error('[assinatura/criar]', err)
    return NextResponse.json(
      { error: 'Falha ao processar assinatura. Verifique os dados do cartão.' },
      { status: 422 },
    )
  }
}
