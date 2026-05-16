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
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Configurações da loja</h1>
        <SettingsForm settings={settings} />
      </main>
    </>
  )
}
