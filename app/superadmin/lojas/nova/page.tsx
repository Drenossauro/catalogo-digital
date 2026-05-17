import SuperAdminNav from '@/components/superadmin/SuperAdminNav'
import NovaLojaForm from '@/components/superadmin/NovaLojaForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NovaLojaPage() {
  return (
    <>
      <SuperAdminNav />
      <main className="w-full px-4 py-6">
        <Link
          href="/superadmin/lojas"
          className="flex items-center gap-1 text-sm text-[#1a1a1a]/40 hover:text-[#1a1a1a] mb-6 w-fit transition-colors"
        >
          <ChevronLeft size={15} /> Voltar
        </Link>
        <h1 className="font-serif text-xl text-[#1a1a1a] mb-8">Nova loja</h1>
        <NovaLojaForm />
      </main>
    </>
  )
}
