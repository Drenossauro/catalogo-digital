import { db } from '@/lib/db'
import { subscriptions, plans, products, categories, storeMembers } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

// ---------------------------------------------------------------------------
// Carrega features do plano ativo da loja
// ---------------------------------------------------------------------------
export async function getStorePlanFeatures(storeId: string) {
  const [row] = await db
    .select({ features: plans.features })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(eq(subscriptions.storeId, storeId))
    .limit(1)

  const f = (row?.features ?? {}) as Record<string, unknown>
  return {
    max_products: (f.max_products as number | null | undefined) ?? null,
    max_categories: (f.max_categories as number | null | undefined) ?? null,
    max_members: (f.max_members as number | null | undefined) ?? null,
    max_stores: (f.max_stores as number | null | undefined) ?? null,
    has_variants: (f.has_variants as boolean | undefined) ?? false,
    has_qr_code: (f.has_qr_code as boolean | undefined) ?? false,
    has_custom_domain: (f.has_custom_domain as boolean | undefined) ?? false,
  }
}

type GateResult = { ok: true } | { ok: false; reason: string; status: 403 }

// ---------------------------------------------------------------------------
// Gate: criar produto
// ---------------------------------------------------------------------------
export async function canCreateProduct(storeId: string): Promise<GateResult> {
  const f = await getStorePlanFeatures(storeId)
  if (f.max_products === null) return { ok: true }

  const [{ value }] = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.storeId, storeId))

  if (value >= f.max_products) {
    return {
      ok: false,
      reason: `Seu plano permite até ${f.max_products} produto(s). Faça upgrade para adicionar mais.`,
      status: 403,
    }
  }
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Gate: criar categoria
// ---------------------------------------------------------------------------
export async function canCreateCategory(storeId: string): Promise<GateResult> {
  const f = await getStorePlanFeatures(storeId)
  if (f.max_categories === null) return { ok: true }

  const [{ value }] = await db
    .select({ value: count() })
    .from(categories)
    .where(eq(categories.storeId, storeId))

  if (value >= f.max_categories) {
    return {
      ok: false,
      reason: `Seu plano permite até ${f.max_categories} categoria(s). Faça upgrade para adicionar mais.`,
      status: 403,
    }
  }
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Gate: adicionar membro
// ---------------------------------------------------------------------------
export async function canAddMember(storeId: string): Promise<GateResult> {
  const f = await getStorePlanFeatures(storeId)
  if (f.max_members === null) return { ok: true }

  const [{ value }] = await db
    .select({ value: count() })
    .from(storeMembers)
    .where(eq(storeMembers.storeId, storeId))

  if (value >= f.max_members) {
    return {
      ok: false,
      reason: `Seu plano permite até ${f.max_members} membro(s). Faça upgrade para adicionar mais.`,
      status: 403,
    }
  }
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Gate: usar variantes de produto
// ---------------------------------------------------------------------------
export async function canUseVariants(storeId: string): Promise<GateResult> {
  const f = await getStorePlanFeatures(storeId)
  if (f.has_variants) return { ok: true }
  return {
    ok: false,
    reason: 'Variantes de produto estão disponíveis apenas nos planos Pro e Business.',
    status: 403,
  }
}
