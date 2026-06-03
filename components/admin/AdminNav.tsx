'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOut, Package, Tags, Settings, ExternalLink, ShoppingBag, CreditCard, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/admin/dashboard', label: 'Produtos', Icon: Package, matchPrefix: '/admin/dashboard' },
  { href: '/admin/pedidos', label: 'Pedidos', Icon: ShoppingBag, matchPrefix: '/admin/pedidos' },
  { href: '/admin/categorias', label: 'Categorias', Icon: Tags, matchPrefix: '/admin/categorias' },
  { href: '/admin/configuracoes', label: 'Config', Icon: Settings, matchPrefix: '/admin/configuracoes' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const storeSlug = session?.user?.storeSlug ?? null
  const isAdmin = session?.user?.systemRole === 'admin'
  const isLojista = session?.user?.storeRole === 'lojista'

  return (
    <>
      {/* Top header */}
      <header className="bg-[#FAF8F5] border-b border-black/8 sticky top-0 z-30">
        <div className="w-full px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="font-serif text-[11px] text-[#FAF8F5] leading-none">✦</span>
            </div>
            <span className="font-serif text-base text-[#1a1a1a]">Vitrine</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-0.5">
            {TABS.map(({ href, label, Icon, matchPrefix }) => {
              const active = pathname.startsWith(matchPrefix)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                    active ? 'text-[#1a1a1a] font-medium' : 'text-[#1a1a1a]/40 hover:text-[#1a1a1a]'
                  }`}
                >
                  <Icon size={15} strokeWidth={1.5} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-0.5">
            {storeSlug && (
              <Link
                href={`/loja/${storeSlug}`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors"
                title="Ver catálogo"
              >
                <ExternalLink size={16} strokeWidth={1.5} />
                <span className="hidden sm:inline">Ver catálogo</span>
              </Link>
            )}
            <Link
              href="/admin/assinatura"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${
                pathname.startsWith('/admin/assinatura')
                  ? 'text-[#1a1a1a]'
                  : 'text-[#1a1a1a]/30 hover:text-[#1a1a1a]'
              }`}
              title="Assinatura"
            >
              <CreditCard size={16} strokeWidth={1.5} />
              <span>Plano</span>
            </Link>
            {isLojista && (
              <Link
                href="/admin/membros"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${
                  pathname.startsWith('/admin/membros')
                    ? 'text-[#1a1a1a]'
                    : 'text-[#1a1a1a]/30 hover:text-[#1a1a1a]'
                }`}
                title="Membros"
              >
                <Users size={16} strokeWidth={1.5} />
                <span>Membros</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/superadmin/lojas"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors"
                title="Painel Admin"
              >
                <span>Admin ↗</span>
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors cursor-pointer"
            >
              <LogOut size={16} strokeWidth={1.5} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8F5] border-t border-black/8">
        <div className="flex items-stretch h-16">
          {TABS.map(({ href, label, Icon, matchPrefix }) => {
            const active = pathname.startsWith(matchPrefix)
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  active ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/30'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 1.8 : 1.5} />
                <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
