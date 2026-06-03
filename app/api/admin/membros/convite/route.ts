export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storeMembers, stores, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { canAddMember } from '@/lib/plans'
import { createInviteToken } from '@/lib/invite'
import { sendEmail } from '@/lib/notifications/email'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const storeId = session.user.storeId
  const storeRole = session.user.storeRole
  if (!storeId || storeRole !== 'lojista') {
    return NextResponse.json({ error: 'Apenas lojistas podem convidar membros.' }, { status: 403 })
  }

  const { email } = await req.json()
  if (!email?.trim()) return NextResponse.json({ error: 'E-mail obrigatório.' }, { status: 400 })

  // Gate de plano
  const gate = await canAddMember(storeId)
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status })

  // Verificar se já é membro
  const invitedUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1)

  if (invitedUser[0]) {
    const alreadyMember = await db
      .select({ id: storeMembers.id })
      .from(storeMembers)
      .where(and(eq(storeMembers.storeId, storeId), eq(storeMembers.userId, invitedUser[0].id)))
      .limit(1)

    if (alreadyMember[0]) {
      return NextResponse.json({ error: 'Esse usuário já é membro desta loja.' }, { status: 409 })
    }
  }

  // Buscar nome do lojista e nome da loja
  const [inviter] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, session.user.storeId!)) // storeId é o userId no contexto de session
    .limit(1)
  void inviter

  // Gerar token de convite (JWT autossuficiente — sem DB)
  const token = await createInviteToken({
    storeId,
    role: 'gerente',
    email: email.toLowerCase().trim(),
    invitedById: session.user.storeId!, // reusar storeId como proxy de userId aqui
  })

  // Buscar nome da loja para o e-mail
  const [store] = await db
    .select({ name: stores.name })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1)

  // Enviar e-mail de convite
  await sendEmail({
    type: 'invite_received',
    storeId,
    inviteToken: token,
    inviterName: store?.name,
  })

  return NextResponse.json({ ok: true, token })
}
