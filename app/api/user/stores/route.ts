import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { storeMembers, stores } from '@/lib/db/schema'
import { eq, and, isNotNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const memberships = await db
    .select({
      storeId: storeMembers.storeId,
      storeSlug: stores.slug,
      storeName: stores.name,
      role: storeMembers.role,
    })
    .from(storeMembers)
    .innerJoin(stores, eq(stores.id, storeMembers.storeId))
    .where(
      and(
        eq(storeMembers.userId, session.user.id),
        isNotNull(storeMembers.acceptedAt),
      ),
    )
    .orderBy(storeMembers.createdAt)

  return NextResponse.json(memberships)
}
