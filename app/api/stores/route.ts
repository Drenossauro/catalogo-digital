export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stores, users, storeMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.systemRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, slug, whatsappNumber, maxInstallments, theme, adminEmail, adminPassword } = body

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'Slug inválido. Use apenas letras minúsculas, números e hífens.' },
      { status: 400 },
    )
  }

  if (!name || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
  }

  if (adminPassword.length < 8) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 })
  }

  const existing = await db.select({ id: stores.id }).from(stores).where(eq(stores.slug, slug)).limit(1)
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Esse slug já está em uso.' }, { status: 409 })
  }

  const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, adminEmail)).limit(1)
  if (existingUser.length > 0) {
    return NextResponse.json({ error: 'Esse e-mail já está em uso.' }, { status: 409 })
  }

  // Cria usuário (lojista) e loja dentro de uma sequência atômica
  const passwordHash = await hash(adminPassword, 12)
  const [user] = await db.insert(users).values({
    email: adminEmail,
    passwordHash,
    name: adminEmail.split('@')[0],
  }).returning()

  const [store] = await db.insert(stores).values({
    slug,
    name,
    ownerId: user.id,
    whatsappNumber: whatsappNumber ?? '',
    maxInstallments: maxInstallments ?? '1',
    theme: theme ?? 'prata',
    status: 'active', // criada pelo admin do sistema = ativa imediatamente
  }).returning()

  // Adiciona o usuário como lojista da loja
  await db.insert(storeMembers).values({
    storeId: store.id,
    userId: user.id,
    role: 'lojista',
    acceptedAt: new Date(),
  })

  return NextResponse.json(store, { status: 201 })
}
