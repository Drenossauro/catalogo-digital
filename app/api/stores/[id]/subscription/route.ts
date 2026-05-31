export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stores } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { action } = await req.json()

  let update: { subscriptionStatus: string; subscriptionExpiresAt?: Date | null }

  if (action === 'renew') {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    update = { subscriptionStatus: 'active', subscriptionExpiresAt: expiresAt }
  } else if (action === 'suspend') {
    update = { subscriptionStatus: 'suspended' }
  } else if (action === 'reactivate') {
    update = { subscriptionStatus: 'active' }
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const [store] = await db.update(stores).set(update).where(eq(stores.id, id)).returning()
  if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(store)
}
