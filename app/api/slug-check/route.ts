export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { stores } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') ?? ''

  if (!/^[a-z0-9-]{3,50}$/.test(slug)) {
    return NextResponse.json({ available: false, reason: 'formato' })
  }

  const [existing] = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.slug, slug))
    .limit(1)

  return NextResponse.json({ available: !existing })
}
