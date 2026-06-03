export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { storeMembers, users } from '@/lib/db/schema'
import { eq, and, isNotNull } from 'drizzle-orm'
import AdminNav from '@/components/admin/AdminNav'
import MembrosClient from './MembrosClient'

export default async function MembrosPage() {
  const session = await auth()
  if (!session?.user) redirect('/admin/login')

  const storeId = session.user.storeId
  const isLojista = session.user.storeRole === 'lojista'

  if (!storeId || !isLojista) redirect('/admin/dashboard')

  const members = await db
    .select({
      id: storeMembers.id,
      role: storeMembers.role,
      acceptedAt: storeMembers.acceptedAt,
      createdAt: storeMembers.createdAt,
      email: users.email,
      name: users.name,
    })
    .from(storeMembers)
    .innerJoin(users, eq(users.id, storeMembers.userId))
    .where(eq(storeMembers.storeId, storeId))
    .orderBy(storeMembers.createdAt)

  return (
    <>
      <AdminNav />
      <main className="w-full px-4 py-6 max-w-lg">
        <h1 className="font-serif text-xl text-[#1a1a1a] mb-8">Membros</h1>
        <MembrosClient members={members} />
      </main>
    </>
  )
}
