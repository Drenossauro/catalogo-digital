'use client'

import { signOut } from 'next-auth/react'
import { LogOut, Package, LayoutGrid, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()

  const navItem = (href: string, label: string, Icon: React.ElementType) => (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
        pathname === href
          ? 'text-[#1a1a1a] font-medium'
          : 'text-[#1a1a1a]/40 hover:text-[#1a1a1a]'
      }`}
    >
      <Icon size={15} strokeWidth={1.5} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )

  return (
    <header className="bg-[#FAF8F5] border-b border-black/8">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-serif text-base mr-3 text-[#1a1a1a]/30">✦</span>
          {navItem('/admin/dashboard', 'Produtos', Package)}
          {navItem('/admin/configuracoes', 'Configurações', Settings)}
          {navItem('/', 'Ver catálogo', LayoutGrid)}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-1.5 text-xs text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors cursor-pointer"
        >
          <LogOut size={14} strokeWidth={1.5} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  )
}
