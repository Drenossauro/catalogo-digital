export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stores, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

async function requireSuperAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'superadmin') {
    return { deny: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), session: null }
  }
  return { deny: null, session }
}

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { deny } = await requireSuperAdmin()
  if (deny) return deny

  const { id } = await params
  const [store] = await db.select().from(stores).where(eq(stores.id, id)).limit(1)
  if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [adminUser] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.storeId, id))
    .limit(1)

  return NextResponse.json({ ...store, adminEmail: adminUser?.email ?? null })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { deny } = await requireSuperAdmin()
  if (deny) return deny

  const { id } = await params
  const body = await req.json()
  const { name, whatsappNumber, maxInstallments, theme } = body

  const [store] = await db
    .update(stores)
    .set({
      ...(name && { name }),
      ...(whatsappNumber !== undefined && { whatsappNumber }),
      ...(maxInstallments !== undefined && { maxInstallments }),
      ...(theme && { theme }),
      updatedAt: new Date(),
    })
    .where(eq(stores.id, id))
    .returning()

  if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(store)
}
