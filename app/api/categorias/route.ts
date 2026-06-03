export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories, products } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { canCreateCategory } from '@/lib/plans'

async function requireAuth() {
  const session = await auth()
  if (!session) return { deny: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null }
  return { deny: null, session }
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET() {
  const { deny, session } = await requireAuth()
  if (deny) return deny

  const storeId = session!.user.storeId
  if (!storeId) return NextResponse.json([], { status: 200 })

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      position: categories.position,
      createdAt: categories.createdAt,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.storeId, storeId)))
    .where(eq(categories.storeId, storeId))
    .groupBy(categories.id)
    .orderBy(categories.position, categories.name)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { deny, session } = await requireAuth()
  if (deny) return deny

  const storeId = session!.user.storeId
  if (!storeId) return NextResponse.json({ error: 'No store' }, { status: 400 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

  // Gate de plano: verificar limite de categorias
  const gate = await canCreateCategory(storeId)
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status })

  const baseSlug = toSlug(name.trim())
  let slug = baseSlug
  let attempt = 0

  // Garante unicidade do slug dentro da mesma loja
  while (true) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.slug, slug), eq(categories.storeId, storeId)))
      .limit(1)
    if (existing.length === 0) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const [cat] = await db.insert(categories).values({ name: name.trim(), slug, storeId }).returning()
  return NextResponse.json(cat, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const { deny, session } = await requireAuth()
  if (deny) return deny

  const storeId = session!.user.storeId
  const { id, name } = await req.json()
  if (!id || !name?.trim()) return NextResponse.json({ error: 'Campos obrigatórios' }, { status: 400 })

  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.storeId, storeId!)))
    .limit(1)
  if (!existing) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [cat] = await db
    .update(categories)
    .set({ name: name.trim() })
    .where(eq(categories.id, id))
    .returning()
  return NextResponse.json(cat)
}

export async function DELETE(req: NextRequest) {
  const { deny, session } = await requireAuth()
  if (deny) return deny

  const storeId = session!.user.storeId
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.storeId, storeId!)))
    .limit(1)
  if (!existing) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.delete(categories).where(eq(categories.id, id))
  return NextResponse.json({ ok: true })
}
