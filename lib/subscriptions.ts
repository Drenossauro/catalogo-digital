import { db } from '@/lib/db'
import { subscriptions, stores, plans } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'inactive'
export type BillingPeriod = 'monthly' | 'annual'

// ---------------------------------------------------------------------------
// Criar assinatura gratuita (sem MP)
// ---------------------------------------------------------------------------
export async function createFreeSubscription(storeId: string) {
  const [freePlan] = await db
    .select()
    .from(plans)
    .where(eq(plans.slug, 'free'))
    .limit(1)

  if (!freePlan) throw new Error('Plano gratuito não encontrado. Rode o seed.')

  const now = new Date()
  // Plano gratuito: período "infinito" (100 anos)
  const farFuture = new Date(now.getFullYear() + 100, now.getMonth(), now.getDate())

  const [sub] = await db
    .insert(subscriptions)
    .values({
      storeId,
      planId: freePlan.id,
      status: 'active',
      billingPeriod: 'monthly',
      currentPeriodStart: now,
      currentPeriodEnd: farFuture,
    })
    .returning()

  return sub
}

// ---------------------------------------------------------------------------
// Criar assinatura paga (após MP confirmar preapproval)
// ---------------------------------------------------------------------------
export async function createPaidSubscription(params: {
  storeId: string
  planId: string
  billingPeriod: BillingPeriod
  trialDays: number
  mpPreapprovalId: string
  mpPayerEmail: string
}) {
  const now = new Date()

  const periodEnd = new Date(now)
  if (params.billingPeriod === 'annual') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  let trialEndsAt: Date | undefined
  let status: SubscriptionStatus = 'active'

  if (params.trialDays > 0) {
    trialEndsAt = new Date(now)
    trialEndsAt.setDate(trialEndsAt.getDate() + params.trialDays)
    status = 'trial'
  }

  const [sub] = await db
    .insert(subscriptions)
    .values({
      storeId: params.storeId,
      planId: params.planId,
      status,
      billingPeriod: params.billingPeriod,
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      mpPreapprovalId: params.mpPreapprovalId,
      mpPayerEmail: params.mpPayerEmail,
    })
    .returning()

  return sub
}

// ---------------------------------------------------------------------------
// Ativar loja
// ---------------------------------------------------------------------------
export async function activateStore(storeId: string) {
  await db
    .update(stores)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(stores.id, storeId))
}

// ---------------------------------------------------------------------------
// Buscar subscription da loja com plano
// ---------------------------------------------------------------------------
export async function getStoreSubscription(storeId: string) {
  const [row] = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      billingPeriod: subscriptions.billingPeriod,
      trialEndsAt: subscriptions.trialEndsAt,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      gracePeriodEndsAt: subscriptions.gracePeriodEndsAt,
      mpPreapprovalId: subscriptions.mpPreapprovalId,
      planName: plans.name,
      planSlug: plans.slug,
      planFeatures: plans.features,
      priceMonthly: plans.priceMonthly,
      priceAnnual: plans.priceAnnual,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(eq(subscriptions.storeId, storeId))
    .limit(1)

  return row ?? null
}

// ---------------------------------------------------------------------------
// Verificar limites do plano
// ---------------------------------------------------------------------------
interface PlanFeatures {
  max_products?: number | null
  max_categories?: number | null
  max_members?: number | null
  max_stores?: number | null
  has_variants?: boolean
  has_qr_code?: boolean
  has_custom_domain?: boolean
}

export function getPlanFeatures(featuresJson: unknown): PlanFeatures {
  if (typeof featuresJson === 'object' && featuresJson !== null) {
    return featuresJson as PlanFeatures
  }
  return {}
}
