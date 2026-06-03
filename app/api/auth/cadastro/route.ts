export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { users, stores, storeMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, email, password, slug } = await req.json()

  // Validações básicas
  if (!name?.trim() || !email?.trim() || !password || !slug?.trim()) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 })
  }
  if (!/^[a-z0-9-]{3,50}$/.test(slug)) {
    return NextResponse.json(
      { error: 'Slug inválido. Use apenas letras minúsculas, números e hífens (3–50 caracteres).' },
      { status: 400 },
    )
  }

  // Verificar unicidade de e-mail e slug
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1)
  if (existingUser) {
    return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })
  }

  const [existingStore] = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.slug, slug.toLowerCase().trim()))
    .limit(1)
  if (existingStore) {
    return NextResponse.json({ error: 'Esse slug já está em uso.' }, { status: 409 })
  }

  // Criar usuário
  const passwordHash = await hash(password, 12)
  const [user] = await db
    .insert(users)
    .values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    })
    .returning()

  // Criar loja (pending até escolher plano)
  const [store] = await db
    .insert(stores)
    .values({
      slug: slug.toLowerCase().trim(),
      name: name.trim(),
      ownerId: user.id,
      status: 'pending',
    })
    .returning()

  // Adicionar como lojista (convite aceito automaticamente)
  await db.insert(storeMembers).values({
    storeId: store.id,
    userId: user.id,
    role: 'lojista',
    acceptedAt: new Date(),
  })

  return NextResponse.json({ ok: true, email: user.email }, { status: 201 })
}
