'use client'

import { signOut } from 'next-auth/react'
import { LogOut, Package, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()

  const navItem = (href: string, label: string, Icon: React.ElementType) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        pathname === href
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  )

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {navItem('/admin/dashboard', 'Produtos', Package)}
          {navItem('/', 'Ver catálogo', LayoutGrid)}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </header>
  )
}
