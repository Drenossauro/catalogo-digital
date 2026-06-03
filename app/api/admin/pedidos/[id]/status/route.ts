export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

const VALID_STATUSES = ['pending', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled']

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const storeId = session.user.storeId
  if (!storeId) return NextResponse.json({ error: 'No store' }, { status: 400 })

  const { id } = await params
  const { status, internalNotes } = await req.json()

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
  }

  const [order] = await db
    .update(orders)
    .set({
      ...(status && { status }),
      ...(internalNotes !== undefined && { internalNotes }),
      updatedAt: new Date(),
    })
    .where(and(eq(orders.id, id), eq(orders.storeId, storeId)))
    .returning()

  if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 })
  return NextResponse.json(order)
}
