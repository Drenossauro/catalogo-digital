import type { Metadata } from 'next'
import Link from 'next/link'
import { LayoutDashboard, Store, Users, CreditCard, Package } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin Sistema · Vitrine' }

const NAV = [
  { href: '/admin/sistema', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { href: '/admin/sistema/lojas', label: 'Lojas', Icon: Store },
  { href: '/admin/sistema/usuarios', label: 'Usuários', Icon: Users },
  { href: '/admin/sistema/planos', label: 'Planos', Icon: Package },
  { href: '/admin/sistema/assinaturas', label: 'Assinaturas', Icon: CreditCard },
]

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Top nav */}
      <header className="border-b border-white/8 sticky top-0 z-30 bg-[#0F0F0F]">
        <div className="w-full px-4 h-14 flex items-center gap-6">
          <Link href="/admin/sistema" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <span className="font-serif text-[11px] text-[#0F0F0F] leading-none">✦</span>
            </div>
            <span className="font-serif text-base text-white">Admin</span>
          </Link>

          <nav className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {NAV.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/40 hover:text-white transition-colors whitespace-nowrap"
              >
                <Icon size={14} strokeWidth={1.5} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto shrink-0">
            <Link href="/admin/dashboard" className="text-xs text-white/30 hover:text-white transition-colors">
              ← Painel loja
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-8 max-w-6xl">
        {children}
      </main>
    </div>
  )
}
