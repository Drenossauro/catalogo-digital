export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

async function requireAuth() {
  const session = await auth()
  if (!session) return { deny: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null }
  return { deny: null, session }
}

export async function POST(req: NextRequest) {
  const { deny, session } = await requireAuth()
  if (deny) return deny

  const storeId = session!.user.storeId
  const body = await req.json()

  const [product] = await db.insert(products).values({
    name: body.name,
    description: body.description,
    price: body.price,
    categoryId: body.categoryId,
    imageUrl: body.imageUrl,
    active: body.active,
    storeId: body.storeId ?? storeId,
  }).returning()

  return NextResponse.json(product, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const { deny, session } = await requireAuth()
  if (deny) return deny

  const storeId = session!.user.storeId
  const body = await req.json()

  // Verify ownership: product must belong to the user's store
  if (storeId) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, body.id), eq(products.storeId, storeId)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const [product] = await db.update(products).set({
    name: body.name,
    description: body.description,
    price: body.price,
    categoryId: body.categoryId,
    imageUrl: body.imageUrl,
    active: body.active,
  }).where(eq(products.id, body.id)).returning()

  return NextResponse.json(product)
}

export async function DELETE(req: NextRequest) {
  const { deny, session } = await requireAuth()
  if (deny) return deny

  const storeId = session!.user.storeId
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Verify ownership
  if (storeId) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, id), eq(products.storeId, storeId)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  await db.delete(products).where(eq(products.id, id))
  return NextResponse.json({ ok: true })
}
