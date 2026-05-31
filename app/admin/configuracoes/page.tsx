export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stores } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import AdminNav from '@/components/admin/AdminNav'
import SettingsForm from '@/components/admin/SettingsForm'
import ShareCard from '@/components/admin/ShareCard'

export default async function ConfiguracoesPage() {
  const session = await auth()
  const storeId = session?.user?.storeId ?? null
  const storeSlug = session?.user?.storeSlug ?? null

  const storeData = storeId
    ? (await db.select().from(stores).where(eq(stores.id, storeId)).limit(1))[0] ?? null
    : null

  const settings = storeData
    ? {
        id: storeData.id,
        storeName: storeData.name,
        whatsappNumber: storeData.whatsappNumber,
        maxInstallments: storeData.maxInstallments,
        theme: storeData.theme,
        logoUrl: storeData.logoUrl,
      }
    : null

  return (
    <>
      <AdminNav />
      <main className="w-full px-4 py-6 max-w-lg">
        <h1 className="font-serif text-xl text-[#1a1a1a] mb-8">Configurações</h1>
        <SettingsForm settings={settings} />

        {storeSlug && (
          <div className="mt-12 pt-8 border-t border-black/8">
            <p className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider mb-4">Link do catálogo</p>
            <ShareCard path={`/loja/${storeSlug}`} />
          </div>
        )}
      </main>
    </>
  )
}
