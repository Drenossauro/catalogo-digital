export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stores } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const storeId = session.user.storeId
  if (!storeId) return NextResponse.json({ error: 'No store associated with this account' }, { status: 400 })

  const { storeName, whatsappNumber, maxInstallments, theme, logoUrl } = await req.json()

  await db.update(stores).set({
    name: storeName,
    whatsappNumber,
    maxInstallments,
    theme,
    logoUrl,
    updatedAt: new Date(),
  }).where(eq(stores.id, storeId))

  return NextResponse.json({ ok: true })
}
