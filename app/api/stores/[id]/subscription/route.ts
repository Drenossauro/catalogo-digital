export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

/**
 * Subscription management foi movido para a tabela `subscriptions`.
 * A implementação completa será feita na Fase 2 (Planos & Assinaturas).
 */
export async function PATCH() {
  return NextResponse.json(
    { error: 'Não implementado. Gerenciamento de assinatura disponível na Fase 2.' },
    { status: 501 },
  )
}
