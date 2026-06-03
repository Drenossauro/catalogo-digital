export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stores, storeMembers, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { verifyInviteToken } from '@/lib/invite'

interface Params { params: Promise<{ token: string }> }

// GET — verifica validade do token
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params
  const payload = await verifyInviteToken(token)
  if (!payload) return NextResponse.json({ valid: false, error: 'Convite inválido ou expirado.' })

  const [store] = await db.select({ name: stores.name }).from(stores).where(eq(stores.id, payload.storeId)).limit(1)
  return NextResponse.json({ valid: true, storeName: store?.name ?? 'Loja', email: payload.email })
}

// POST — aceita o convite
export async function POST(_req: NextRequest, { params }: Params) {
  const { token } = await params
  const payload = await verifyInviteToken(token)
  if (!payload) return NextResponse.json({ error: 'Convite inválido ou expirado.' }, { status: 400 })

  const session = await auth()

  // Usuário precisa estar logado com o e-mail do convite
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Faça login com o e-mail ' + payload.email + ' para aceitar o convite.' },
      { status: 401 },
    )
  }
  if (session.user.email.toLowerCase() !== payload.email.toLowerCase()) {
    return NextResponse.json(
      { error: `Este convite é para ${payload.email}. Faça login com esse e-mail.` },
      { status: 403 },
    )
  }

  // Buscar o userId da sessão
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  // Verificar se já é membro
  const [existing] = await db
    .select({ id: storeMembers.id, acceptedAt: storeMembers.acceptedAt })
    .from(storeMembers)
    .where(and(eq(storeMembers.storeId, payload.storeId), eq(storeMembers.userId, user.id)))
    .limit(1)

  if (existing?.acceptedAt) {
    return NextResponse.json({ ok: true, message: 'Você já é membro desta loja.' })
  }

  if (existing) {
    // Atualizar convite pendente para aceito
    await db
      .update(storeMembers)
      .set({ acceptedAt: new Date() })
      .where(eq(storeMembers.id, existing.id))
  } else {
    // Criar novo membro
    await db.insert(storeMembers).values({
      storeId: payload.storeId,
      userId: user.id,
      role: payload.role,
      acceptedAt: new Date(),
    })
  }

  return NextResponse.json({ ok: true })
}
