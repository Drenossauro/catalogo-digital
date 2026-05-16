export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { storeSettings } from '@/lib/db/schema'
import AdminNav from '@/components/admin/AdminNav'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function ConfiguracoesPage() {
  const rows = await db.select().from(storeSettings).limit(1)
  const settings = rows[0] ?? null

  return (
    <>
      <AdminNav />
      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="font-serif text-xl text-[#1a1a1a] mb-8">Configurações</h1>
        <SettingsForm settings={settings} />
      </main>
    </>
  )
}
