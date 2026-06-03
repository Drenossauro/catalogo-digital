export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { stores, storeMembers, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import SuperAdminNav from '@/components/superadmin/SuperAdminNav'
import EditLojaForm from '@/components/superadmin/EditLojaForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditLojaPage({ params }: Props) {
  const { id } = await params

  const [store] = await db.select().from(stores).where(eq(stores.id, id)).limit(1)
  if (!store) notFound()

  // Busca o lojista (owner) via store_members
  const [ownerMember] = await db
    .select({ email: users.email })
    .from(storeMembers)
    .innerJoin(users, eq(users.id, storeMembers.userId))
    .where(and(eq(storeMembers.storeId, id), eq(storeMembers.role, 'lojista')))
    .limit(1)

  return (
    <>
      <SuperAdminNav />
      <main className="w-full px-4 py-6">
        <Link
          href="/superadmin/lojas"
          className="flex items-center gap-1 text-sm text-white/30 hover:text-white mb-6 w-fit transition-colors"
        >
          <ChevronLeft size={15} /> Voltar
        </Link>
        <div className="mb-8">
          <h1 className="font-serif text-xl text-white">{store.name}</h1>
          {ownerMember?.email && (
            <p className="text-xs text-white/30 mt-1">{ownerMember.email}</p>
          )}
        </div>
        <EditLojaForm store={{
          id: store.id,
          name: store.name,
          slug: store.slug,
          whatsappNumber: store.whatsappNumber,
          maxInstallments: store.maxInstallments,
          theme: store.theme,
        }} />
      </main>
    </>
  )
}
