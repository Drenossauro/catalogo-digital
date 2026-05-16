import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storeSettings } from '@/lib/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { storeName, whatsappNumber } = await req.json()

  const existing = await db.select().from(storeSettings).limit(1)

  if (existing.length > 0) {
    await db.update(storeSettings).set({ storeName, whatsappNumber, updatedAt: new Date() })
  } else {
    await db.insert(storeSettings).values({ storeName, whatsappNumber })
  }

  return NextResponse.json({ ok: true })
}
