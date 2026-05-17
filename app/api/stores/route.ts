export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stores, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, slug, whatsappNumber, maxInstallments, theme, adminEmail, adminPassword } = body

  // Validate slug format
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'Slug inválido. Use apenas letras minúsculas, números e hífens.' },
      { status: 400 }
    )
  }

  if (!name || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
  }

  if (adminPassword.length < 8) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 })
  }

  // Check slug uniqueness
  const existing = await db.select({ id: stores.id }).from(stores).where(eq(stores.slug, slug)).limit(1)
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Esse slug já está em uso.' }, { status: 409 })
  }

  // Check email uniqueness
  const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, adminEmail)).limit(1)
  if (existingUser.length > 0) {
    return NextResponse.json({ error: 'Esse e-mail já está em uso.' }, { status: 409 })
  }

  // Insert store
  const [store] = await db.insert(stores).values({
    slug,
    name,
    whatsappNumber: whatsappNumber ?? '',
    maxInstallments: maxInstallments ?? '1',
    theme: theme ?? 'prata',
  }).returning()

  // Hash password and insert admin user
  const passwordHash = await hash(adminPassword, 12)
  await db.insert(users).values({
    email: adminEmail,
    passwordHash,
    storeId: store.id,
    role: 'admin',
  })

  return NextResponse.json(store, { status: 201 })
}
