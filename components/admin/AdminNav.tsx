'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOut, Package, Tags, Settings, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const storeSlug = session?.user?.storeSlug ?? null

  const navItem = (href: string, label: string, Icon: React.ElementType, matchPrefix?: string) => {
    const active = matchPrefix ? pathname.startsWith(matchPrefix) : pathname === href
    return (
      <Link
        href={href}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
          active ? 'text-[#1a1a1a] font-medium' : 'text-[#1a1a1a]/40 hover:text-[#1a1a1a]'
        }`}
      >
        <Icon size={15} strokeWidth={1.5} />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    )
  }

  return (
    <header className="bg-[#FAF8F5] border-b border-black/8">
      <div className="w-full px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <Link href="/admin/dashboard" className="flex items-center gap-2 mr-3 shrink-0">
            <div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="font-serif text-[10px] text-[#FAF8F5] leading-none">✦</span>
            </div>
            <span className="font-serif text-base text-[#1a1a1a] hidden sm:inline">Vitrine</span>
          </Link>
          {navItem('/admin/dashboard', 'Produtos', Package, '/admin/dashboard')}
          {navItem('/admin/categorias', 'Categorias', Tags, '/admin/categorias')}
          {navItem('/admin/configuracoes', 'Configurações', Settings, '/admin/configuracoes')}
        </div>
        <div className="flex items-center gap-1">
          {storeSlug && (
            <Link
              href={`/loja/${storeSlug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors"
              title="Ver catálogo"
            >
              <ExternalLink size={14} strokeWidth={1.5} />
              <span className="hidden sm:inline">Ver catálogo</span>
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors cursor-pointer"
          >
            <LogOut size={14} strokeWidth={1.5} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
