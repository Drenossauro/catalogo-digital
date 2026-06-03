export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productVariants, products } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { canUseVariants } from '@/lib/plans'

async function requireAuth() {
  const session = await auth()
  if (!session?.user) return { deny: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null }
  return { deny: null, session }
}

// Verifica que o produto pertence à loja do usuário
async function verifyOwnership(productId: string, storeId: string) {
  const [p] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.storeId, storeId)))
    .limit(1)
  return !!p
}

export async function GET(req: NextRequest) {
  const { deny, session } = await requireAuth()
  if (deny) return deny
  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) return NextResponse.json([], { status: 200 })

  const rows = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId))
    .orderBy(productVariants.position)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { deny, session } = await requireAuth()
  if (deny) return deny

  const storeId = session!.user.storeId
  if (!storeId) return NextResponse.json({ error: 'No store' }, { status: 400 })

  // Gate de plano
  const gate = await canUseVariants(storeId)
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status })

  const { productId, label, options, required, position } = await req.json()

  if (!productId || !label?.trim()) {
    return NextResponse.json({ error: 'productId e label são obrigatórios.' }, { status: 400 })
  }

  const owns = await verifyOwnership(productId, storeId)
  if (!owns) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [variant] = await db
    .insert(productVariants)
    .values({ productId, label: label.trim(), options: options ?? [], required: !!required, position: position ?? 0 })
    .returning()

  return NextResponse.json(variant, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const { deny, session } = await requireAuth()
  if (deny) return deny

  const storeId = session!.user.storeId
  if (!storeId) return NextResponse.json({ error: 'No store' }, { status: 400 })

  const { id, label, options, required, position } = await req.json()
  if (!id) return NextResponse.json({ error: 'id obrigatório.' }, { status: 400 })

  // Verifica que a variante pertence a um produto do lojista
  const [existing] = await db
    .select({ productId: productVariants.productId })
    .from(productVariants)
    .where(eq(productVariants.id, id))
    .limit(1)

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const owns = await verifyOwnership(existing.productId, storeId)
  if (!owns) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [variant] = await db
    .update(productVariants)
    .set({
      ...(label && { label: label.trim() }),
      ...(options !== undefined && { options }),
      ...(required !== undefined && { required }),
      ...(position !== undefined && { position }),
    })
    .where(eq(productVariants.id, id))
    .returning()

  return NextResponse.json(variant)
}

export async function DELETE(req: NextRequest) {
  const { deny, session } = await requireAuth()
  if (deny) return deny

  const storeId = session!.user.storeId
  if (!storeId) return NextResponse.json({ error: 'No store' }, { status: 400 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const [existing] = await db
    .select({ productId: productVariants.productId })
    .from(productVariants)
    .where(eq(productVariants.id, id))
    .limit(1)

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const owns = await verifyOwnership(existing.productId, storeId)
  if (!owns) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.delete(productVariants).where(eq(productVariants.id, id))
  return NextResponse.json({ ok: true })
}
