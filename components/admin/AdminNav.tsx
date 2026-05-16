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
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        pathname === href
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {navItem('/admin/dashboard', 'Produtos', Package)}
          {navItem('/admin/configuracoes', 'Configurações', Settings)}
          {navItem('/', 'Ver catálogo', LayoutGrid)}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer px-2 py-2"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  )
}
